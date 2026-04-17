"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getOfficials,
  addOfficial,
  updateOfficial,
  deleteOfficial,
} from "@/services/about-us-service";
import {
  uploadSingleImage,
  deleteSingleImage,
} from "@/services/storage-service";
import type { Official, ImageItem, OfficialType } from "@/types/about-us";
import type { ImageItem as FormImageItem } from "@/components/single-image-uploader";

// ── Query Keys ─────────────────────────────────────────────────

export const officialsKeys = {
  all: ["officials"] as const,
  list: (type: OfficialType) => [...officialsKeys.all, type] as const,
};

// ── Query Hooks ────────────────────────────────────────────────

export function useOfficials(type: OfficialType) {
  return useQuery({
    queryKey: officialsKeys.list(type),
    queryFn: () => getOfficials(type),
  });
}

// ── Add Official Mutation ──────────────────────────────────────

export function useAddOfficial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      type,
      data,
    }: {
      type: OfficialType;
      data: { fullName: string; role: string; picture?: FormImageItem };
    }) => {
      // Upload the image to Firebase Storage first
      const uploadedPicture = await uploadSingleImage(
        data.picture,
        `officials/${type}`,
      );

      // Then persist to Firestore with the uploaded image URL
      const docId = await addOfficial(type, {
        fullName: data.fullName,
        role: data.role,
        picture: uploadedPicture,
      });

      return { docId, uploadedPicture };
    },
    onSuccess: ({ docId, uploadedPicture }, { type, data }) => {
      queryClient.setQueryData<Official[]>(officialsKeys.list(type), (old) => [
        ...(old ?? []),
        {
          id: docId,
          fullName: data.fullName,
          role: data.role,
          picture: uploadedPicture,
        },
      ]);
    },
  });
}

// ── Update Official Mutation ───────────────────────────────────

export function useUpdateOfficial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      type,
      id,
      data,
      oldPicture,
    }: {
      type: OfficialType;
      id: string;
      data: { fullName: string; role: string; picture?: FormImageItem };
      oldPicture?: ImageItem;
    }) => {
      // Upload the new image to Firebase Storage
      const uploadedPicture = await uploadSingleImage(
        data.picture,
        `officials/${type}`,
      );

      // Persist the updated official to Firestore
      await updateOfficial(type, id, {
        fullName: data.fullName,
        role: data.role,
        picture: uploadedPicture,
      });

      // Delete the old image if it exists and is different from the new one
      if (oldPicture && oldPicture.path !== uploadedPicture?.path) {
        await deleteSingleImage(oldPicture);
      }

      return uploadedPicture;
    },
    onSuccess: (uploadedPicture, { type, id, data }) => {
      queryClient.setQueryData<Official[]>(officialsKeys.list(type), (old) =>
        old?.map((o) =>
          o.id === id
            ? {
                ...o,
                fullName: data.fullName,
                role: data.role,
                picture: uploadedPicture,
              }
            : o,
        ),
      );
    },
  });
}

// ── Delete Official Mutation (Optimistic) ──────────────────────

export function useDeleteOfficial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      type,
      id,
      picture,
    }: {
      type: OfficialType;
      id: string;
      picture?: ImageItem;
    }) => {
      // Delete the picture from Firebase Storage first
      if (picture) {
        await deleteSingleImage(picture);
      }

      // Then delete the official document from Firestore
      await deleteOfficial(type, id);
    },
    onMutate: async ({ type, id }) => {
      await queryClient.cancelQueries({ queryKey: officialsKeys.list(type) });
      const prev = queryClient.getQueryData<Official[]>(
        officialsKeys.list(type),
      );
      queryClient.setQueryData<Official[]>(officialsKeys.list(type), (old) =>
        old?.filter((o) => o.id !== id),
      );
      return { prev, type };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(
          officialsKeys.list(context.type),
          context.prev,
        );
      }
    },
  });
}
