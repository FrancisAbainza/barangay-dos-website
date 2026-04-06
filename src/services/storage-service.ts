"use client";

import { storage } from "@/lib/firebase/client";
import type { ImageItem } from "@/components/multi-image-uploader";
import type { MediaItem } from "@/components/media-uploader";
import type { AttachmentItem } from "@/components/attachment-picker";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

export const uploadMultiplePostImages = async (images: ImageItem[], basePath: string) => {
  const uploadPromises = images.map(async (image) => {
    if (!!image?.path) {
      // Image already uploaded
      return image;
    }

    // 1. Create unique reference
    const path = `${basePath}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
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

export const uploadMultipleAttachments = async (
  attachments: AttachmentItem[],
  basePath: string,
): Promise<AttachmentItem[]> => {
  const uploadPromises = attachments.map(async (attachment) => {
    // If the attachment already has a storage path, it was previously uploaded — skip re-upload.
    if (attachment.path) return attachment;

    // Generate a unique path under the given base using a timestamp + random suffix.
    const path = `${basePath}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const storageRef = ref(storage, path);

    // Upload the raw File to Firebase Storage.
    const snapshot = await uploadBytes(storageRef, attachment.uri as File);

    // Retrieve the public download URL for the uploaded file.
    const url = await getDownloadURL(snapshot.ref);

    return {
      uri: url,
      path,
      name: attachment.name,
      size: attachment.size,
    } satisfies AttachmentItem;
  });

  return Promise.all(uploadPromises);
};

export const uploadMultipleMedia = async (
  media: MediaItem[],
  basePath: string,
): Promise<MediaItem[]> => {
  const uploadPromises = media.map(async (item) => {
    if (item.path) return item; // already uploaded

    const path = `${basePath}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const storageRef = ref(storage, path);

    const snapshot = await uploadBytes(storageRef, item.uri as File);
    const url = await getDownloadURL(snapshot.ref);

    return {
      uri: url,
      path,
      type: item.type,
    } satisfies MediaItem;
  });

  return Promise.all(uploadPromises);
};