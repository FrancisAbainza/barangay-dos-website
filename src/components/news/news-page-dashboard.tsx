"use client";

import { useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Megaphone, AlertTriangle, CalendarDays } from "lucide-react";
import { NewsProvider, useNews } from "@/contexts/news-context";
import { useBarangayProfile } from "@/contexts/barangay-profile-context";
import { PostFeed } from "@/components/news/post-feed";
import { PinnedPostsPanel } from "@/components/news/pinned-posts-panel";
import { SavedPostsPanel } from "@/components/news/saved-posts-panel";
import { CreateNewsDialog } from "@/components/news/create-news-dialog";

export function NewsPageDashboard() {
  return (
    <NewsProvider>
      <NewsPageContent />
    </NewsProvider>
  );
}

function NewsPageContent() {
  const { posts, pinnedPosts, hasMore, loadMore, isLoadingMore, categoryFeeds, loadMoreCategory } = useNews();
  const { barangayName } = useBarangayProfile();

  const loadMoreAnnouncements = useCallback(() => loadMoreCategory("Announcement"), [loadMoreCategory]);
  const loadMoreEvents = useCallback(() => loadMoreCategory("Event"), [loadMoreCategory]);
  const loadMoreEmergencies = useCallback(() => loadMoreCategory("Emergency"), [loadMoreCategory]);

  return (
    <div className="container space-y-6 m-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
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

        <div className="order-1 xl:w-64 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto">
          <PinnedPostsPanel />
        </div>


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
                hasMore={hasMore}
                loadMore={loadMore}
                isLoadingMore={isLoadingMore}
              />
            </TabsContent>

            <TabsContent value="announcement" className="mt-5">
              <PostFeed
                posts={categoryFeeds["Announcement"].posts}
                hasMore={categoryFeeds["Announcement"].hasMore}
                isLoadingMore={categoryFeeds["Announcement"].isLoadingMore}
                loadMore={loadMoreAnnouncements}
              />
            </TabsContent>

            <TabsContent value="event" className="mt-5">
              <PostFeed
                posts={categoryFeeds["Event"].posts}
                hasMore={categoryFeeds["Event"].hasMore}
                isLoadingMore={categoryFeeds["Event"].isLoadingMore}
                loadMore={loadMoreEvents}
              />
            </TabsContent>

            <TabsContent value="emergency" className="mt-5">
              <PostFeed
                posts={categoryFeeds["Emergency"].posts}
                hasMore={categoryFeeds["Emergency"].hasMore}
                isLoadingMore={categoryFeeds["Emergency"].isLoadingMore}
                loadMore={loadMoreEmergencies}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Saved Posts Sidebar ── */}
        <div className="order-2 xl:order-3 xl:w-64 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto">
          <SavedPostsPanel />
        </div>
      </div>
    </div>
  );
}

