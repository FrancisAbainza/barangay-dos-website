# NewsProvider — Internals & Scenario Reference

**File:** `src/contexts/news-context.tsx`

This document explains every piece of state, every internal pattern, and exactly which functions run — and why — in each real-world usage scenario.

---

## State Inventory

| State variable | Kind | Description |
|---|---|---|
| `posts` | `useState<NewsPost[]>` | The flat, paginated all-posts feed shown in the "All" tab |
| `cursor` | `useState<string \| null>` | Firestore document ID used as the `startAfter` cursor for the next all-posts page |
| `hasMore` | `useState<boolean>` | `true` until a page comes back with fewer docs than `PAGE_SIZE` |
| `isLoadingMore` | `useTransition` pending flag | Concurrent-safe loading indicator for the all-posts feed |
| `pinnedPosts` | `useState<NewsPost[]>` | Posts with `pinned: true`; initialized once on mount from `getPinnedPosts()` |
| `savedPosts` | `useState<NewsPost[]>` | Full `NewsPost` objects the current user has saved |
| `savedPostIds` | `useState<Set<string>>` | Set of post IDs the user has saved; compared against on every render for the save icon |
| `authors` | `useState<Record<string, AuthorInfo>>` | Author display info cache keyed by Firebase UID |
| `cachedAuthorIds` | `useRef<Set<string>>` | Tracks UIDs that are already in-cache or in-flight; read synchronously to prevent duplicate fetches without going through `setState` |
| `categoryFeeds` | `useReducer(categoryFeedsReducer)` | Independent paginated feed for each of the three categories |
| `categoryFeedsRef` | `useRef<CategoryFeedsState>` | Mirror of `categoryFeeds` updated via `useEffect`; lets `loadMoreCategory` read the latest cursor without a stale closure |
| `initialFetchDone` | `useRef<boolean>` | Guards the initial load from running twice (React StrictMode double-invoke) |

---

## The Category Feeds Reducer

`categoryFeeds` is managed with `useReducer` instead of `useState` because it holds three independent objects that all need to be updated atomically in response to cross-cutting mutations (reactions, comments, replies, delete).

```ts
type CategoryFeedAction =
  | { type: "SET";        category; posts; nextCursor }   // replace feed on initial load
  | { type: "APPEND";     category; posts; nextCursor }   // append on loadMore
  | { type: "SET_LOADING"; category }                      // mark tab as loading
  | { type: "ADD_POST";   post }                           // prepend to matching category
  | { type: "UPDATE_POST"; post }                          // move post between categories if needed
  | { type: "REMOVE_POST"; postId }                        // remove from all three feeds
  | { type: "MAP"; fn: (post) => post }                    // apply a transform to every post in all feeds
```

### Why `MAP` instead of separate actions per mutation?

Reactions, comments, and replies all follow the same shape: *"given this post, return an updated copy."* A single `MAP` action lets the reducer apply any such transform across all three category feeds in one dispatch, eliminating copy-paste between `applyReaction`, `addComment`, and `addReplyFn`.

### `UPDATE_POST` — category change handling

When a post is edited and its category changes (e.g. `Announcement` → `Event`), `UPDATE_POST` will:
1. Add/replace the post in the **new** category feed.
2. Remove the post from the **old** category feed.

This keeps category feeds consistent without needing a remove + insert in two separate dispatches.

---

## The Author Cache Pattern

Author display info (name, avatar, role) is not stored on post documents. Instead:

1. Every time a batch of posts arrives (initial load, `loadMore`, `loadMoreCategory`, new post, saved posts), `fetchAuthors(posts)` is called.
2. `fetchAuthors` scans all `authorId` fields on posts, comments, and replies to collect unique UIDs.
3. It checks `cachedAuthorIds.current` — a **ref** (not state) — to synchronously filter out UIDs already fetched or in-flight.
4. Missing UIDs are marked in the ref immediately (before the async call), so concurrent calls won't fetch the same UID twice.
5. `getAuthorInfoBatch(missing)` is called and on resolution `setAuthors` merges the result into the cache.

