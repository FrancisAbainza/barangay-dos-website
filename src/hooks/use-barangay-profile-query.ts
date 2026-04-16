"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBarangayProfile,
  updateBarangayHeader,
} from "@/services/about-us-service";
import type { ImageItem, BarangayProfile } from "@/types";

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
    mutationFn: (data: {
      name: string;
      address: string;
      tagline: string;
      barangayLogo?: ImageItem;
      skLogo?: ImageItem;
    }) => updateBarangayHeader(data),
    onSuccess: (_, data) => {
      queryClient.setQueryData<BarangayProfile>(barangayProfileKeys.all, data);
    },
  });
}
