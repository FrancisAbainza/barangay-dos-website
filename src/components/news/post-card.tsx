"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  FileText,
  Send,
  Megaphone,
  Paperclip,
  ExternalLink,
  Facebook,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NewsPost, Comment, Reply, CATEGORY_CONFIG } from "@/schemas/news-schema";
import { formatDate, getInitials } from "./news-helpers";
import { MediaGallery } from "./image-gallery";
import { CommentItem } from "./comment-item";

export function PostCard({
  post,
  currentUserName,
  isSaved,
  onToggleSave,
}: {
  post: NewsPost;
  currentUserName: string;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const [localPost, setLocalPost] = useState(post);
  const [userReaction, setUserReaction] = useState<"like" | "dislike" | null>(
    null
  );
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const categoryConfig = CATEGORY_CONFIG[localPost.category];
  const CategoryIcon = categoryConfig.icon;

  function handleReaction(type: "like" | "dislike") {
    const isRemoving = userReaction === type;
    const wasOther = userReaction !== null && userReaction !== type;
    setLocalPost((prev) => ({
      ...prev,
      likes:
        type === "like"
          ? isRemoving
            ? prev.likes - 1
            : prev.likes + 1
          : wasOther
            ? prev.likes - 1
            : prev.likes,
      dislikes:
        type === "dislike"
          ? isRemoving
            ? prev.dislikes - 1
            : prev.dislikes + 1
          : wasOther
            ? prev.dislikes - 1
            : prev.dislikes,
    }));
    setUserReaction(isRemoving ? null : type);
  }

  function handleAddComment() {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `c-${Date.now()}`,
      authorName: currentUserName,
      content: newComment.trim(),
      date: new Date(),
      replies: [],
    };
    setLocalPost((prev) => ({
      ...prev,
      comments: [...prev.comments, comment],
    }));
    setNewComment("");
  }

  function handleAddReply(commentId: string, text: string) {
    const reply: Reply = {
      id: `r-${Date.now()}`,
      authorName: currentUserName,
      content: text,
      date: new Date(),
    };
    setLocalPost((prev) => ({
      ...prev,
      comments: prev.comments.map((c) =>
        c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c
      ),
    }));
  }

  function handleShare() {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <Card className="overflow-hidden shadow-sm py-0">
      <CardContent className="p-0">
        {/* ── Post Header ── */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={localPost.authorAvatarUrl} />
                <AvatarFallback>
                  {getInitials(localPost.authorName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold leading-tight">
                  {localPost.authorName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <p className="text-xs text-muted-foreground">
                    {localPost.authorRole}
                  </p>
                  <span className="text-xs text-muted-foreground">·</span>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(localPost.date)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge className={cn("gap-1", categoryConfig.className)}>
                <CategoryIcon className="size-3" />
                {localPost.category}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-primary"
                onClick={onToggleSave}
              >
                {isSaved ? (
                  <BookmarkCheck className="size-4 text-primary" />
                ) : (
                  <Bookmark className="size-4" />
                )}
              </Button>
            </div>
          </div>

          <h2 className="text-base font-bold mt-3 leading-snug">
            {localPost.title}
          </h2>
          <p className="text-sm text-foreground/80 mt-1.5 whitespace-pre-wrap leading-relaxed">
            {localPost.content}
          </p>
        </div>

        {/* ── Media ── */}
        {localPost.media && localPost.media.length > 0 && (
          <div className="px-4">
            <MediaGallery media={localPost.media} />
          </div>
        )}

        {/* ── Attachments ── */}
        {localPost.attachments && localPost.attachments.length > 0 && (
          <div className="px-4 mt-3">
            <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
              <Paperclip className="size-3" />
              Attachments
            </p>
            <div className="space-y-1.5">
              {localPost.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-md border border-border bg-muted/40 px-3 py-2 hover:bg-muted transition-colors group"
                >
                  <FileText className="size-4 text-destructive shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {att.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{att.size}</p>
                  </div>
                  <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Reaction & Comment summary ── */}
        <div className="px-4 mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {(localPost.likes > 0 || localPost.dislikes > 0) && (
              <>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="size-3" />
                  {localPost.likes}
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsDown className="size-3" />
                  {localPost.dislikes}
                </span>
              </>
            )}
          </div>
          <button
            className="hover:underline"
            onClick={() => setShowComments((v) => !v)}
          >
            {localPost.comments.length}{" "}
            {localPost.comments.length === 1 ? "comment" : "comments"}
          </button>
        </div>

        <Separator className="mt-2" />

        {/* ── Action Buttons ── */}
        <div className="px-2 py-1 grid grid-cols-4">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1.5 text-muted-foreground font-normal",
              userReaction === "like" &&
                "text-primary font-semibold hover:text-primary"
            )}
            onClick={() => handleReaction("like")}
          >
            <ThumbsUp className="size-4" />
            <span className="hidden sm:inline">Like</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1.5 text-muted-foreground font-normal",
              userReaction === "dislike" &&
                "text-destructive font-semibold hover:text-destructive"
            )}
            onClick={() => handleReaction("dislike")}
          >
            <ThumbsDown className="size-4" />
            <span className="hidden sm:inline">Dislike</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1.5 text-muted-foreground font-normal",
              showComments && "text-foreground"
            )}
            onClick={() => setShowComments((v) => !v)}
          >
            <MessageSquare className="size-4" />
            <span className="hidden sm:inline">Comment</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground font-normal"
            onClick={handleShare}
          >
            <Facebook className="size-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>

        {/* ── Comments Section ── */}
        {showComments && (
          <div className="px-4 pb-4">
            <Separator className="mb-4" />
            <div className="space-y-3">
              {localPost.comments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No comments yet. Be the first to comment!
                </p>
              )}
              {localPost.comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUser={currentUserName}
                  onAddReply={handleAddReply}
                />
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Avatar size="sm">
                <AvatarFallback className="text-xs">
                  {getInitials(currentUserName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-1.5">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={`Comment as ${currentUserName}…`}
                  className="min-h-14 text-sm resize-none"
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
