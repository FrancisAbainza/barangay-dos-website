"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useAddComment } from "@/hooks/use-news-queries";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { NewsPost } from "@/types";
import { CommentItem } from "./comment-item";

interface PostCommentsProps {
  post: NewsPost;
}

export function PostComments({ post }: PostCommentsProps) {
  const { userProfile } = useAuth();
  const addComment = useAddComment();
  const currentUserName = userProfile?.fullName ?? "Guest User";
  const [newComment, setNewComment] = useState("");

  function handleAddComment() {
    if (!newComment.trim()) return;
    addComment.mutate({ postId: post.id, content: newComment.trim() });
    setNewComment("");
  }

  return (
    <div className="px-4 pb-5">
      <Separator className="mb-4" />
      <div className="space-y-3">
        {post.comments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No comments yet. Be the first to comment!
          </p>
        )}
        {post.comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={post.id}
          />
        ))}
      </div>
      {userProfile && (
        <div className="flex gap-2 mt-4">
          <Avatar size="sm">
            <AvatarFallback className="text-xs">
              {getInitials(currentUserName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-1.5 min-w-0">
            <Textarea
              id="post-comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`Comment as ${currentUserName}…`}
              className="min-h-14 text-sm resize-none w-full min-w-0"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                  handleAddComment();
              }}
            />
            <Button
              size="icon"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="shrink-0 self-end"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
