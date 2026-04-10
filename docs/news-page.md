# News Page — Structure & Architecture

## Overview

The news page is split between a **Server Component** that fetches data and a **Client Component** tree that owns all UI state and interactions. A `NewsProvider` context sits at the root of the client tree and acts as the single source of truth, eliminating prop drilling across all children.

---

## Data Flow

```
Firestore (news collection)
        │
        ▼
getNewsPosts(cursor?, category?)   ← optional category filter for per-tab feeds
        │
        ▼
NewsPage (Server Component)   src/app/staff/news/page.tsx
        │  props: barangayName
        ▼
NewsPageDashboard (Client Component)   src/components/news/news-page-dashboard.tsx
        │  wraps children in NewsProvider
        │
        ▼
NewsProvider (Context)   src/contexts/news-context.tsx
        │  owns: posts: NewsPost[]              (all-posts feed, single source of truth)
        │  owns: categoryFeeds: Record<Category, CategoryFeedState>  (per-category feeds)
        │  owns: addPost, updatePost, removePost
        │  owns: savedPostIds, toggleSavedPost  (persisted per-user in Firestore)
        │  owns: applyReaction, addComment, addReply
        │  owns: authors: Record<string, AuthorInfo>  (author display info cache)
        │
        ├── CreateNewsDialog ──▶ NewsForm ──▶ MediaUploader, AttachmentPicker
        ├── PinnedPostsPanel ──▶ PostPreview, PostDetailDialog ──▶ PostBody + PostComments
        ├── PostFeed ×4 tabs:
        │     "all"             ──▶ posts (all-posts feed)
        │     "announcement"    ──▶ categoryFeeds["Announcement"]
        │     "event"           ──▶ categoryFeeds["Event"]
        │     "emergency"       ──▶ categoryFeeds["Emergency"]
        │     each ──▶ PostCard ──▶ PostBody, PostDetailDialog ──▶ PostBody + PostComments
        └── SavedPostsPanel ──▶ PostDetailDialog ──▶ PostBody + PostComments
                                                          │
                                                          └── CommentItem ──▶ ReplyItem
```

---

## Full Component Tree

```
NewsPage  (Server Component)
└── NewsPageDashboard
    └── NewsProvider
        ├── CreateNewsDialog
        │   └── Dialog
        │       └── NewsForm
        │           ├── MediaUploader
        │           └── AttachmentPicker
        │
        ├── PinnedPostsPanel
        │   ├── PostPreview  (×n pinned posts)
        │   └── PostDetailDialog  (when a preview is clicked)
        │       ├── PostBody
        │       │   ├── Avatar
        │       │   ├── Badge
        │       │   ├── DropdownMenu  (Save/Unsave + Edit/Delete if canManage)
        │       │   │   └── EditNewsDialog  (canManage only)
        │       │   │       └── NewsForm
        │       │   │           ├── MediaUploader
        │       │   │           └── AttachmentPicker
        │       │   └── MediaGallery  (when post.media exists)
        │       └── PostComments
        │           └── CommentItem  (×n)
        │               └── ReplyItem  (×n)
        │
        ├── PostFeed  (×4 — one per tab: All / Announcement / Event / Emergency)
        │   └── PostCard  (×n)
        │       ├── PostBody
        │       │   ├── Avatar
        │       │   ├── Badge
        │       │   ├── DropdownMenu  (Save/Unsave + Edit/Delete if canManage)
        │       │   │   └── EditNewsDialog  (canManage only)
        │       │   │       └── NewsForm
        │       │   │           ├── MediaUploader
        │       │   │           └── AttachmentPicker
        │       │   └── MediaGallery  (when post.media exists)
        │       └── PostDetailDialog  (when comment count is clicked)
        │           ├── PostBody
        │           │   ├── Avatar
        │           │   ├── Badge
        │           │   ├── DropdownMenu  (Save/Unsave + Edit/Delete if canManage)
        │           │   │   └── EditNewsDialog  (canManage only)
        │           │   │       └── NewsForm
        │           │   │           ├── MediaUploader
        │           │   │           └── AttachmentPicker
        │           │   └── MediaGallery  (when post.media exists)
        │           └── PostComments
        │               └── CommentItem  (×n)
        │                   └── ReplyItem  (×n)
        │
        └── SavedPostsPanel
            └── PostDetailDialog  (when a saved post is clicked)
                ├── PostBody
                │   ├── Avatar
                │   ├── Badge
                │   ├── DropdownMenu  (Save/Unsave + Edit/Delete if canManage)
                │   │   └── EditNewsDialog  (canManage only)
                │   │       └── NewsForm
                │   │           ├── MediaUploader
                │   │           └── AttachmentPicker
                │   └── MediaGallery  (when post.media exists)
                └── PostComments
                    └── CommentItem  (×n)
                        └── ReplyItem  (×n)
```

