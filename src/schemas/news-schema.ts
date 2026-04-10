import z from "zod";
import { AlertTriangle, CalendarDays, Megaphone } from "lucide-react";
import type { MediaItem } from "@/components/media-uploader";
import type { AttachmentItem } from "@/components/attachment-picker";

export const categorySchema = z.enum(["Announcement", "Event", "Emergency"], {
  error: "Please select a category",
});
export type Category = z.infer<typeof categorySchema>;

export const newsFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: categorySchema,
  content: z.string().min(10, "Content must be at least 10 characters"),
  pinned: z.boolean(),
  media: z.array(z.custom<MediaItem>()).optional(),
  attachments: z.array(z.custom<AttachmentItem>()).optional(),
});

export type NewsFormValues = z.infer<typeof newsFormSchema>;

export interface Reply {
  id: string;
  authorId: string;
  content: string;
  date: Date;
}
export interface Comment {
  id: string;
  authorId: string;
  content: string;
  date: Date;
  replies: Reply[];
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  media?: MediaItem[];
  authorId: string;
  date: Date;
  category: Category;
  likes: string[];
  dislikes: string[];
  comments: Comment[];
  attachments?: AttachmentItem[];
  pinned?: boolean;
}

export const CATEGORY_CONFIG: Record<
  Category,
  {
    className: string;
    icon: React.ElementType;
  }
> = {
  Announcement: {
    icon: Megaphone,
    className: "bg-primary text-primary-foreground border-transparent",
  },
  Event: {
    icon: CalendarDays,
    className: "bg-secondary text-secondary-foreground border-transparent",
  },
  Emergency: {
    icon: AlertTriangle,
    className: "bg-destructive text-white border-transparent",
  },
};
