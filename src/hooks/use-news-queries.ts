"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { NewsPost, Comment, Reply, Category } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import {
  getNewsPosts,
  getPinnedPosts,
  getPostsByIds,
  deleteNewsPost,
  toggleReaction,
  addCommentToPost,
  addReplyToComment,
  deleteCommentFromPost,
  deleteReplyFromComment,
  getAuthorInfoBatch,
  type AuthorInfo,
} from "@/services/news-service";
import { toggleSavedPostForUser } from "@/services/user-service";

// ── Query Keys ─────────────────────────────────────────────────

export const newsKeys = {
  all: ["news"] as const,
  feed: () => [...newsKeys.all, "feed"] as const,
  categoryFeed: (cat: Category) => [...newsKeys.all, "feed", cat] as const,
  pinned: () => [...newsKeys.all, "pinned"] as const,
  saved: (userId: string) => [...newsKeys.all, "saved", userId] as const,
  savedIds: (userId: string) => [...newsKeys.all, "savedIds", userId] as const,
  authors: () => ["authors"] as const,
};

// ── Types ──────────────────────────────────────────────────────

type FeedPage = { posts: NewsPost[]; nextCursor: string | null };
type InfiniteFeedData = InfiniteData<FeedPage, string | undefined>;

// ── Infinite query data helpers ────────────────────────────────

function updatePostInPages(
  data: InfiniteFeedData | undefined,
  updater: (post: NewsPost) => NewsPost,
): InfiniteFeedData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      posts: page.posts.map(updater),
    })),
  };
}

function removePostFromPages(
  data: InfiniteFeedData | undefined,
  postId: string,
): InfiniteFeedData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      posts: page.posts.filter((p) => p.id !== postId),
    })),
  };
}

function prependPostToPages(
  data: InfiniteFeedData | undefined,
  post: NewsPost,
): InfiniteFeedData | undefined {
  if (!data) {
    return {
      pages: [{ posts: [post], nextCursor: null }],
      pageParams: [undefined],
    };
  }
  return {
    ...data,
    pages: data.pages.map((page, i) =>
      i === 0 ? { ...page, posts: [post, ...page.posts] } : page,
    ),
  };
}

// ── Cross-query update helpers ─────────────────────────────────

function updatePostAcrossQueries(
  qc: QueryClient,
  updater: (post: NewsPost) => NewsPost,
) {
  qc.setQueryData<InfiniteFeedData>(newsKeys.feed(), (old) =>
    updatePostInPages(old, updater),
  );
  for (const cat of ["Announcement", "Event", "Emergency"] as Category[]) {
    qc.setQueryData<InfiniteFeedData>(newsKeys.categoryFeed(cat), (old) =>
      updatePostInPages(old, updater),
    );
  }
  qc.setQueryData<NewsPost[]>(newsKeys.pinned(), (old) => old?.map(updater));
  qc.setQueriesData<NewsPost[]>(
    { queryKey: [...newsKeys.all, "saved"] },
    (old) => old?.map(updater),
  );
}

function removePostAcrossQueries(qc: QueryClient, postId: string) {
  qc.setQueryData<InfiniteFeedData>(newsKeys.feed(), (old) =>
    removePostFromPages(old, postId),
  );
  for (const cat of ["Announcement", "Event", "Emergency"] as Category[]) {
    qc.setQueryData<InfiniteFeedData>(newsKeys.categoryFeed(cat), (old) =>
      removePostFromPages(old, postId),
    );
  }
  qc.setQueryData<NewsPost[]>(newsKeys.pinned(), (old) =>
    old?.filter((p) => p.id !== postId),
  );
  qc.setQueriesData<NewsPost[]>(
    { queryKey: [...newsKeys.all, "saved"] },
    (old) => old?.filter((p) => p.id !== postId),
  );
}

function seedCurrentUserAuthor(
  qc: QueryClient,
  user: { uid: string },
  userProfile: {
    fullName: string;
    profilePicture?: { uri: string; path: string };
    role: string;
  },
) {
  const cache =
    qc.getQueryData<Record<string, AuthorInfo>>(newsKeys.authors()) ?? {};
  if (cache[user.uid]) return;
  qc.setQueryData<Record<string, AuthorInfo>>(newsKeys.authors(), {
    ...cache,
    [user.uid]: {
      uid: user.uid,
      fullName: userProfile.fullName,
      avatarUrl: userProfile.profilePicture?.uri,
      role: userProfile.role,
    },
  });
}

// ── Feed Hooks ─────────────────────────────────────────────────

