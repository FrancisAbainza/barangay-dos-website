"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { NewsPost } from "@/schemas/news-schema";
import { useNews } from "@/contexts/news-context";
import { PostBody } from "./post-body";
import { PostComments } from "./post-comments";

export function PostDetailDialog({
  post,
  open,
  onClose,
}: {
  post: NewsPost;
  open: boolean;
  onClose: () => void;
}) {
  const { authors } = useNews();
  const authorName = authors[post.authorId]?.fullName ?? "Author";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogTitle className="sr-only">{post.title}</DialogTitle>
        {/* ── Facebook-style header ── */}
        <div className="shrink-0 relative flex items-center justify-center border-b px-12 py-3.5">
          <p className="font-bold text-base">{authorName}&apos;s Post</p>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 rounded-full size-9 text-muted-foreground"
            >
              <X className="size-5" />
            </Button>
          </DialogClose>
        </div>
        <div className="overflow-y-auto">
          <PostBody
            post={post}
          />
          <PostComments post={post} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