The ref pattern is essential here. If `cachedAuthorIds` were normal state, the check `!cachedAuthorIds.has(id)` inside `fetchAuthors` would always read the value from the last render, allowing duplicate in-flight requests during the same render cycle.

---

## Solving the Stale Closure Problem in `loadMoreCategory`

`loadMoreCategory` needs to read the **current** `cursor` for a given category. If it captured `categoryFeeds` via the closure at the time `useCallback` runs, it would always use the cursor from the first render (stale closure).

The solution is a ref mirror:

```ts
const categoryFeedsRef = useRef(categoryFeeds);
useEffect(() => { categoryFeedsRef.current = categoryFeeds; }, [categoryFeeds]);

const loadMoreCategory = useCallback((category: Category) => {
  const feed = categoryFeedsRef.current[category]; // always current
  if (!feed.hasMore || feed.isLoadingMore || !feed.cursor) return;
  ...
}, [fetchAuthors]); // stable — no dependency on categoryFeeds
```

This gives `loadMoreCategory` a stable identity (it never needs to be re-created) while still reading the latest cursor on every call.

---

## Scenario Reference

### 1. Page loads for the first time

**Trigger:** The `useEffect` with `initialFetchDone` guard runs once on mount.

**What runs:**
```
Promise.all([
  getNewsPosts(),                          // all-posts page 1
  getPinnedPosts(),                        // all pinned posts
  getNewsPosts(undefined, "Announcement"), // Announcement page 1
  getNewsPosts(undefined, "Event"),        // Event page 1
  getNewsPosts(undefined, "Emergency"),    // Emergency page 1
])
```

**State changes:**
- `setPosts(feedResult.posts)` + `setCursor(...)` + `setHasMore(...)`
- `setPinnedPosts(pinned)`
- `dispatchCategoryFeeds({ type: "SET", category: "Announcement", ... })`
- `dispatchCategoryFeeds({ type: "SET", category: "Event", ... })`
- `dispatchCategoryFeeds({ type: "SET", category: "Emergency", ... })`
- `fetchAuthors([...all posts from all 5 queries])` → `setAuthors` when resolved

**Why 5 parallel queries?** Each tab owns its own independent cursor. If we only fetched the all-posts feed and filtered client-side, paging the "Announcement" tab would require paging through the unfiltered feed until `PAGE_SIZE` announcements were found — wasting reads and giving incorrect `hasMore` signals.

---

### 2. User scrolls to the bottom of the "All" tab

**Trigger:** `IntersectionObserver` in `PostFeed` detects the sentinel, calls `loadMore()`.

**What runs:**
```ts
loadMore()
  → startLoadMore(async () => {
      const result = await getNewsPosts(cursor)
      setPosts(prev => [...prev, ...result.posts])
      setCursor(result.nextCursor)
      setHasMore(result.nextCursor !== null)
      fetchAuthors(result.posts)
    })
```

`startLoadMore` is `useTransition` — React marks this as a non-urgent update, keeping the UI responsive while the fetch is in-flight. `isLoadingMore` becomes `true` during the transition, which `PostFeed` uses to show a skeleton.

---

### 3. User scrolls to the bottom of a category tab (e.g. "Announcements")

**Trigger:** `IntersectionObserver` calls `loadMoreAnnouncements` (which is `useCallback(() => loadMoreCategory("Announcement"), [loadMoreCategory])`).

**What runs:**
```ts
loadMoreCategory("Announcement")
  → reads categoryFeedsRef.current["Announcement"]  // not stale
  → dispatchCategoryFeeds({ type: "SET_LOADING", category: "Announcement" })
  → getNewsPosts(feed.cursor, "Announcement")
      .then(result => {
        dispatchCategoryFeeds({ type: "APPEND", category: "Announcement", ...result })
        fetchAuthors(result.posts)
      })
```

