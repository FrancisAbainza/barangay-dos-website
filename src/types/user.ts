import type { ImageItem } from "./shared";

export interface UserProfile {
  uid: string;
  email: string | null;
  fullName: string;
  role: string;
  banned: boolean;
  savedPostIds: string[];
  profilePicture?: ImageItem;
  createdAt: string;
  updatedAt: string;
}
