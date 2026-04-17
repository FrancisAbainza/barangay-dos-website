"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  useNewsAuthors,
  useSavedPostIds,
  useToggleSavedPost,
  useApplyReaction,
  useDeletePost,
} from "@/hooks/use-news-queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  FileText,
  Paperclip,
  ExternalLink,
  Facebook,
  MoreVertical,
  Pencil,
  Trash2,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { NewsPost } from "@/types";
import { CATEGORY_CONFIG } from "@/types/news";
import { MediaGallery } from "./image-gallery";
import { EditNewsDialog } from "./edit-news-dialog";

interface PostBodyProps {
  post: NewsPost;
  summarySlot?: React.ReactNode;
  onCommentClick?: () => void;
}

export function PostBody({
  post,
  summarySlot,
  onCommentClick,
}: PostBodyProps) {
  const { userProfile } = useAuth();
  const authors = useNewsAuthors();
  const savedPostIds = useSavedPostIds();
  const toggleSavedPost = useToggleSavedPost();
  const applyReaction = useApplyReaction();
  const deletePost = useDeletePost();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const author = authors[post.authorId];
  const authorName = author?.fullName ?? "Unknown";
  const authorAvatar = author?.avatarUrl;
  const authorRole = author?.role;

  const isSaved = savedPostIds.has(post.id);
  const uid = userProfile?.uid;
  const activeReaction: "like" | "dislike" | null =
    uid && post.likes.includes(uid)
      ? "like"
      : uid && post.dislikes.includes(uid)
        ? "dislike"
        : null;

  const categoryConfig = CATEGORY_CONFIG[post.category];
  const CategoryIcon = categoryConfig.icon;

  const canManage =
    (uid !== undefined && post.authorId === uid) ||
    userProfile?.role === "Super Admin";

  function handleShare() {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <>
      {/* ── Post Header ── */}
      <div className="px-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={authorAvatar} />
              <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold leading-tight">
                {authorName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {authorRole && (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {authorRole}
                    </p>
                    <span className="text-xs text-muted-foreground">·</span>
                  </>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDate(post.date)}
                </p>
              </div>
            </div>
          </div>
          {uid && (
            <div className="flex items-center gap-1 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground shrink-0"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toggleSavedPost.mutate({ postId: post.id, save: !isSaved })}>
                    {isSaved ? (
                      <><BookmarkCheck className="size-4" />Unsave post</>
                    ) : (
                      <><Bookmark className="size-4" />Save post</>
                    )}
                  </DropdownMenuItem>
                  {canManage && (
                    <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                      <Pencil className="size-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {canManage && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() =>
                        deletePost.mutate({
                          postId: post.id,
                          media: post.media,
                          attachments: post.attachments,
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <Badge className={cn("gap-1 mt-3", categoryConfig.className)}>
          <CategoryIcon className="size-3" />
          {post.category}
        </Badge>
        <h2 className="font-bold mt-1.5 leading-snug text-base">
          {post.title}
        </h2>
        <p className="text-sm text-foreground/80 mt-1.5 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* ── Media ── */}
      {post.media && post.media.length > 0 && (
        <div className="px-4">
          <MediaGallery media={post.media} />
        </div>
      )}

      {/* ── Attachments ── */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="px-4 mt-3">
          <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <Paperclip className="size-3" />
            Attachments
          </p>
          <div className="space-y-1.5">
            {post.attachments.map((att, i) => (
              <a
                key={att.path ?? i}
                href={att.uri as string}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-md border border-border bg-muted/40 px-3 py-2 hover:bg-muted transition-colors group"
              >
                <FileText className="size-4 text-destructive shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {att.name}
                  </p>
                  {att.size && (
                    <p className="text-xs text-muted-foreground">{att.size}</p>
                  )}
                </div>
                <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Reaction & comment count summary ── */}
      <div className="px-4 mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {(post.likes.length > 0 || post.dislikes.length > 0) && (
            <>
              <span className="flex items-center gap-1">
                <ThumbsUp className="size-3" />
                {post.likes.length}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsDown className="size-3" />
                {post.dislikes.length}
              </span>
            </>
          )}
        </div>
        {summarySlot ?? (
          <span>
            {post.comments.length}{" "}
            {post.comments.length === 1 ? "comment" : "comments"}
          </span>
        )}
      </div>

      <Separator className="mt-2" />

      {/* ── Action Buttons ── */}
      {uid && <div className="px-2 py-1 grid grid-cols-4">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-1.5 text-muted-foreground font-normal",
            activeReaction === "like" && "text-primary font-semibold hover:text-primary"
          )}
          onClick={() => applyReaction.mutate({ postId: post.id, type: "like" })}
        >
          <ThumbsUp className="size-4" />
          <span className="hidden sm:inline">Like</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-1.5 text-muted-foreground font-normal",
            activeReaction === "dislike" && "text-destructive font-semibold hover:text-destructive"
          )}
          onClick={() => applyReaction.mutate({ postId: post.id, type: "dislike" })}
        >
          <ThumbsDown className="size-4" />
          <span className="hidden sm:inline">Dislike</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground font-normal"
          onClick={() => {
            if (onCommentClick) {
              onCommentClick();
            } else {
              document.getElementById("post-comment-input")?.focus();
            }
          }}
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
      </div>}

      <EditNewsDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        post={post}
      />
    </>
  );
}
