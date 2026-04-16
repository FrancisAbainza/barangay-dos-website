"use client";

import { useCallback, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Megaphone, AlertTriangle, CalendarDays } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useBarangayProfile } from "@/hooks/use-barangay-profile-query";
import {
  useNewsFeed,
  useCategoryFeed,
  usePinnedPosts,
  useSavedPosts,
  useEnsureAuthors,
} from "@/hooks/use-news-queries";
import { PostFeed } from "@/components/news/post-feed";
import { PinnedPostsPanel } from "@/components/news/pinned-posts-panel";
import { SavedPostsPanel } from "@/components/news/saved-posts-panel";
import { CreateNewsDialog } from "@/components/news/create-news-dialog";

export function NewsPageDashboard() {
  return <NewsPageContent />;
}

function NewsPageContent() {
  const feedQuery = useNewsFeed();
  const announcementFeed = useCategoryFeed("Announcement");
  const eventFeed = useCategoryFeed("Event");
  const emergencyFeed = useCategoryFeed("Emergency");
  const pinnedQuery = usePinnedPosts();
  const savedQuery = useSavedPosts();

  const { data: profile } = useBarangayProfile();
  const { userProfile } = useAuth();
  const isAuthenticated = !!userProfile;

  const barangayName = profile?.name ?? "Barangay Dos";

  const posts = useMemo(
    () => feedQuery.data?.pages.flatMap((p) => p.posts) ?? [],
    [feedQuery.data],
  );
  const announcementPosts = useMemo(
    () => announcementFeed.data?.pages.flatMap((p) => p.posts) ?? [],
    [announcementFeed.data],
  );
  const eventPosts = useMemo(
    () => eventFeed.data?.pages.flatMap((p) => p.posts) ?? [],
    [eventFeed.data],
  );
  const emergencyPosts = useMemo(
    () => emergencyFeed.data?.pages.flatMap((p) => p.posts) ?? [],
    [emergencyFeed.data],
  );

  // Ensure authors are fetched for all loaded posts
  const allPosts = useMemo(
    () => [
      ...posts,
      ...announcementPosts,
      ...eventPosts,
      ...emergencyPosts,
      ...(pinnedQuery.data ?? []),
      ...(savedQuery.data ?? []),
    ],
    [posts, announcementPosts, eventPosts, emergencyPosts, pinnedQuery.data, savedQuery.data],
  );
  useEnsureAuthors(allPosts);

  const loadMoreAnnouncements = useCallback(() => announcementFeed.fetchNextPage(), [announcementFeed]);
  const loadMoreEvents = useCallback(() => eventFeed.fetchNextPage(), [eventFeed]);
  const loadMoreEmergencies = useCallback(() => emergencyFeed.fetchNextPage(), [emergencyFeed]);

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
        {(isAuthenticated && (userProfile.role === "Admin" || userProfile.role === "Super Admin")) && <CreateNewsDialog />}
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
                hasMore={feedQuery.hasNextPage}
                loadMore={() => feedQuery.fetchNextPage()}
                isLoadingMore={feedQuery.isFetchingNextPage}
              />
            </TabsContent>

            <TabsContent value="announcement" className="mt-5">
              <PostFeed
                posts={announcementPosts}
                hasMore={announcementFeed.hasNextPage}
                isLoadingMore={announcementFeed.isFetchingNextPage}
                loadMore={loadMoreAnnouncements}
              />
            </TabsContent>

            <TabsContent value="event" className="mt-5">
              <PostFeed
                posts={eventPosts}
                hasMore={eventFeed.hasNextPage}
                isLoadingMore={eventFeed.isFetchingNextPage}
                loadMore={loadMoreEvents}
              />
            </TabsContent>

            <TabsContent value="emergency" className="mt-5">
              <PostFeed
                posts={emergencyPosts}
                hasMore={emergencyFeed.hasNextPage}
                isLoadingMore={emergencyFeed.isFetchingNextPage}
                loadMore={loadMoreEmergencies}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="order-2 xl:order-3 xl:w-64 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto">
          <SavedPostsPanel />
        </div>
      </div>
    </div>
  );
}

