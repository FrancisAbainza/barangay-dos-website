"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Pin } from "lucide-react";
import { useNews } from "@/contexts/news-context";
import { PostPreview } from "./post-preview";
import { PostDetailDialog } from "./post-detail-dialog";

export function PinnedPostsPanel() {
  const { pinnedPosts } = useNews();
  const [expanded, setExpanded] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  if (pinnedPosts.length === 0) return null;

  const first = pinnedPosts[0];
  const more = pinnedPosts.slice(1);

  const selectedPost = selectedPostId
    ? (pinnedPosts.find((p) => p.id === selectedPostId) ?? null)
    : null;

  return (
    <>
      <Card className="py-0">
        <CardContent className="p-3 flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Pin className="size-3" />
            Pinned {pinnedPosts.length > 1 ? "Posts" : "Post"}
          </div>
          <PostPreview post={first} onClick={() => setSelectedPostId(first.id)} />
          {expanded && more.length > 0 && (
            <div className="space-y-2.5">
              {more.map((post) => (
                <div key={post.id} className="pt-2.5 border-t border-border">
                  <PostPreview
                    post={post}
                    onClick={() => setSelectedPostId(post.id)}
                  />
                </div>
              ))}
            </div>
          )}
          {pinnedPosts.length > 1 && (
            <>
              <Separator />
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-xs text-muted-foreground"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Show Less" : `View All (${pinnedPosts.length})`}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      {selectedPost && (
        <PostDetailDialog
          post={selectedPost}
          open={selectedPost !== null}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </>
  );
}
