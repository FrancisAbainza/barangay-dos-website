import { AlertTriangle, CalendarDays, Megaphone } from "lucide-react";
import type { MediaItem, AttachmentItem } from "./shared";

export type Category = "Announcement" | "Event" | "Emergency";

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
  { className: string; icon: React.ElementType }
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