`SET_LOADING` sets `isLoadingMore: true` for that feed immediately so the skeleton appears. `APPEND` prepends to the existing posts array and updates cursor/hasMore when the fetch resolves.

---

### 4. User logs in (or logs out)

**Trigger:** `userProfile` changes in `useAuth()`, which triggers the saved-posts `useEffect`.

**What runs on login:**
```ts
const ids = userProfile.savedPostIds  // non-empty
setSavedPostIds(new Set(ids))
getPostsByIds(ids).then(posts => {
  setSavedPosts(posts)
  fetchAuthors(posts)
})
```

**What runs on logout:**
```ts
const ids = []
setSavedPostIds(new Set())
setSavedPosts([])
// getPostsByIds is skipped
```

---

### 5. Staff creates a new post

**Trigger:** `CreateNewsDialog` calls `createNewsPost(data)` (server action), then calls `addPost(newPost)` from context.

**What runs:**
```ts
addPost(post)
  → setPosts(prev => [post, ...prev])                      // prepend to all-posts feed
  → if (post.pinned) setPinnedPosts(prev => [post, ...prev])
  → dispatchCategoryFeeds({ type: "ADD_POST", post })      // prepend to matching category feed
  → fetchAuthors([post])                                    // cache the author
```

The `ADD_POST` reducer action only modifies the feed whose key matches `post.category`, leaving the other two untouched.

---

### 6. Staff edits an existing post

**Trigger:** `EditNewsDialog` calls `updateNewsPost(postId, data)` (server action), then calls `updatePost(updatedPost)` from context.

**What runs:**
```ts
updatePost(updated)
  → setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
  → setPinnedPosts(prev => {
      const without = prev.filter(p => p.id !== updated.id)
      return updated.pinned ? [updated, ...without] : without
    })
  → setSavedPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
  → dispatchCategoryFeeds({ type: "UPDATE_POST", post: updated })
```

The `UPDATE_POST` reducer action handles a category change: if the post previously lived in the "Event" feed but is now "Announcement", the reducer:
1. Replaces/inserts the post in `["Announcement"]`
2. Removes the post from `["Event"]`
3. Leaves `["Emergency"]` untouched

---

### 7. Staff deletes a post

**Trigger:** `PostBody` delete button calls `removePost(postId)` from context.

**What runs:**
```ts
removePost(postId)
  → setPosts(prev => prev.filter(p => p.id !== postId))
  → setPinnedPosts(prev => prev.filter(p => p.id !== postId))
  → setSavedPosts(prev => prev.filter(p => p.id !== postId))
  → dispatchCategoryFeeds({ type: "REMOVE_POST", postId })  // removes from all 3 feeds
  → deleteNewsPost(postId).catch(console.error)              // background Firestore delete
```

State updates happen immediately (all posts disappear from every feed simultaneously) and the Firestore write is fire-and-forget.

---

### 8. User likes or dislikes a post

**Trigger:** `PostBody` reaction button calls `applyReaction(postId, "like")`.

**What runs:**
```ts
applyReaction(postId, "like")
  → const userId = user.uid
  → builds updateReaction = (post) => {
      if (post.id !== postId) return post
      // toggle: remove from both arrays, add back to target only if not already there
      const alreadyLiked = post.likes.includes(userId)
      const likes = post.likes.filter(id => id !== userId)
      const dislikes = post.dislikes.filter(id => id !== userId)
      if (!alreadyLiked) likes.push(userId)
      return { ...post, likes, dislikes }
    }
  → setPosts(prev => prev.map(updateReaction))
  → setPinnedPosts(prev => prev.map(updateReaction))
  → setSavedPosts(prev => prev.map(updateReaction))
  → dispatchCategoryFeeds({ type: "MAP", fn: updateReaction })
  → toggleReaction(postId, userId, "like").catch(console.error)
```

The same `updateReaction` function is applied to every feed at once via the `MAP` action, so the like count stays consistent regardless of which tab or panel the post appears in. If the user had already liked the post, the second call removes the like (toggle behavior).

