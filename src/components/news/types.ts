import { AlertTriangle, CalendarDays, Megaphone } from "lucide-react";

export type Category = "Announcement" | "Event" | "Emergency";

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

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  images?: string[];
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
