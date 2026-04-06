"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Pin } from "lucide-react";
import { NewsPost } from "@/schemas/news-schema";
import { PostPreview } from "./post-preview";
import { PostDetailDialog } from "./post-detail-dialog";

export function PinnedPostsPanel({
  posts,
  savedPostIds,
  onToggleSave,
  currentUserName,
}: {
  posts: NewsPost[];
  savedPostIds: Set<string>;
  onToggleSave: (id: string) => void;
  currentUserName: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);

  if (posts.length === 0) return null;

  const first = posts[0];
  const more = posts.slice(1);

  return (
    <>
      <Card className="py-0">
        <CardContent className="p-3 flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Pin className="size-3" />
            Pinned {posts.length > 1 ? "Posts" : "Post"}
          </div>
          <PostPreview post={first} onClick={() => setSelectedPost(first)} />
          {expanded && more.length > 0 && (
            <div className="space-y-2.5">
              {more.map((post) => (
                <div key={post.id} className="pt-2.5 border-t border-border">
                  <PostPreview
                    post={post}
                    onClick={() => setSelectedPost(post)}
                  />
                </div>
              ))}
            </div>
          )}
          {posts.length > 1 && (
            <>
              <Separator />
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-xs text-muted-foreground"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Show Less" : `View All (${posts.length})`}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      {selectedPost && (
        <PostDetailDialog
          post={selectedPost}
          isSaved={savedPostIds.has(selectedPost.id)}
          onToggleSave={onToggleSave}
          currentUserName={currentUserName}
          open={selectedPost !== null}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </>
  );
}
