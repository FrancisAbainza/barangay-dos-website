"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
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

export const newsKeys = {
  all: ["news"] as const,
  feed: () => [...newsKeys.all, "feed"] as const,
  categoryFeed: (cat: Category) => [...newsKeys.all, "feed", cat] as const,
  pinned: () => [...newsKeys.all, "pinned"] as const,
  saved: (userId: string) => [...newsKeys.all, "saved", userId] as const,
  savedIds: (userId: string) => [...newsKeys.all, "savedIds", userId] as const,
  authors: () => ["authors"] as const,
};

type FeedPage = { posts: NewsPost[]; nextCursor: string | null };

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

export function useSavedPostIds(): Set<string> {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();
  const uid = user?.uid ?? "";
  const profileIds = userProfile?.savedPostIds ?? [];
  
  const initialized = useRef(false);
  
  useEffect(() => {
    if (!uid) {
      initialized.current = false;
      return;
    }
    if (!initialized.current) {
      queryClient.setQueryData<string[]>(newsKeys.savedIds(uid), profileIds);
      initialized.current = true;
    }
  }, [uid, profileIds, queryClient]);

  const { data = [] } = useQuery<string[]>({
    queryKey: newsKeys.savedIds(uid),
    queryFn: () => profileIds,
    enabled: !!uid,
    staleTime: Infinity,
  });

  return useMemo(() => new Set(data), [data]);
}

export function useSavedPosts() {
  const { user, userProfile } = useAuth();
  const ids = userProfile?.savedPostIds ?? [];

  return useQuery({
    queryKey: newsKeys.saved(user?.uid ?? ""),
    queryFn: () => (ids.length > 0 ? getPostsByIds(ids) : []),
    enabled: !!user && ids.length > 0,
  });
}

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

  const authorIds = useMemo(() => {
    const ids = new Set<string>();
    posts.forEach((p) => {
      ids.add(p.authorId);
      p.comments.forEach((c) => {
        ids.add(c.authorId);
        c.replies.forEach((r) => ids.add(r.authorId));
      });
    });
    return [...ids].sort().join(",");
  }, [posts]);

  useEffect(() => {
    if (!authorIds) return;
    
    const ids = authorIds.split(",");
    const cache = queryClient.getQueryData<Record<string, AuthorInfo>>(newsKeys.authors()) ?? {};
    const missing = ids.filter((id) => !cache[id]);
    
    if (missing.length === 0) return;

    getAuthorInfoBatch(missing).then((batch) => {
      queryClient.setQueryData<Record<string, AuthorInfo>>(newsKeys.authors(), (old) => ({
        ...old,
        ...batch,
      }));
    });
  }, [authorIds, queryClient]);
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: NewsPost) => Promise.resolve(post),
    onSuccess: (post) => {
      queryClient.setQueryData<InfiniteData<FeedPage>>(newsKeys.feed(), (old) => {
        if (!old) return { pages: [{ posts: [post], nextCursor: null }], pageParams: [undefined] };
        return {
          ...old,
          pages: old.pages.map((page, i) => 
            i === 0 ? { ...page, posts: [post, ...page.posts] } : page
          ),
        };
      });

      queryClient.setQueryData<InfiniteData<FeedPage>>(newsKeys.categoryFeed(post.category), (old) => {
        if (!old) return { pages: [{ posts: [post], nextCursor: null }], pageParams: [undefined] };
        return {
          ...old,
          pages: old.pages.map((page, i) => 
            i === 0 ? { ...page, posts: [post, ...page.posts] } : page
          ),
        };
      });

      if (post.pinned) {
        queryClient.setQueryData<NewsPost[]>(newsKeys.pinned(), (old) => [post, ...(old ?? [])]);
      }
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updated: NewsPost) => Promise.resolve(updated),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: newsKeys.all });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deleteNewsPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.all });
    },
  });
}

export function useToggleSavedPost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, save }: { postId: string; save: boolean }) =>
      toggleSavedPostForUser(user!.uid, postId, save),
    onMutate: async ({ postId, save }) => {
      const uid = user!.uid;
      
      const prevIds = queryClient.getQueryData<string[]>(newsKeys.savedIds(uid));
      const newIds = save
        ? [...(prevIds ?? []), postId]
        : (prevIds ?? []).filter((id) => id !== postId);
      
      queryClient.setQueryData<string[]>(newsKeys.savedIds(uid), newIds);
      
      return { prevIds };
    },
    onError: (_err, _vars, context) => {
      if (context && user) {
        queryClient.setQueryData(newsKeys.savedIds(user.uid), context.prevIds);
      }
    },
    onSettled: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: newsKeys.saved(user.uid) });
      }
    },
  });
}