export function useNewsFeed() {
  return useInfiniteQuery({
    queryKey: newsKeys.feed(),
    queryFn: ({ pageParam }) => getNewsPosts(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useCategoryFeed(category: Category) {
  return useInfiniteQuery({
    queryKey: newsKeys.categoryFeed(category),
    queryFn: ({ pageParam }) => getNewsPosts(pageParam, category),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function usePinnedPosts() {
  return useQuery({
    queryKey: newsKeys.pinned(),
    queryFn: getPinnedPosts,
  });
}

// ── Saved Posts ────────────────────────────────────────────────

export function useSavedPostIds(): Set<string> {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();
  const uid = user?.uid ?? "";

  // Sync from auth profile on login / profile refresh
  const profileIds = userProfile?.savedPostIds;
  const initialised = useRef(false);
  useEffect(() => {
    if (!uid) {
      initialised.current = false;
      return;
    }
    // Only seed when there's no data yet (first login or page load)
    if (!initialised.current) {
      queryClient.setQueryData<string[]>(
        newsKeys.savedIds(uid),
        profileIds ?? [],
      );
      initialised.current = true;
    }
  }, [uid, profileIds, queryClient]);

  const { data = [] } = useQuery<string[]>({
    queryKey: newsKeys.savedIds(uid),
    queryFn: () => profileIds ?? [],
    enabled: !!uid,
    staleTime: Infinity,
  });

  return useMemo(() => new Set(data), [data]);
}

export function useSavedPosts() {
  const { user, userProfile } = useAuth();
  const ids = useMemo(
    () => userProfile?.savedPostIds ?? [],
    [userProfile?.savedPostIds],
  );

  return useQuery({
    queryKey: newsKeys.saved(user?.uid ?? ""),
    queryFn: () => (ids.length > 0 ? getPostsByIds(ids) : Promise.resolve([])),
    enabled: !!user,
    staleTime: Infinity,
  });
}

// ── Author Cache ───────────────────────────────────────────────

export function useNewsAuthors(): Record<string, AuthorInfo> {
  const { data = {} } = useQuery<Record<string, AuthorInfo>>({
    queryKey: newsKeys.authors(),
    queryFn: () => ({}),
    staleTime: Infinity,
  });
  return data;
}

export function useEnsureAuthors(posts: NewsPost[]) {
  const queryClient = useQueryClient();

  // Build a stable key from the author IDs present in posts
  const authorIdKey = useMemo(() => {
    const ids = new Set<string>();
    for (const p of posts) {
      ids.add(p.authorId);
      for (const c of p.comments) {
        ids.add(c.authorId);
        for (const r of c.replies) ids.add(r.authorId);
      }
    }
    return [...ids].sort().join(",");
  }, [posts]);

  useEffect(() => {
    if (!authorIdKey) return;
    const ids = authorIdKey.split(",");
    const cache =
      queryClient.getQueryData<Record<string, AuthorInfo>>(
        newsKeys.authors(),
      ) ?? {};
    const missing = ids.filter((id) => !cache[id]);
    if (missing.length === 0) return;

    getAuthorInfoBatch(missing).then((batch) => {
      queryClient.setQueryData<Record<string, AuthorInfo>>(
        newsKeys.authors(),
        (old) => ({ ...old, ...batch }),
      );
    });
  }, [authorIdKey, queryClient]);
}

// ── Create Post Mutation ───────────────────────────────────────

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: NewsPost) => Promise.resolve(post),
    onSuccess: (post) => {
      // Prepend to all-posts feed
      queryClient.setQueryData<InfiniteFeedData>(newsKeys.feed(), (old) =>
        prependPostToPages(old, post),
      );
      // Prepend to category feed
      queryClient.setQueryData<InfiniteFeedData>(
        newsKeys.categoryFeed(post.category),
        (old) => prependPostToPages(old, post),
      );
      // Add to pinned if applicable
      if (post.pinned) {
        queryClient.setQueryData<NewsPost[]>(newsKeys.pinned(), (old) => [
          post,
          ...(old ?? []),
        ]);
      }
      // Ensure author is cached
      const ids = [
        post.authorId,
        ...post.comments.map((c) => c.authorId),
        ...post.comments.flatMap((c) => c.replies.map((r) => r.authorId)),
      ];
      const cache =
        queryClient.getQueryData<Record<string, AuthorInfo>>(
          newsKeys.authors(),
        ) ?? {};
      const missing = [...new Set(ids)].filter((id) => !cache[id]);
      if (missing.length > 0) {
        getAuthorInfoBatch(missing).then((batch) => {
          queryClient.setQueryData<Record<string, AuthorInfo>>(
            newsKeys.authors(),
            (old) => ({ ...old, ...batch }),
          );
        });
      }
    },
  });
}

// ── Update Post Mutation ───────────────────────────────────────

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updated: NewsPost) => Promise.resolve(updated),
    onSuccess: (updated) => {
      const updater = (p: NewsPost) =>
        p.id === updated.id ? updated : p;

      // Update in all infinite feeds
      queryClient.setQueryData<InfiniteFeedData>(newsKeys.feed(), (old) =>
        updatePostInPages(old, updater),
      );

      // Handle category change: add to new, remove from old
      for (const cat of ["Announcement", "Event", "Emergency"] as Category[]) {
        queryClient.setQueryData<InfiniteFeedData>(
          newsKeys.categoryFeed(cat),
          (old) => {
            if (!old) return old;
            if (updated.category === cat) {
              // Update existing or prepend
              const exists = old.pages.some((page) =>
                page.posts.some((p) => p.id === updated.id),
              );
              return exists
                ? updatePostInPages(old, updater)
                : prependPostToPages(old, updated);
            }
            // Remove from other categories
            return removePostFromPages(old, updated.id);
          },
        );
      }

      // Update pinned
      queryClient.setQueryData<NewsPost[]>(newsKeys.pinned(), (old) => {
        if (!old) return old;
        const without = old.filter((p) => p.id !== updated.id);
        return updated.pinned ? [updated, ...without] : without;
      });

      // Update saved
      qcUpdateSaved(queryClient, updater);
    },
  });
}

