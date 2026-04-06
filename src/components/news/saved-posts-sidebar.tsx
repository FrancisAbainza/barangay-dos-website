"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bookmark, X } from "lucide-react";
import { NewsPost } from "@/schemas/news-schema";
import { formatDate } from "./news-helpers";
import { PostDetailDialog } from "./post-detail-dialog";

export function SavedPostsSidebar({
  posts,
  savedPostIds,
  onRemove,
  currentUserName,
}: {
  posts: NewsPost[];
  savedPostIds: Set<string>;
  onRemove: (id: string) => void;
  currentUserName: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);

  const savedPosts = posts.filter((p) => savedPostIds.has(p.id));
  const visible = expanded ? savedPosts : savedPosts.slice(0, 1);

  return (
    <>
      <Card className="py-0">
        <CardContent className="p-3 flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Bookmark className="size-3" />
            Saved Posts
            {savedPosts.length > 0 && (
              <span className="ml-auto text-muted-foreground font-normal">
                {savedPosts.length}
              </span>
            )}
          </div>
          {savedPosts.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3 leading-relaxed">
              No saved posts yet.
              <br />
              Click the bookmark icon on a post to save it.
            </p>
          ) : (
            <div className="space-y-2">
              {visible.map((post) => (
                <div key={post.id} className="flex items-start gap-1.5 group">
                  <button
                    className="flex-1 min-w-0 text-left hover:opacity-75 transition-opacity"
                    onClick={() => setSelectedPost(post)}
                  >
                    <p className="text-xs font-medium leading-snug line-clamp-2">
                      {post.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(post.date)}
                    </p>
                  </button>
                  <button
                    onClick={() => onRemove(post.id)}
                    className="shrink-0 mt-0.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {savedPosts.length > 1 && (
            <>
              <Separator />
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-xs text-muted-foreground"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Show Less" : `View All (${savedPosts.length})`}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      {selectedPost && (
        <PostDetailDialog
          post={selectedPost}
          isSaved={savedPostIds.has(selectedPost.id)}
          onToggleSave={onRemove}
          currentUserName={currentUserName}
          open={selectedPost !== null}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </>
  );
}
