"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBarangayProfile,
  updateBarangayHeader,
} from "@/services/about-us-service";
import { uploadSingleImage, deleteSingleImage } from "@/services/storage-service";
import type { ImageItem, BarangayProfile } from "@/types";
import type { ImageItem as FormImageItem } from "@/components/single-image-uploader";

export const barangayProfileKeys = {
  all: ["barangayProfile"] as const,
};

export function useBarangayProfile() {
  return useQuery({
    queryKey: barangayProfileKeys.all,
    queryFn: getBarangayProfile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateBarangayHeader() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      address: string;
      tagline: string;
      barangayLogo?: FormImageItem;
      skLogo?: FormImageItem;
      oldBarangayLogo?: FormImageItem;
      oldSkLogo?: FormImageItem;
    }) => {
      // Upload both logos to Firebase Storage
      const [uploadedBarangayLogo, uploadedSkLogo] = await Promise.all([
        uploadSingleImage(data.barangayLogo, "about-us/barangay-logo"),
        uploadSingleImage(data.skLogo, "about-us/sk-logo"),
      ]);

      // Persist the updated header to Firestore
      await updateBarangayHeader({
        name: data.name,
        address: data.address,
        tagline: data.tagline,
        barangayLogo: uploadedBarangayLogo,
        skLogo: uploadedSkLogo,
      });

      // Delete old logos if they were replaced
      if (
        data.oldBarangayLogo &&
        data.oldBarangayLogo.path !== uploadedBarangayLogo?.path
      ) {
        await deleteSingleImage(data.oldBarangayLogo);
      }
      if (data.oldSkLogo && data.oldSkLogo.path !== uploadedSkLogo?.path) {
        await deleteSingleImage(data.oldSkLogo);
      }

      return {
        name: data.name,
        address: data.address,
        tagline: data.tagline,
        barangayLogo: uploadedBarangayLogo,
        skLogo: uploadedSkLogo,
      };
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData<BarangayProfile>(
        barangayProfileKeys.all,
        (old) => (old ? { ...old, ...updatedData } : undefined),
      );
    },
  });
}
