"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { NewsPost, CATEGORY_CONFIG } from "@/schemas/news-schema";
import { formatDate, getInitials } from "@/lib/utils";
import { useNews } from "@/contexts/news-context";

export function PostPreview({
  post,
  onClick,
}: {
  post: NewsPost;
  onClick?: () => void;
}) {
  const { authors } = useNews();
  const author = authors[post.authorId];
  const authorName = author?.fullName ?? "Unknown";

  const categoryConfig = CATEGORY_CONFIG[post.category];
  const CategoryIcon = categoryConfig.icon;

  return (
    <div
      className={cn(
        "space-y-2",
        onClick && "cursor-pointer hover:opacity-75 transition-opacity"
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
    >
      <Badge className={cn("gap-1 text-xs", categoryConfig.className)}>
        <CategoryIcon className="size-3" />
        {post.category}
      </Badge>
      <p className="text-sm font-semibold leading-snug line-clamp-2">
        {post.title}
      </p>
      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
        {post.content}
      </p>
      <Separator />
      <div className="flex items-center gap-1.5">
        <Avatar size="sm">
          <AvatarImage src={author?.avatarUrl} />
          <AvatarFallback className="text-xs">
            {getInitials(authorName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-xs font-medium truncate">{authorName}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(post.date)}
          </p>
        </div>
      </div>
    </div>
  );
}
