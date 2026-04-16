"use client";

import { useEffect, useRef } from "react";
import { Loader2, Megaphone } from "lucide-react";
import { NewsPost } from "@/types";
import { PostCard } from "./post-card";

interface PostFeedProps {
  posts: NewsPost[];
  hasMore?: boolean;
  loadMore?: () => void;
  isLoadingMore?: boolean;
}

export function PostFeed({ posts, hasMore, loadMore, isLoadingMore }: PostFeedProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || !loadMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (posts.length === 0 && !isLoadingMore) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Megaphone className="size-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No posts yet</p>
        <p className="text-sm">Check back later for updates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Sentinel for infinite scroll */}
      {hasMore && <div ref={sentinelRef} />}

      {isLoadingMore && (
        <div className="flex justify-center py-6">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

