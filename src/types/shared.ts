export interface ImageItem {
  uri: string;
  path: string;
}

export interface MediaItem {
  uri: string;
  path: string;
  type: "image" | "video";
}

export interface AttachmentItem {
  uri: string;
  path: string;
  name: string;
  size: string;
}