---

### 9. User adds a comment

**Trigger:** `PostComments` submit handler calls `addComment(postId, content)`.

**What runs:**
```ts
addComment(postId, content)
  → creates comment = { id: `c-${Date.now()}`, authorId: user.uid, content, date: new Date(), replies: [] }
  → builds updater = (post) => post.id === postId ? { ...post, comments: [...post.comments, comment] } : post
  → setPosts(prev => prev.map(updater))
  → setPinnedPosts(prev => prev.map(updater))
  → setSavedPosts(prev => prev.map(updater))
  → dispatchCategoryFeeds({ type: "MAP", fn: updater })
  → addCommentToPost(postId, { id, authorId, content }).catch(console.error)
```

The temporary comment `id` (`c-${Date.now()}`) is a client-side optimistic ID. The Firestore `arrayUnion` write preserves it. There is no server-generated ID reconciliation — the client ID is the permanent ID.

---

### 10. User adds a reply to a comment

**Trigger:** `CommentItem` reply submit handler calls `addReply(postId, commentId, content)`.

**What runs:**
```ts
addReplyFn(postId, commentId, content)
  → creates reply = { id: `r-${Date.now()}`, authorId: user.uid, content, date: new Date() }
  → builds updater = (post) =>
      post.id !== postId ? post : {
        ...post,
        comments: post.comments.map(c =>
          c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c
        )
      }
  → setPosts / setPinnedPosts / setSavedPosts via prev.map(updater)
  → dispatchCategoryFeeds({ type: "MAP", fn: updater })
  → addReplyToComment(postId, commentId, { id, authorId, content }).catch(console.error)
```

---

### 11. User saves or unsaves a post

**Trigger:** `PostBody` dropdown "Save" / "Unsave" item calls `toggleSavedPost(postId)`.

**What runs:**
```ts
toggleSaved(postId)
  → const wasSaved = savedPostIds.has(postId)   // read from closure — no async, no setState
  → setSavedPostIds(prev => {
      const next = new Set(prev)
      if (wasSaved) next.delete(postId)
      else next.add(postId)
      return next
    })
  → if (wasSaved)
      setSavedPosts(sp => sp.filter(p => p.id !== postId))
    else
      const post = posts.find(p => p.id === postId) ?? pinnedPosts.find(p => p.id === postId)
      if (post) setSavedPosts(sp => [post, ...sp])
  → toggleSavedPostForUser(user.uid, postId, !wasSaved).catch(console.error)
```

`wasSaved` is computed **outside** any setState callback from the closure value. This is important: calling a server action (which internally calls `startTransition`) inside a `setState` updater causes a React warning (`Cannot update a component while rendering a different component`).

---

## Key Design Decisions

### 1. `useTransition` for the all-posts `loadMore` only

The all-posts feed uses `useTransition` (`startLoadMore`) so that appending many posts doesn't block interaction. The category feed `loadMoreCategory` uses plain async + `SET_LOADING` dispatch instead, because `useReducer` dispatches are already batched by React 18.

### 2. `initialFetchDone` ref instead of an empty-dependency `useEffect`

React StrictMode mounts components twice in development. An empty `[]` dependency array would mean the effect runs twice. The ref guard (`if (initialFetchDone.current) return`) ensures the 5 parallel Firestore queries only fire once regardless of StrictMode.

### 3. Server actions cannot be called inside state setter functions

`getAuthorInfoBatch`, `toggleSavedPostForUser`, and all other `"use server"` functions internally call `startTransition` on the Router. React forbids calling `startTransition` inside a state updater (it causes the "Cannot update a component while rendering" warning). All server action calls in this file happen as top-level statements, never inside a `setState(prev => ...)` callback.

### 4. `authors` is a global cache, not per-post

Author info is merged into a single flat `Record<uid, AuthorInfo>`. Components look up `authors[post.authorId]` directly. This means a given user's avatar and name are fetched at most once per session regardless of how many posts they've authored.
