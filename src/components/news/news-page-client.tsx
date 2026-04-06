"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Megaphone, AlertTriangle, CalendarDays } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { NewsPost } from "@/schemas/news-schema";
import { PostFeed } from "@/components/news/post-feed";
import { PinnedPostsPanel } from "@/components/news/pinned-posts-panel";
import { SavedPostsSidebar } from "@/components/news/saved-posts-sidebar";
import { CreateNewsDialog } from "@/components/news/create-news-dialog";

export function NewsPageClient({
  posts,
  barangayName,
}: {
  posts: NewsPost[];
  barangayName: string;
}) {
  const { userProfile } = useAuth();
  const currentUserName = userProfile?.fullName ?? "Guest User";
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());

  const pinnedPosts = posts.filter((p) => p.pinned);
  const announcementPosts = posts.filter((p) => p.category === "Announcement");
  const eventPosts = posts.filter((p) => p.category === "Event");
  const emergencyPosts = posts.filter((p) => p.category === "Emergency");

  function toggleSave(id: string) {
    setSavedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="container space-y-6 m-auto">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-accent text-primary p-2 rounded-md">
            <Megaphone />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              News &amp; Announcements
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Stay informed with the latest updates from {barangayName}.
            </p>
          </div>
        </div>
        <CreateNewsDialog />
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* ── Pinned Posts Panel ── */}
        {pinnedPosts.length > 0 && (
          <div className="order-1 xl:w-64 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto">
            <PinnedPostsPanel
              posts={pinnedPosts}
              savedPostIds={savedPostIds}
              onToggleSave={toggleSave}
              currentUserName={currentUserName}
            />
          </div>
        )}

        {/* ── Main Feed ── */}
        <div className="order-3 xl:order-2 flex-1 min-w-0 space-y-4">
          <Tabs defaultValue="all">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="announcement" className="flex-1 gap-1.5">
                <Megaphone className="size-3.5" />
                <span className="hidden sm:inline">Announcements</span>
                <span className="sm:hidden">Posts</span>
              </TabsTrigger>
              <TabsTrigger value="event" className="flex-1 gap-1.5">
                <CalendarDays className="size-3.5" />
                <span className="hidden sm:inline">Events</span>
                <span className="sm:hidden">Events</span>
              </TabsTrigger>
              <TabsTrigger value="emergency" className="flex-1 gap-1.5">
                <AlertTriangle className="size-3.5" />
                <span className="hidden sm:inline">Emergency</span>
                <span className="sm:hidden">Alerts</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-5">
              <PostFeed
                posts={posts}
                currentUserName={currentUserName}
                savedPostIds={savedPostIds}
                onToggleSave={toggleSave}
              />
            </TabsContent>

            <TabsContent value="announcement" className="mt-5">
              <PostFeed
                posts={announcementPosts}
                currentUserName={currentUserName}
                savedPostIds={savedPostIds}
                onToggleSave={toggleSave}
              />
            </TabsContent>

            <TabsContent value="event" className="mt-5">
              <PostFeed
                posts={eventPosts}
                currentUserName={currentUserName}
                savedPostIds={savedPostIds}
                onToggleSave={toggleSave}
              />
            </TabsContent>

            <TabsContent value="emergency" className="mt-5">
              <PostFeed
                posts={emergencyPosts}
                currentUserName={currentUserName}
                savedPostIds={savedPostIds}
                onToggleSave={toggleSave}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Saved Posts Sidebar ── */}
        <div className="order-2 xl:order-3 xl:w-64 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto">
          <SavedPostsSidebar
            posts={posts}
            savedPostIds={savedPostIds}
            onRemove={toggleSave}
            currentUserName={currentUserName}
          />
        </div>
      </div>
    </div>
  );
}
