import z from "zod";
import type { ImageItem } from "@/components/multi-image-uploader";

export const editProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  profilePicture: z.array(z.custom<ImageItem>()).optional(),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
