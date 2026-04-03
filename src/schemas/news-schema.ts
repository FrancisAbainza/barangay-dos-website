import z from "zod";
import type { ImageItem } from "@/components/multi-image-uploader";
import type { AttachmentItem } from "@/components/attachment-picker";

export const newsFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.enum(["Announcement", "Event", "Emergency"], {
    error: "Please select a category",
  }),
  content: z.string().min(10, "Content must be at least 10 characters"),
  pinned: z.boolean(),
  images: z.array(z.custom<ImageItem>()).optional(),
  attachments: z.array(z.custom<AttachmentItem>()).optional(),
});

export type NewsFormValues = z.infer<typeof newsFormSchema>;
