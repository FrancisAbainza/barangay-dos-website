"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { Comment } from "@/schemas/news-schema";
import { formatDate, getInitials } from "./news-helpers";
import { ReplyItem } from "./reply-item";

export function CommentItem({
  comment,
  currentUser,
  onAddReply,
}: {
  comment: Comment;
  currentUser: string;
  onAddReply: (commentId: string, text: string) => void;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [replyText, setReplyText] = useState("");

  function handleSubmitReply() {
    if (!replyText.trim()) return;
    onAddReply(comment.id, replyText.trim());
    setReplyText("");
    setShowReplyForm(false);
  }

  return (
    <div className="space-y-1">
      {/* Comment bubble */}
      <div className="flex gap-2">
        <Avatar size="sm">
          <AvatarImage src={comment.authorAvatarUrl} />
          <AvatarFallback className="text-xs">
            {getInitials(comment.authorName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="bg-muted rounded-lg px-3 py-2">
            <p className="text-sm font-semibold leading-tight">
              {comment.authorName}
            </p>
            <p className="text-sm mt-0.5 whitespace-pre-wrap wrap-break-word">
              {comment.content}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-1 ml-1 flex-wrap">
            <p className="text-xs text-muted-foreground">
              {formatDate(comment.date)}
            </p>
            <button
              className="text-xs font-semibold text-primary hover:underline"
              onClick={() => setShowReplyForm((v) => !v)}
            >
              Reply
            </button>
            {comment.replies.length > 0 && (
              <button
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                onClick={() => setShowReplies((v) => !v)}
              >
                {showReplies ? (
                  <ChevronUp className="size-3" />
                ) : (
                  <ChevronDown className="size-3" />
                )}
                {comment.replies.length}{" "}
                {comment.replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies list */}
      {showReplies && comment.replies.length > 0 && (
        <div className="ml-9 space-y-1">
          {comment.replies.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} />
          ))}
        </div>
      )}

      {/* Reply input */}
      {showReplyForm && (
        <div className="ml-9 flex gap-2 pt-1">
          <Avatar size="sm">
            <AvatarFallback className="text-xs">
              {getInitials(currentUser)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-1.5">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply as ${currentUser}…`}
              className="min-h-14 text-sm resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                  handleSubmitReply();
              }}
            />
            <Button
              size="icon"
              onClick={handleSubmitReply}
              disabled={!replyText.trim()}
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
