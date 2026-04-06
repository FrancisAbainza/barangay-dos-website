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

// NewsPostData extends the form values with server-side author metadata
// that is not part of the form itself (resolved from the auth context).
export interface NewsPostData extends NewsFormValues {
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  authorRole: string;
}

export interface Reply {
  id: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  date: Date;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  date: Date;
  replies: Reply[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: string;
}

export interface MediaEntry {
  url: string;
  type: "image" | "video";
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  media?: MediaEntry[];
  authorName: string;
  authorAvatarUrl?: string;
  authorRole: string;
  date: Date;
  category: Category;
  likes: number;
  dislikes: number;
  comments: Comment[];
  attachments?: Attachment[];
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