---

## Component Reference

### `NewsPageDashboard`
**File:** `src/components/news/news-page-dashboard.tsx`
**Type:** Client Component
**Props:** `barangayName: string`
**Responsibilities:**
- Wraps the entire client tree in `NewsProvider`
- Delegates all rendering to the inner `NewsPageContent` component (required so `useNews()` can be called inside the provider boundary)
- `NewsPageContent` pulls `posts`, `hasMore`, `loadMore`, `isLoadingMore`, `categoryFeeds`, and `loadMoreCategory` from `useNews()`
- Creates stable `useCallback` wrappers (`loadMoreAnnouncements`, `loadMoreEvents`, `loadMoreEmergencies`) so the `IntersectionObserver` in `PostFeed` does not reconnect on every render
- Renders one `PostFeed` per tab: the "All" tab consumes the flat `posts` array; the three category tabs each consume their own independent `categoryFeeds[category]` slice

---

### `NewsProvider` / `useNews()`
**File:** `src/contexts/news-context.tsx`
**Type:** Context Provider + Hook
**State:**

| Key | Type | Description |
|---|---|---|
| `posts` | `NewsPost[]` | All-posts feed — single source of truth for the "All" tab |
| `hasMore` | `boolean` | Whether more pages exist for the all-posts feed |
| `isLoadingMore` | `boolean` | `useTransition` pending state for the all-posts feed |
| `loadMore` | `() => void` | Appends the next page to `posts` |
| `addPost` | `(post: NewsPost) => void` | Prepends a new post to `posts`, the matching category feed, and `pinnedPosts` if pinned |
| `updatePost` | `(post: NewsPost) => void` | Replaces a post by ID across all feeds; moves it between category feeds if the category changed |
| `removePost` | `(postId: string) => void` | Removes a post from all feeds and fires `deleteNewsPost` in the background |
| `pinnedPosts` | `NewsPost[]` | Posts with `pinned: true`; initialized from `getPinnedPosts()` |
| `savedPosts` | `NewsPost[]` | Full post objects the current user has saved |
| `savedPostIds` | `Set<string>` | IDs of bookmarked posts; initialized from `userProfile.savedPostIds` |
| `toggleSavedPost` | `(postId: string) => void` | Optimistically toggles local set and post list; persists to user document in Firestore |
| `applyReaction` | `(postId, type) => void` | Optimistically toggles like/dislike across all feeds and category feeds via the `MAP` reducer action; persists via Firestore transaction |
| `addComment` | `(postId, content) => void` | Optimistically appends a comment across all feeds via `MAP`; persists via `arrayUnion` |
| `addReply` | `(postId, commentId, content) => void` | Optimistically splices a reply into the correct comment across all feeds via `MAP`; persists via Firestore transaction |
| `authors` | `Record<string, AuthorInfo>` | Cached author display info (name, avatar, role) keyed by UID |
| `categoryFeeds` | `Record<Category, { posts, hasMore, isLoadingMore }>` | Independent paginated feed for each category (Announcement / Event / Emergency) |
| `loadMoreCategory` | `(category: Category) => void` | Appends the next page of the given category feed; reads cursor from a ref to avoid stale closures |

All mutations are consumed directly via `useNews()` — nothing is prop-drilled.

**Auth dependency:** `NewsProvider` calls `useAuth()` internally to read `user.uid` for saved-post persistence and to initialize `savedPostIds` from `userProfile.savedPostIds`. Re-syncs via `useEffect` on user change (login / logout).

> **Firestore index required:** The per-category queries (`getNewsPosts(cursor, category)`) use a compound filter on `category` + `orderBy("createdAt", "desc")`. You must create a composite index in the Firebase Console: collection `news`, fields `category ASC, createdAt DESC`.

---

### `PostFeed`
**File:** `src/components/news/post-feed.tsx`
**Props:** `posts: NewsPost[]`, `hasMore: boolean`, `isLoadingMore: boolean`, `loadMore: () => void`
**Responsibilities:** Renders the list of `PostCard` components. Attaches an `IntersectionObserver` to a sentinel element at the bottom; when the sentinel enters the viewport and `hasMore` is true, it calls `loadMore`. The `loadMore` prop must be a stable reference (memoised with `useCallback`) to prevent the observer from reconnecting on every render.

