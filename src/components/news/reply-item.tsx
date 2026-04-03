"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Reply } from "./types";
import { formatDate, getInitials } from "./news-helpers";

export function ReplyItem({ reply }: { reply: Reply }) {
  return (
    <div className="flex gap-2 mt-2 pl-2 border-l-2 border-border">
      <Avatar size="sm">
        <AvatarImage src={reply.authorAvatarUrl} />
        <AvatarFallback className="text-xs">
          {getInitials(reply.authorName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-accent rounded-lg px-3 py-2">
          <p className="text-sm font-semibold leading-tight">
            {reply.authorName}
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
