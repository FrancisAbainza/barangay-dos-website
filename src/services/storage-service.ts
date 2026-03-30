"use client";

import { storage } from "@/lib/firebase/client";
import type { ImageItem } from "@/components/multi-image-uploader";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

export const uploadMultiplePostImages = async (images: ImageItem[], collection: string, id: string) => {
  const uploadPromises = images.map(async (image) => {
    if (!!image?.path) {
      // Image already uploaded
      return image;
    }

    // 1. Create unique reference
    const path = `${collection}/${id}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const storageRef = ref(storage, path);

    // 2. Upload
    const snapshot = await uploadBytes(storageRef, image.uri as File);

    // 5. Get URL
    const url = await getDownloadURL(snapshot.ref);

    return {
      uri: url,
      path,
    };
  });

  // Execute all uploads in parallel
  const uploadedImages = await Promise.all(uploadPromises);

  // Return uploaded images
  return uploadedImages;
}


export const deleteImagesByPath = async (images: ImageItem[]) => {
  const deletePromises = images.map((image) => {
    // Basic guard: if no path, return a resolved promise
    if (!image?.path) return Promise.resolve();

    const imageRef = ref(storage, image.path);
    return deleteObject(imageRef);
  });

  // Now the parent's try/catch will actually wait here
  await Promise.all(deletePromises);
};