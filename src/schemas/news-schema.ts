import z from "zod";
import type { Category } from "@/types/news";
import type { MediaItem as FormMediaItem } from "@/components/media-uploader";
import type { AttachmentItem as FormAttachmentItem } from "@/components/attachment-picker";

export const categorySchema = z.enum(["Announcement", "Event", "Emergency"], {
  error: "Please select a category",
});

export const newsFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: categorySchema,
  content: z.string().min(10, "Content must be at least 10 characters"),
  pinned: z.boolean(),
  media: z.array(z.custom<FormMediaItem>()).optional(),
  attachments: z.array(z.custom<FormAttachmentItem>()).optional(),
});

export type NewsFormValues = z.infer<typeof newsFormSchema>;
