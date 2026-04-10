"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bookmark, LogIn } from "lucide-react";
import { useNews } from "@/contexts/news-context";
import { useAuth } from "@/contexts/auth-context";
import { PostPreview } from "./post-preview";
import { PostDetailDialog } from "./post-detail-dialog";

export function SavedPostsPanel() {
  const { savedPosts } = useNews();
  const { userProfile } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const selectedPost = selectedPostId
    ? (savedPosts.find((p) => p.id === selectedPostId) ?? null)
    : null;

  return (
    <>
      <Card className="py-0">
        <CardContent className="p-3 flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Bookmark className="size-3" />
            Saved Posts
          </div>
          {!userProfile ? (
            <p className="text-xs text-muted-foreground text-center py-3 leading-relaxed flex flex-col items-center gap-1.5">
              <LogIn className="size-4" />
              Log in to save posts.
            </p>
          ) : savedPosts.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3 leading-relaxed">
              No saved posts yet.
              <br />
              Click the bookmark icon on a post to save it.
            </p>
          ) : (
            <>
              <PostPreview
                post={savedPosts[0]}
                onClick={() => setSelectedPostId(savedPosts[0].id)}
              />
              {expanded && savedPosts.length > 1 && (
                <div className="space-y-2.5">
                  {savedPosts.slice(1).map((post) => (
                    <div key={post.id} className="pt-2.5 border-t border-border">
                      <PostPreview
                        post={post}
                        onClick={() => setSelectedPostId(post.id)}
                      />
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
