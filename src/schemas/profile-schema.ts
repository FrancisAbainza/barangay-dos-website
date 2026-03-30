import z from "zod";
import type { ImageItem } from "@/components/multi-image-uploader";

export const editProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  profilePicture: z.array(z.custom<ImageItem>()).optional(),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;

// UserProfile extends the editable form fields so adding a new field to the
// schema automatically surfaces it here. profilePicture is optional for users
// who have not set one yet.
export interface UserProfile extends EditProfileFormValues  {
  uid: string;
  email: string | null;
  role: string;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
};
