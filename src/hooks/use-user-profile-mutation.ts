"use client";

import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "@/services/user-service";
import { uploadSingleImage, deleteSingleImage } from "@/services/storage-service";
import type { ImageItem } from "@/types";
import type { ImageItem as FormImageItem } from "@/components/single-image-uploader";

export function useUpdateUserProfile() {
  return useMutation({
    mutationFn: async (data: {
      userId: string;
      fullName: string;
      profilePicture?: FormImageItem;
      oldProfilePicture?: ImageItem;
    }) => {
      // Upload the new profile picture to Firebase Storage
      const uploadedPicture = await uploadSingleImage(
        data.profilePicture,
        `profiles/${data.userId}`,
      );

      // Persist the updated profile to Firestore
      await updateUserProfile(data.userId, {
        fullName: data.fullName,
        profilePicture: uploadedPicture,
      });

      // Delete the old picture if it was replaced
      if (
        data.oldProfilePicture &&
        data.oldProfilePicture.path !== uploadedPicture?.path
      ) {
        await deleteSingleImage(data.oldProfilePicture);
      }

      return {
        fullName: data.fullName,
        profilePicture: uploadedPicture,
      };
    },
  });
}
