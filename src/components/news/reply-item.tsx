"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Reply } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { useNewsAuthors, useDeleteReply } from "@/hooks/use-news-queries";
import { formatDate, getInitials } from "@/lib/utils";

export function ReplyItem({
  reply,
  postId,
  commentId,
}: {
  reply: Reply;
  postId: string;
  commentId: string;
}) {
  const authors = useNewsAuthors();
  const deleteReply = useDeleteReply();
  const { userProfile } = useAuth();
  const author = authors[reply.authorId];
  const authorName = author?.fullName ?? reply.authorId;
  const authorAvatar = author?.avatarUrl;

  const canDelete =
    userProfile?.uid === reply.authorId ||
    userProfile?.role === "Admin" ||
    userProfile?.role === "Super Admin";

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
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold leading-tight">{authorName}</p>
            {(author?.role === "Admin" || author?.role === "Super Admin") && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 leading-none">Admin</Badge>
            )}
          </div>
          <p className="text-sm mt-0.5 whitespace-pre-wrap wrap-break-word">
            {reply.content}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-1 ml-1">
          <p className="text-xs text-muted-foreground">{formatDate(reply.date)}</p>
          {canDelete && (
            <button
              className="text-xs font-semibold text-destructive hover:underline"
              onClick={() => deleteReply.mutate({ postId, commentId, replyId: reply.id })}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