function qcUpdateSaved(
  qc: QueryClient,
  updater: (p: NewsPost) => NewsPost,
) {
  qc.setQueriesData<NewsPost[]>(
    { queryKey: [...newsKeys.all, "saved"] },
    (old) => old?.map(updater),
  );
}

// ── Delete Post Mutation ───────────────────────────────────────

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deleteNewsPost(postId),
    onMutate: async (postId) => {
      // Snapshot all affected queries for rollback
      const prevFeed = queryClient.getQueryData<InfiniteFeedData>(
        newsKeys.feed(),
      );
      const prevCategoryFeeds: Record<Category, InfiniteFeedData | undefined> =
        {
          Announcement: queryClient.getQueryData(
            newsKeys.categoryFeed("Announcement"),
          ),
          Event: queryClient.getQueryData(newsKeys.categoryFeed("Event")),
          Emergency: queryClient.getQueryData(
            newsKeys.categoryFeed("Emergency"),
          ),
        };
      const prevPinned = queryClient.getQueryData<NewsPost[]>(
        newsKeys.pinned(),
      );

      removePostAcrossQueries(queryClient, postId);

      return { prevFeed, prevCategoryFeeds, prevPinned };
    },
    onError: (_err, _postId, context) => {
      if (!context) return;
      queryClient.setQueryData(newsKeys.feed(), context.prevFeed);
      for (const cat of ["Announcement", "Event", "Emergency"] as Category[]) {
        queryClient.setQueryData(
          newsKeys.categoryFeed(cat),
          context.prevCategoryFeeds[cat],
        );
      }
      queryClient.setQueryData(newsKeys.pinned(), context.prevPinned);
    },
  });
}

// ── Toggle Saved Post Mutation ─────────────────────────────────

export function useToggleSavedPost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      save,
    }: {
      postId: string;
      save: boolean;
    }) => toggleSavedPostForUser(user!.uid, postId, save),
    onMutate: async ({ postId, save }) => {
      const uid = user!.uid;
      await queryClient.cancelQueries({ queryKey: newsKeys.savedIds(uid) });
      await queryClient.cancelQueries({ queryKey: newsKeys.saved(uid) });

      const prevIds = queryClient.getQueryData<string[]>(
        newsKeys.savedIds(uid),
      );
      const prevSaved = queryClient.getQueryData<NewsPost[]>(
        newsKeys.saved(uid),
      );

      // Update savedPostIds
      const newIds = save
        ? [...(prevIds ?? []), postId]
        : (prevIds ?? []).filter((id) => id !== postId);
      queryClient.setQueryData<string[]>(newsKeys.savedIds(uid), newIds);

      // Update saved posts list
      if (save) {
        // Find the post from existing query data
        const feedData = queryClient.getQueryData<InfiniteFeedData>(
          newsKeys.feed(),
        );
        const pinnedData = queryClient.getQueryData<NewsPost[]>(
          newsKeys.pinned(),
        );
        const allPosts = [
          ...(feedData?.pages.flatMap((p) => p.posts) ?? []),
          ...(pinnedData ?? []),
        ];
        const post = allPosts.find((p) => p.id === postId);
        if (post) {
          queryClient.setQueryData<NewsPost[]>(newsKeys.saved(uid), (old) => [
            post,
            ...(old ?? []),
          ]);
        }
      } else {
        queryClient.setQueryData<NewsPost[]>(newsKeys.saved(uid), (old) =>
          old?.filter((p) => p.id !== postId),
        );
      }

      return { prevIds, prevSaved };
    },
    onError: (_err, _vars, context) => {
      if (!context || !user) return;
      queryClient.setQueryData(
        newsKeys.savedIds(user.uid),
        context.prevIds,
      );
      queryClient.setQueryData(newsKeys.saved(user.uid), context.prevSaved);
    },
  });
}