---

### `PostCard`
**File:** `src/components/news/post-card.tsx`
**Props:** `post: NewsPost`
**State:** `detailDialogOpen: boolean`
**Responsibilities:**
- Wraps `PostBody` in a card shell
- Owns the open/close state of `PostDetailDialog`
- Passes a clickable comment-count summary slot to `PostBody`

---

### `PostBody`
**File:** `src/components/news/post-body.tsx`
**Props:**

| Prop | Type | Description |
|---|---|---|
| `post` | `NewsPost` | The post to render (controlled — no internal post state) |
| `summarySlot?` | `ReactNode` | Comment-count area override (used by PostCard to open the dialog) |
| `onCommentClick?` | `() => void` | Override for the comment button action |

**Context:** Calls `useNews()` for `deletePost`, `applyReaction`, `savedPostIds`, and `toggleSavedPost`. Calls `useAuth()` for `userId`.
**Reaction logic:** `activeReaction` is derived from `post.likes.includes(userId)` — no local state, always in sync.
**Save logic:** `isSaved` is derived from `savedPostIds.has(post.id)` — dropdown item toggles between Save/Unsave and persists to the user document in Firestore.
**Responsibilities:** Post content rendering — header, media, attachments, reactions, save/unsave, edit/delete actions.

---

### `PostDetailDialog`
**File:** `src/components/news/post-detail-dialog.tsx`
**Props:** `post: NewsPost`, `open: boolean`, `onClose: () => void`
**Responsibilities:** Facebook-style modal shell — renders `PostBody` followed by `PostComments` in a scrollable container.

---

### `PostComments`
**File:** `src/components/news/post-comments.tsx`
**Props:** `post: NewsPost`
**State:** `newComment: string`
**Context:** Calls `useNews()` for `addComment` and `addReply`. Calls `useAuth()` for `userId` and `currentUserName`.
**Responsibilities:** Comments list and comment input — rendered below `PostBody` inside `PostDetailDialog`.

---

### `PinnedPostsPanel`
**File:** `src/components/news/pinned-posts-panel.tsx`
**Props:** `posts: NewsPost[]`
**State:** `expanded: boolean`, `selectedPostId: string | null`
**Responsibilities:**
- Sidebar panel showing pinned posts
- Derives the selected post live from the `posts` array (never stale)
- Opens `PostDetailDialog` when a `PostPreview` is clicked

---

### `SavedPostsPanel`
**File:** `src/components/news/saved-posts-panel.tsx`
**Props:** none — reads `posts`, `savedPostIds`, and `toggleSavedPost` from `useNews()`
**State:** `expanded: boolean`, `selectedPost: NewsPost | null`
**Responsibilities:** Sidebar panel showing bookmarked posts; opens `PostDetailDialog` on click; removes saves via `toggleSavedPost`

---

### `CommentItem`
**File:** `src/components/news/comment-item.tsx`
**Auth:** Calls `useAuth()` directly — determines ownership for edit/delete controls
**Responsibilities:** Renders a single comment with its reply list and reply input

---

### `ReplyItem`
**File:** `src/components/news/reply-item.tsx`
**Responsibilities:** Renders a single reply row

---

### `PostPreview`
**File:** `src/components/news/post-preview.tsx`
**Responsibilities:** Compact read-only post card used inside `PinnedPostsPanel`

---

### Dialogs

| Component | File | Purpose |
|---|---|---|
| `CreateNewsDialog` | `create-news-dialog.tsx` | Uploads media/attachments, calls `createNewsPost`, then `addPost()` from context |
| `EditNewsDialog` | `edit-news-dialog.tsx` | Uploads media/attachments, calls `updatePost()` from context |
| `NewsForm` | `news-form.tsx` | Shared react-hook-form + Zod form used by both dialogs |

---

### Utilities

| File | Exports |
|---|---|
| `src/lib/utils.ts` | `cn()`, `formatDate(date)`, `getInitials(name)` |
| `image-gallery.tsx` | `MediaGallery` — renders post media in a grid with lightbox |

---

## Services