export function useApplyReaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: "like" | "dislike" }) =>
      toggleReaction(postId, user!.uid, type),
    onMutate: async ({ postId, type }) => {
      const userId = user!.uid;
      
      const updatePost = (post: NewsPost) => {
        if (post.id !== postId) return post;
        
        const alreadyLiked = post.likes.includes(userId);
        const alreadyDisliked = post.dislikes.includes(userId);
        
        let likes = post.likes.filter((id) => id !== userId);
        let dislikes = post.dislikes.filter((id) => id !== userId);
        
        if (type === "like" && !alreadyLiked) {
          likes.push(userId);
        } else if (type === "dislike" && !alreadyDisliked) {
          dislikes.push(userId);
        }
        
        return { ...post, likes, dislikes };
      };

      queryClient.setQueryData<InfiniteData<FeedPage>>(newsKeys.feed(), (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map(updatePost),
          })),
        };
      });
      
      queryClient.setQueryData<NewsPost[]>(newsKeys.pinned(), (old) => old?.map(updatePost));
    },
  });
}

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

      const cache = queryClient.getQueryData<Record<string, AuthorInfo>>(newsKeys.authors()) ?? {};
      if (!cache[user.uid]) {
        queryClient.setQueryData<Record<string, AuthorInfo>>(newsKeys.authors(), {
          ...cache,
          [user.uid]: {
            uid: user.uid,
            fullName: userProfile.fullName,
            avatarUrl: userProfile.profilePicture?.uri,
            role: userProfile.role,
          },
        });
      }

      const comment: Comment = {
        id: `c-${Date.now()}`,
        authorId: user.uid,
        content,
        date: new Date(),
        replies: [],
      };

      const updatePost = (post: NewsPost) =>
        post.id === postId ? { ...post, comments: [...post.comments, comment] } : post;

      queryClient.setQueryData<InfiniteData<FeedPage>>(newsKeys.feed(), (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map(updatePost),
          })),
        };
      });
      
      queryClient.setQueryData<NewsPost[]>(newsKeys.pinned(), (old) => old?.map(updatePost));
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) =>
      deleteCommentFromPost(postId, commentId),
    onMutate: async ({ postId, commentId }) => {
      const updatePost = (post: NewsPost) =>
        post.id === postId
          ? { ...post, comments: post.comments.filter((c) => c.id !== commentId) }
          : post;

      queryClient.setQueryData<InfiniteData<FeedPage>>(newsKeys.feed(), (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map(updatePost),
          })),
        };
      });
      
      queryClient.setQueryData<NewsPost[]>(newsKeys.pinned(), (old) => old?.map(updatePost));
    },
  });
}

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

      const cache = queryClient.getQueryData<Record<string, AuthorInfo>>(newsKeys.authors()) ?? {};
      if (!cache[user.uid]) {
        queryClient.setQueryData<Record<string, AuthorInfo>>(newsKeys.authors(), {
          ...cache,
          [user.uid]: {
            uid: user.uid,
            fullName: userProfile.fullName,
            avatarUrl: userProfile.profilePicture?.uri,
            role: userProfile.role,
          },
        });
      }

      const reply: Reply = {
        id: `r-${Date.now()}`,
        authorId: user.uid,
        content,
        date: new Date(),
      };

      const updatePost = (post: NewsPost) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((c) =>
                c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c
              ),
            }
          : post;

      queryClient.setQueryData<InfiniteData<FeedPage>>(newsKeys.feed(), (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map(updatePost),
          })),
        };
      });
      
      queryClient.setQueryData<NewsPost[]>(newsKeys.pinned(), (old) => old?.map(updatePost));
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
      const updatePost = (post: NewsPost) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((c) =>
                c.id === commentId
                  ? { ...c, replies: c.replies.filter((r) => r.id !== replyId) }
                  : c
              ),
            }
          : post;

      queryClient.setQueryData<InfiniteData<FeedPage>>(newsKeys.feed(), (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map(updatePost),
          })),
        };
      });
      
      queryClient.setQueryData<NewsPost[]>(newsKeys.pinned(), (old) => old?.map(updatePost));
    },
  });
}
