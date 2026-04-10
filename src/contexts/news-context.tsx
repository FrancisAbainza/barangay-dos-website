"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { NewsPost, Comment, Reply, Category } from "@/schemas/news-schema";
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

// ── Category feed state ───────────────────────────────────────

interface CategoryFeedState {
  posts: NewsPost[];
  cursor: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
}

type CategoryFeedsState = Record<Category, CategoryFeedState>;

const EMPTY_FEED: CategoryFeedState = { posts: [], cursor: null, hasMore: true, isLoadingMore: false };
const INITIAL_FEEDS: CategoryFeedsState = {
  Announcement: { ...EMPTY_FEED },
  Event: { ...EMPTY_FEED },
  Emergency: { ...EMPTY_FEED },
};

// ── Context type ──────────────────────────────────────────────

interface NewsContextType {
  // All-posts feed
  posts: NewsPost[];
  hasMore: boolean;
  loadMore: () => void;
  isLoadingMore: boolean;
  addPost: (post: NewsPost) => void;
  updatePost: (updated: NewsPost) => void;
  removePost: (postId: string) => void;
  // Pinned
  pinnedPosts: NewsPost[];
  // Saved
  savedPosts: NewsPost[];
  savedPostIds: Set<string>;
  toggleSavedPost: (postId: string) => void;
  // Reactions
  applyReaction: (postId: string, type: "like" | "dislike") => void;
  // Comments
  addComment: (postId: string, content: string) => void;
  addReply: (postId: string, commentId: string, content: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  deleteReply: (postId: string, commentId: string, replyId: string) => void;
  // Authors
  authors: Record<string, AuthorInfo>;
  // Per-category feeds
  categoryFeeds: CategoryFeedsState;
  loadMoreCategory: (category: Category) => void;
}

const NewsContext = createContext<NewsContextType | null>(null);

export function NewsProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile } = useAuth();

  // ── All-posts feed ───────────────────────────────────────────
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, startLoadMore] = useTransition();
  const initialFetchDone = useRef(false);

  // ── Pinned & Saved ───────────────────────────────────────────
  const [pinnedPosts, setPinnedPosts] = useState<NewsPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<NewsPost[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());

  // ── Author cache ─────────────────────────────────────────────
  const [authors, setAuthors] = useState<Record<string, AuthorInfo>>({});
  const cachedAuthorIds = useRef(new Set<string>());

  const fetchAuthors = useCallback((newPosts: NewsPost[]) => {
    const ids = new Set<string>();
    for (const p of newPosts) {
      ids.add(p.authorId);
      for (const c of p.comments) {
        ids.add(c.authorId);
        for (const r of c.replies) ids.add(r.authorId);
      }
    }
    const missing = [...ids].filter((id) => !cachedAuthorIds.current.has(id));
    if (missing.length === 0) return;
    missing.forEach((id) => cachedAuthorIds.current.add(id));
    getAuthorInfoBatch(missing).then((batch) => {
      setAuthors((current) => ({ ...current, ...batch }));
    });
  }, []);

  // ── Per-category feeds ───────────────────────────────────────
  const [categoryFeeds, setCategoryFeeds] = useState<CategoryFeedsState>(INITIAL_FEEDS);
  // Ref so loadMoreCategory can read the latest cursor without a stale closure
  const categoryFeedsRef = useRef(categoryFeeds);
  useEffect(() => { categoryFeedsRef.current = categoryFeeds; }, [categoryFeeds]);

  // ── Initial load ─────────────────────────────────────────────
  useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;

    (async () => {
      const [feedResult, pinned, announcements, events, emergencies] = await Promise.all([
        getNewsPosts(),
        getPinnedPosts(),
        getNewsPosts(undefined, "Announcement"),
        getNewsPosts(undefined, "Event"),
        getNewsPosts(undefined, "Emergency"),
      ]);

      setPosts(feedResult.posts);
      setCursor(feedResult.nextCursor);
      setHasMore(feedResult.nextCursor !== null);
      setPinnedPosts(pinned);

      setCategoryFeeds({
        Announcement: { posts: announcements.posts, cursor: announcements.nextCursor, hasMore: announcements.nextCursor !== null, isLoadingMore: false },
        Event: { posts: events.posts, cursor: events.nextCursor, hasMore: events.nextCursor !== null, isLoadingMore: false },
        Emergency: { posts: emergencies.posts, cursor: emergencies.nextCursor, hasMore: emergencies.nextCursor !== null, isLoadingMore: false },
      });

      fetchAuthors([...feedResult.posts, ...pinned, ...announcements.posts, ...events.posts, ...emergencies.posts]);
    })();
  }, [fetchAuthors]);

  // ── Load saved posts when user changes ───────────────────────
  useEffect(() => {
    const ids = userProfile?.savedPostIds ?? [];
    setSavedPostIds(new Set(ids));

    if (ids.length > 0) {
      getPostsByIds(ids).then((posts) => {
        setSavedPosts(posts);
        fetchAuthors(posts);
      });
    } else {
      setSavedPosts([]);
    }
  }, [userProfile?.uid, userProfile?.savedPostIds, fetchAuthors]);

  // ── Load more: all feed ───────────────────────────────────────
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || !cursor) return;
    startLoadMore(async () => {
      const result = await getNewsPosts(cursor);
      setPosts((prev) => [...prev, ...result.posts]);
      setCursor(result.nextCursor);
      setHasMore(result.nextCursor !== null);
      fetchAuthors(result.posts);
    });
  }, [hasMore, isLoadingMore, cursor, fetchAuthors]);

  // ── Load more: per-category ───────────────────────────────────
  const loadMoreCategory = useCallback((category: Category) => {
    const feed = categoryFeedsRef.current[category];
    if (!feed.hasMore || feed.isLoadingMore || !feed.cursor) return;
    setCategoryFeeds((prev) => ({ ...prev, [category]: { ...prev[category], isLoadingMore: true } }));
    getNewsPosts(feed.cursor, category)
      .then((result) => {
        setCategoryFeeds((prev) => ({
          ...prev,
          [category]: {
            posts: [...prev[category].posts, ...result.posts],
            cursor: result.nextCursor,
            hasMore: result.nextCursor !== null,
            isLoadingMore: false,
          },
        }));
        fetchAuthors(result.posts);
      })
      .catch(console.error);
  }, [fetchAuthors]);

  // ── CRUD helpers (optimistic) ─────────────────────────────────
  const addPost = useCallback((post: NewsPost) => {
    setPosts((prev) => [post, ...prev]);
    if (post.pinned) setPinnedPosts((prev) => [post, ...prev]);
    setCategoryFeeds((prev) => ({
      ...prev,
      [post.category]: { ...prev[post.category], posts: [post, ...prev[post.category].posts] },
    }));
    fetchAuthors([post]);
  }, [fetchAuthors]);

  const updatePost = useCallback((updated: NewsPost) => {
    const updater = (prev: NewsPost[]) => prev.map((p) => (p.id === updated.id ? updated : p));
    setPosts(updater);
    setPinnedPosts((prev) => {
      const without = prev.filter((p) => p.id !== updated.id);
      return updated.pinned ? [updated, ...without] : without;
    });
    setSavedPosts(updater);
    setCategoryFeeds((prev) => {
      const next = { ...prev };
      for (const cat of ["Announcement", "Event", "Emergency"] as Category[]) {
        const feed = prev[cat];
        const exists = feed.posts.some((p) => p.id === updated.id);
        if (updated.category === cat) {
          next[cat] = { ...feed, posts: exists ? feed.posts.map((p) => (p.id === updated.id ? updated : p)) : [updated, ...feed.posts] };
        } else if (exists) {
          next[cat] = { ...feed, posts: feed.posts.filter((p) => p.id !== updated.id) };
        }
      }
      return next;
    });
  }, []);

  const removePost = useCallback((postId: string) => {
    const remover = (prev: NewsPost[]) => prev.filter((p) => p.id !== postId);
    setPosts(remover);
    setPinnedPosts(remover);
    setSavedPosts(remover);
    setCategoryFeeds((prev) => ({
      Announcement: { ...prev.Announcement, posts: prev.Announcement.posts.filter((p) => p.id !== postId) },
      Event: { ...prev.Event, posts: prev.Event.posts.filter((p) => p.id !== postId) },
      Emergency: { ...prev.Emergency, posts: prev.Emergency.posts.filter((p) => p.id !== postId) },
    }));
    deleteNewsPost(postId).catch(console.error);
  }, []);

  // ── Saved posts ───────────────────────────────────────────────
  const toggleSaved = useCallback((postId: string) => {
    if (!user) return;
    const wasSaved = savedPostIds.has(postId);
    setSavedPostIds((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(postId);
      else next.add(postId);
      return next;
    });
    if (wasSaved) {
      setSavedPosts((sp) => sp.filter((p) => p.id !== postId));
    } else {
      const post = posts.find((p) => p.id === postId) ?? pinnedPosts.find((p) => p.id === postId);
      if (post) setSavedPosts((sp) => [post, ...sp]);
    }
    toggleSavedPostForUser(user.uid, postId, !wasSaved).catch(console.error);
  }, [user, posts, pinnedPosts, savedPostIds]);

  // ── Reactions ─────────────────────────────────────────────────
  const applyReaction = useCallback((postId: string, type: "like" | "dislike") => {
    if (!user) return;
    const userId = user.uid;
    const updateReaction = (post: NewsPost) => {
      if (post.id !== postId) return post;
      const alreadyInTarget = type === "like" ? post.likes.includes(userId) : post.dislikes.includes(userId);
      const likes = post.likes.filter((id) => id !== userId);
      const dislikes = post.dislikes.filter((id) => id !== userId);
      if (!alreadyInTarget) {
        if (type === "like") likes.push(userId);
        else dislikes.push(userId);
      }
      return { ...post, likes, dislikes };
    };
    setPosts((prev) => prev.map(updateReaction));
    setPinnedPosts((prev) => prev.map(updateReaction));
    setSavedPosts((prev) => prev.map(updateReaction));
    setCategoryFeeds((prev) => ({
      Announcement: { ...prev.Announcement, posts: prev.Announcement.posts.map(updateReaction) },
      Event: { ...prev.Event, posts: prev.Event.posts.map(updateReaction) },
      Emergency: { ...prev.Emergency, posts: prev.Emergency.posts.map(updateReaction) },
    }));
    toggleReaction(postId, userId, type).catch(console.error);
  }, [user]);

  // ── Comments & Replies ────────────────────────────────────────
  const addComment = useCallback((postId: string, content: string) => {
    if (!user || !userProfile) return;
    // Seed the current user into the author cache so their name shows immediately.
    setAuthors((prev) =>
      prev[user.uid]
        ? prev
        : {
            ...prev,
            [user.uid]: {
              uid: user.uid,
              fullName: userProfile.fullName,
              avatarUrl: typeof userProfile.profilePicture?.[0]?.uri === "string" ? userProfile.profilePicture[0].uri : undefined,
              role: userProfile.role,
            },
          },
    );
    const comment: Comment = {
      id: `c-${Date.now()}`,
      authorId: user.uid,
      content,
      date: new Date(),
      replies: [],
    };
    const updater = (post: NewsPost) =>
      post.id === postId ? { ...post, comments: [...post.comments, comment] } : post;
    setPosts((prev) => prev.map(updater));
    setPinnedPosts((prev) => prev.map(updater));
    setSavedPosts((prev) => prev.map(updater));
    setCategoryFeeds((prev) => ({
      Announcement: { ...prev.Announcement, posts: prev.Announcement.posts.map(updater) },
      Event: { ...prev.Event, posts: prev.Event.posts.map(updater) },
      Emergency: { ...prev.Emergency, posts: prev.Emergency.posts.map(updater) },
    }));
    addCommentToPost(postId, { id: comment.id, authorId: user.uid, content }).catch(console.error);
  }, [user, userProfile]);

  const addReplyFn = useCallback((postId: string, commentId: string, content: string) => {
    if (!user || !userProfile) return;
    // Seed the current user into the author cache so their name shows immediately.
    setAuthors((prev) =>
      prev[user.uid]
        ? prev
        : {
            ...prev,
            [user.uid]: {
              uid: user.uid,
              fullName: userProfile.fullName,
              avatarUrl: typeof userProfile.profilePicture?.[0]?.uri === "string" ? userProfile.profilePicture[0].uri : undefined,
              role: userProfile.role,
            },
          },
    );
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
            c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c,
          ),
        };
    setPosts((prev) => prev.map(updater));
    setPinnedPosts((prev) => prev.map(updater));
    setSavedPosts((prev) => prev.map(updater));
    setCategoryFeeds((prev) => ({
      Announcement: { ...prev.Announcement, posts: prev.Announcement.posts.map(updater) },
      Event: { ...prev.Event, posts: prev.Event.posts.map(updater) },
      Emergency: { ...prev.Emergency, posts: prev.Emergency.posts.map(updater) },
    }));
    addReplyToComment(postId, commentId, { id: reply.id, authorId: user.uid, content }).catch(console.error);
  }, [user, userProfile]);

  const deleteCommentFn = useCallback((postId: string, commentId: string) => {
    const updater = (post: NewsPost) =>
      post.id !== postId
        ? post
        : { ...post, comments: post.comments.filter((c) => c.id !== commentId) };
    setPosts((prev) => prev.map(updater));
    setPinnedPosts((prev) => prev.map(updater));
    setSavedPosts((prev) => prev.map(updater));
    setCategoryFeeds((prev) => ({
      Announcement: { ...prev.Announcement, posts: prev.Announcement.posts.map(updater) },
      Event: { ...prev.Event, posts: prev.Event.posts.map(updater) },
      Emergency: { ...prev.Emergency, posts: prev.Emergency.posts.map(updater) },
    }));
    deleteCommentFromPost(postId, commentId).catch(console.error);
  }, []);

  const deleteReplyFn = useCallback((postId: string, commentId: string, replyId: string) => {
    const updater = (post: NewsPost) =>
      post.id !== postId
        ? post
        : {
            ...post,
            comments: post.comments.map((c) =>
              c.id !== commentId
                ? c
                : { ...c, replies: c.replies.filter((r) => r.id !== replyId) },
            ),
          };
    setPosts((prev) => prev.map(updater));
    setPinnedPosts((prev) => prev.map(updater));
    setSavedPosts((prev) => prev.map(updater));
    setCategoryFeeds((prev) => ({
      Announcement: { ...prev.Announcement, posts: prev.Announcement.posts.map(updater) },
      Event: { ...prev.Event, posts: prev.Event.posts.map(updater) },
      Emergency: { ...prev.Emergency, posts: prev.Emergency.posts.map(updater) },
    }));
    deleteReplyFromComment(postId, commentId, replyId).catch(console.error);
  }, []);

  return (
    <NewsContext.Provider
      value={{
        posts,
        hasMore,
        loadMore,
        isLoadingMore,
        addPost,
        updatePost,
        removePost,
        pinnedPosts,
        savedPosts,
        savedPostIds,
        toggleSavedPost: toggleSaved,
        applyReaction,
        addComment,
        addReply: addReplyFn,
        deleteComment: deleteCommentFn,
        deleteReply: deleteReplyFn,
        authors,
        categoryFeeds,
        loadMoreCategory,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
}

export function useNews() {
  const ctx = useContext(NewsContext);
  if (!ctx) throw new Error("useNews must be used within a NewsProvider");
  return ctx;
}