// ── Reaction Mutation ──────────────────────────────────────────

export function useApplyReaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      type,
    }: {
      postId: string;
      type: "like" | "dislike";
    }) => toggleReaction(postId, user!.uid, type),
    onMutate: async ({ postId, type }) => {
      const userId = user!.uid;

      const updater = (post: NewsPost) => {
        if (post.id !== postId) return post;
        const alreadyInTarget =
          type === "like"
            ? post.likes.includes(userId)
            : post.dislikes.includes(userId);
        const likes = post.likes.filter((id) => id !== userId);
        const dislikes = post.dislikes.filter((id) => id !== userId);
        if (!alreadyInTarget) {
          if (type === "like") likes.push(userId);
          else dislikes.push(userId);
        }
        return { ...post, likes, dislikes };
      };

      updatePostAcrossQueries(queryClient, updater);
    },
  });
}

// ── Comment Mutations ──────────────────────────────────────────

export function useAddComment() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      addCommentToPost(postId, {
        id: `c-${Date.now()}`,
        authorId: user!.uid,
        content,
      }),
    onMutate: async ({ postId, content }) => {
      if (!user || !userProfile) return;

      seedCurrentUserAuthor(queryClient, user, userProfile);

      const comment: Comment = {
        id: `c-${Date.now()}`,
        authorId: user.uid,
        content,
        date: new Date(),
        replies: [],
      };

      const updater = (post: NewsPost) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, comment] }
          : post;

      updatePostAcrossQueries(queryClient, updater);
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      commentId,
    }: {
      postId: string;
      commentId: string;
    }) => deleteCommentFromPost(postId, commentId),
    onMutate: async ({ postId, commentId }) => {
      const updater = (post: NewsPost) =>
        post.id !== postId
          ? post
          : {
              ...post,
              comments: post.comments.filter((c) => c.id !== commentId),
            };
      updatePostAcrossQueries(queryClient, updater);
    },
  });
}

// ── Reply Mutations ────────────────────────────────────────────

export function useAddReply() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      commentId,
      content,
    }: {
      postId: string;
      commentId: string;
      content: string;
    }) =>
      addReplyToComment(postId, commentId, {
        id: `r-${Date.now()}`,
        authorId: user!.uid,
        content,
      }),
    onMutate: async ({ postId, commentId, content }) => {
      if (!user || !userProfile) return;

      seedCurrentUserAuthor(queryClient, user, userProfile);

      const reply: Reply = {
        id: `r-${Date.now()}`,
        authorId: user.uid,
        content,
        date: new Date(),
      };

      const updater = (post: NewsPost) =>
        post.id !== postId
          ? post
          : {
              ...post,
              comments: post.comments.map((c) =>
                c.id === commentId
                  ? { ...c, replies: [...c.replies, reply] }
                  : c,
              ),
            };

      updatePostAcrossQueries(queryClient, updater);
    },
  });
}

export function useDeleteReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      commentId,
      replyId,
    }: {
      postId: string;
      commentId: string;
      replyId: string;
    }) => deleteReplyFromComment(postId, commentId, replyId),
    onMutate: async ({ postId, commentId, replyId }) => {
      const updater = (post: NewsPost) =>
        post.id !== postId
          ? post
          : {
              ...post,
              comments: post.comments.map((c) =>
                c.id !== commentId
                  ? c
                  : {
                      ...c,
                      replies: c.replies.filter((r) => r.id !== replyId),
                    },
              ),
            };
      updatePostAcrossQueries(queryClient, updater);
    },
  });
}
