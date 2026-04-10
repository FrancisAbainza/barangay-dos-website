"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Reply } from "@/schemas/news-schema";
import { useNews } from "@/contexts/news-context";
import { formatDate, getInitials } from "@/lib/utils";

export function ReplyItem({ reply }: { reply: Reply }) {
  const { authors } = useNews();
  const author = authors[reply.authorId];
  const authorName = author?.fullName ?? reply.authorId;
  const authorAvatar = author?.avatarUrl;

  return (
    <div className="flex gap-2 mt-2 pl-2 border-l-2 border-border">
      <Avatar size="sm">
        <AvatarImage src={authorAvatar} />
        <AvatarFallback className="text-xs">
          {getInitials(authorName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-accent rounded-lg px-3 py-2">
          <p className="text-sm font-semibold leading-tight">
            {authorName}
          </p>
          <p className="text-sm mt-0.5 whitespace-pre-wrap wrap-break-word">
            {reply.content}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-1">
          {formatDate(reply.date)}
        </p>
      </div>
    </div>
  );
}
