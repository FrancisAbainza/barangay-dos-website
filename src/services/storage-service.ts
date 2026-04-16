"use client";

import { storage } from "@/lib/firebase/client";
import type { ImageItem as FormImageItem } from "@/components/multi-image-uploader";
import type { MediaItem as FormMediaItem } from "@/components/media-uploader";
import type { AttachmentItem as FormAttachmentItem } from "@/components/attachment-picker";
import type { ImageItem, MediaItem, AttachmentItem } from "@/types";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

export const uploadMultiplePostImages = async (
  images: FormImageItem[],
  basePath: string,
): Promise<ImageItem[]> => {
  const uploadPromises = images.map(async (image): Promise<ImageItem> => {
    if (image.path) {
      // Already uploaded — uri is a download URL string, path is a storage path.
      return { uri: image.uri as string, path: image.path };
    }

    // 1. Create unique reference
    const path = `${basePath}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const storageRef = ref(storage, path);

    // 2. Upload
    const snapshot = await uploadBytes(storageRef, image.uri as File);

    // 3. Get URL
    const url = await getDownloadURL(snapshot.ref);

    return { uri: url, path };
  });

  return Promise.all(uploadPromises);
};

export const deleteImagesByPath = async (images: { path?: string }[]) => {
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
  attachments: FormAttachmentItem[],
  basePath: string,
): Promise<AttachmentItem[]> => {
  const uploadPromises = attachments.map(async (attachment): Promise<AttachmentItem> => {
    // If the attachment already has a storage path, it was previously uploaded — skip re-upload.
    if (attachment.path) {
      return {
        uri: attachment.uri as string,
        path: attachment.path,
        name: attachment.name,
        size: attachment.size ?? "",
      };
    }

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
      size: attachment.size ?? "",
    };
  });

  return Promise.all(uploadPromises);
};

export const uploadMultipleMedia = async (
  media: FormMediaItem[],
  basePath: string,
): Promise<MediaItem[]> => {
  const uploadPromises = media.map(async (item): Promise<MediaItem> => {
    if (item.path) {
      // Already uploaded.
      return { uri: item.uri as string, path: item.path, type: item.type };
    }

    const path = `${basePath}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const storageRef = ref(storage, path);

    const snapshot = await uploadBytes(storageRef, item.uri as File);
    const url = await getDownloadURL(snapshot.ref);

    return { uri: url, path, type: item.type };
  });

  return Promise.all(uploadPromises);
};