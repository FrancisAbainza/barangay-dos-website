"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { NewsPost } from "@/types";
import { PostBody } from "./post-body";
import { PostDetailDialog } from "./post-detail-dialog";

export function PostCard({ post }: { post: NewsPost }) {
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const commentSummary = (
    <button
      className="hover:underline"
      onClick={() => setDetailDialogOpen(true)}
    >
      {post.comments.length}{" "}
      {post.comments.length === 1 ? "comment" : "comments"}
    </button>
  );

  return (
    <>
      <Card className="overflow-hidden shadow-sm pb-0">
        <CardContent className="p-0">
          <PostBody
            post={post}
            summarySlot={commentSummary}
            onCommentClick={() => setDetailDialogOpen(true)}
          />
        </CardContent>
      </Card>

      <PostDetailDialog
        post={post}
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
      />
    </>
  );
}