### `src/services/news-service.ts` — Server-side / Firestore
- `getNewsPosts(cursor?, category?)` — fetches a page of posts ordered by `createdAt DESC`; when `category` is provided, adds a `.where("category", "==", category)` filter (requires composite index). Does **not** resolve author names — author info is fetched separately via `getAuthorInfoBatch`.
- `getAuthorInfoBatch(uids)` — batch-reads user documents for a list of UIDs; returns a `Record<string, AuthorInfo>` with `{ name, avatarUrl, role }` per user
- `createNewsPost(data)` — writes a new post to Firestore and returns the full `NewsPost` document
- `updateNewsPost(postId, data)` — updates mutable fields; clears media/attachments fields if empty; returns normalized `media` and `attachments` to sync local state
- `deleteNewsPost(postId)` — deletes the post document
- `toggleReaction(postId, userId, type)` — atomic Firestore transaction: removes from both arrays, adds to target if not already present (toggle behaviour)
- `addCommentToPost(postId, comment)` — appends a comment via `arrayUnion`
- `addReplyToComment(postId, commentId, reply)` — Firestore transaction: reads comments array, splices in the reply, writes back

### `src/services/user-service.ts` — Server-side / Firestore
- `toggleSavedPostForUser(userId, postId, save)` — adds or removes a post ID from the user document’s `savedPostIds` array via `arrayUnion` / `arrayRemove`
- `getUserById(userId)` — returns the user profile including `savedPostIds` (used during login to initialize the saved set)

---

## Schema Summary (`src/schemas/news-schema.ts`)

```ts
type Category = "Announcement" | "Event" | "Emergency";

interface NewsPost {
  id: string;
  authorId: string;         // stored in Firestore; used as key into the authors cache
  title: string;
  content: string;
  category: Category;
  date: Date;               // mapped from Firestore `createdAt` Timestamp at read time
  likes: string[];          // array of user IDs
  dislikes: string[];       // array of user IDs
  comments: Comment[];
  media?: MediaEntry[];
  attachments?: Attachment[];
  pinned?: boolean;
}

// Author display info is NOT stored on the post document.
// It is fetched separately via getAuthorInfoBatch() and held in the `authors` cache
// in NewsProvider. Components read it as: authors[post.authorId]?.name etc.
interface AuthorInfo {
  name: string;
  avatarUrl?: string;
  role?: string;
}

interface Comment {
  id: string;
  authorId: string;
  content: string;
  date: Date;
  replies: Reply[];
}

interface Reply {
  id: string;
  authorId: string;
  content: string;
  date: Date;
}
```

---

## Auth Pattern

`useAuth()` is called **only at the leaves** — never passed as props:

- `PostBody` — derives `userId` (for reaction checks and ownership)
- `PostComments` — derives `userId` and `currentUserName` (for comment/reply authoring)
- `CommentItem` — derives current user for ownership of edit/delete controls

All other components consume `useNews()` for mutations. This keeps auth concerns isolated.

---

## State Mutation Pattern

All mutations use an **optimistic update + fire-and-forget** strategy: local state updates immediately for instant UI feedback, and the Firestore write happens in the background.

```ts
// Reactions — atomic Firestore transaction
applyReaction(post.id, "like");
// └→ builds an updater fn, applies it to posts/pinnedPosts/savedPosts via setState
//    and to all three categoryFeeds via dispatchCategoryFeeds({ type: "MAP", fn })
//    then fires: toggleReaction(postId, userId, "like")

// Comments — arrayUnion
addComment(post.id, content);
// └→ creates a Comment object with a temp id (`c-${Date.now()}`)
//    applies updater to posts/pinnedPosts/savedPosts and categoryFeeds via MAP
//    then fires: addCommentToPost(postId, { id, authorId, content })

// Replies — Firestore transaction (nested array update)
addReply(post.id, commentId, text);
// └→ creates a Reply object with a temp id (`r-${Date.now()}`)
//    applies updater to posts/pinnedPosts/savedPosts and categoryFeeds via MAP
//    then fires: addReplyToComment(postId, commentId, { id, authorId, content })

// Save / unsave — arrayUnion / arrayRemove on user document
toggleSavedPost(post.id);
// └→ reads current `savedPostIds` set synchronously from closure
//    toggles local Set and savedPosts list
//    then fires: toggleSavedPostForUser(uid, postId, !wasSaved)

// Delete — removes from all feeds immediately
removePost(id);
// └→ filters posts, pinnedPosts, savedPosts, and dispatches REMOVE_POST to all categoryFeeds
//    then fires: deleteNewsPost(postId)
```

`addPost` (called after a successful create) prepends the new post to `posts`, dispatches `ADD_POST` (which prepends to the matching category feed), and adds it to `pinnedPosts` if `pinned: true`.
