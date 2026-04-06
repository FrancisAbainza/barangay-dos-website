"use client";

import { Megaphone } from "lucide-react";
import { NewsPost } from "@/schemas/news-schema";
import { PostCard } from "./post-card";

export function PostFeed({
  posts,
  currentUserName,
  savedPostIds,
  onToggleSave,
}: {
  posts: NewsPost[];
  currentUserName: string;
  savedPostIds: Set<string>;
  onToggleSave: (id: string) => void;
}) {
  if (posts.length === 0) {
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
        <PostCard
          key={post.id}
          post={post}
          currentUserName={currentUserName}
          isSaved={savedPostIds.has(post.id)}
          onToggleSave={() => onToggleSave(post.id)}
        />
      ))}
    </div>
  );
}
