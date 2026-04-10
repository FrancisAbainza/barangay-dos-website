"use server";

import { adminDb } from "@/lib/firebase/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { NewsFormValues, NewsPost, Comment, Reply, Category } from "@/schemas/news-schema";
import type { MediaItem } from "@/components/media-uploader";
import type { AttachmentItem } from "@/components/attachment-picker";

const NEWS_COLLECTION = "news";
const USERS_COLLECTION = "users";
const PAGE_SIZE = 5;

// ─── Helpers ──────────────────────────────────────────────────

function toMediaItem(m: Record<string, unknown>): MediaItem {
  return { uri: m.uri as string, path: m.path as string | undefined, type: m.type as "image" | "video" };
}

function toAttachmentItem(a: Record<string, unknown>): AttachmentItem {
  return { uri: a.uri as string, path: a.path as string | undefined, name: a.name as string, size: a.size as string | undefined };
}

function toReply(r: Record<string, unknown>): Reply {
  return {
    id: r.id as string,
    authorId: r.authorId as string,
    content: r.content as string,
    date: (r.date as Timestamp)?.toDate?.() ?? new Date(),
  };
}

function toComment(c: Record<string, unknown>): Comment {
  return {
    id: c.id as string,
    authorId: c.authorId as string,
    content: c.content as string,
    date: (c.date as Timestamp)?.toDate?.() ?? new Date(),
    replies: Array.isArray(c.replies) ? c.replies.map(toReply) : [],
  };
}

function docToNewsPost(doc: FirebaseFirestore.DocumentSnapshot): NewsPost {
  const data = doc.data()!;
  return {
    id: doc.id,
    title: data.title as string,
    content: data.content as string,
    category: data.category,
    pinned: data.pinned ?? false,
    authorId: data.authorId as string,
    likes: Array.isArray(data.likes) ? data.likes : [],
    dislikes: Array.isArray(data.dislikes) ? data.dislikes : [],
    comments: Array.isArray(data.comments) ? data.comments.map(toComment) : [],
    date: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
    media: Array.isArray(data.media) && data.media.length > 0 ? data.media.map(toMediaItem) : undefined,
    attachments: Array.isArray(data.attachments) && data.attachments.length > 0 ? data.attachments.map(toAttachmentItem) : undefined,
  };
}

// ─── Create ───────────────────────────────────────────────────

export async function createNewsPost(
  data: NewsFormValues & { authorId: string },
): Promise<NewsPost> {
  const docRef = await adminDb.collection(NEWS_COLLECTION).add({
    title: data.title,
    content: data.content,
    category: data.category,
    pinned: data.pinned,
    authorId: data.authorId,
    ...(data.media && data.media.length > 0 ? { media: data.media } : {}),
    ...(data.attachments && data.attachments.length > 0 ? { attachments: data.attachments } : {}),
    likes: [],
    dislikes: [],
    comments: [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const doc = await docRef.get();
  return docToNewsPost(doc);
}

// ─── Update ───────────────────────────────────────────────────

export async function updateNewsPost(
  postId: string,
  data: NewsFormValues,
): Promise<NewsPost> {
  const ref = adminDb.collection(NEWS_COLLECTION).doc(postId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {
    title: data.title,
    content: data.content,
    category: data.category,
    pinned: data.pinned ?? false,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (data.media && data.media.length > 0) {
    updateData.media = data.media;
  } else {
    updateData.media = FieldValue.delete();
  }

  if (data.attachments && data.attachments.length > 0) {
    updateData.attachments = data.attachments;
  } else {
    updateData.attachments = FieldValue.delete();
  }

  await ref.update(updateData);
  const doc = await ref.get();
  return docToNewsPost(doc);
}

// ─── Delete ───────────────────────────────────────────────────

export async function deleteNewsPost(postId: string): Promise<void> {
  await adminDb.collection(NEWS_COLLECTION).doc(postId).delete();
}

// ─── Read: paginated feed ─────────────────────────────────────

export async function getNewsPosts(
  cursor?: string,
  category?: Category,
): Promise<{ posts: NewsPost[]; nextCursor: string | null }> {
  // NOTE: category + createdAt queries require a Firestore composite index:
  // Collection: news | Fields: category ASC, createdAt DESC
  let query: FirebaseFirestore.Query = category
    ? adminDb
        .collection(NEWS_COLLECTION)
        .where("category", "==", category)
        .orderBy("createdAt", "desc")
        .limit(PAGE_SIZE)
    : adminDb
        .collection(NEWS_COLLECTION)
        .orderBy("createdAt", "desc")
        .limit(PAGE_SIZE);

  if (cursor) {
    const cursorDoc = await adminDb.collection(NEWS_COLLECTION).doc(cursor).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  const snapshot = await query.get();
  const posts = snapshot.docs.map(docToNewsPost);
  const nextCursor = snapshot.docs.length === PAGE_SIZE ? snapshot.docs[snapshot.docs.length - 1].id : null;

  return { posts, nextCursor };
}

// ─── Read: pinned posts ───────────────────────────────────────

export async function getPinnedPosts(): Promise<NewsPost[]> {
  const snapshot = await adminDb
    .collection(NEWS_COLLECTION)
    .where("pinned", "==", true)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map(docToNewsPost);
}

// ─── Read: saved posts by IDs ─────────────────────────────────

export async function getPostsByIds(postIds: string[]): Promise<NewsPost[]> {
  if (postIds.length === 0) return [];

  // Firestore getAll supports batch document reads.
  const chunks: string[][] = [];
  for (let i = 0; i < postIds.length; i += 30) {
    chunks.push(postIds.slice(i, i + 30));
  }

  const posts: NewsPost[] = [];
  for (const chunk of chunks) {
    const refs = chunk.map((id) => adminDb.collection(NEWS_COLLECTION).doc(id));
    const docs = await adminDb.getAll(...refs);
    for (const doc of docs) {
      if (doc.exists) posts.push(docToNewsPost(doc));
    }
  }

  return posts;
}

// ─── Read: author profile (for display) ───────────────────────

export interface AuthorInfo {
  uid: string;
  fullName: string;
  avatarUrl?: string;
  role: string;
}

export async function getAuthorInfo(authorId: string): Promise<AuthorInfo | null> {
  const doc = await adminDb.collection(USERS_COLLECTION).doc(authorId).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  const pic = data.profilePicture;
  return {
    uid: doc.id,
    fullName: data.fullName ?? "Unknown",
    avatarUrl: typeof pic === "object" && pic !== null ? pic.uri : typeof pic === "string" ? pic : undefined,
    role: data.role ?? "Resident",
  };
}

export async function getAuthorInfoBatch(authorIds: string[]): Promise<Record<string, AuthorInfo>> {
  const unique = [...new Set(authorIds)];
  if (unique.length === 0) return {};

  const refs = unique.map((id) => adminDb.collection(USERS_COLLECTION).doc(id));
  const docs = await adminDb.getAll(...refs);

  const map: Record<string, AuthorInfo> = {};
  for (const doc of docs) {
    if (!doc.exists) continue;
    const data = doc.data()!;
    const pic = data.profilePicture;
    map[doc.id] = {
      uid: doc.id,
      fullName: data.fullName ?? "Unknown",
      avatarUrl: typeof pic === "object" && pic !== null ? pic.uri : typeof pic === "string" ? pic : undefined,
      role: data.role ?? "Resident",
    };
  }
  return map;
}

// ─── Reactions ────────────────────────────────────────────────

export async function toggleReaction(
  postId: string,
  userId: string,
  type: "like" | "dislike",
): Promise<{ likes: string[]; dislikes: string[] }> {
  const ref = adminDb.collection(NEWS_COLLECTION).doc(postId);
  return adminDb.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) return { likes: [], dislikes: [] };
    const data = doc.data()!;

    const alreadyInTarget =
      type === "like"
        ? (data.likes ?? []).includes(userId)
        : (data.dislikes ?? []).includes(userId);

    const likes = (data.likes ?? []).filter((id: string) => id !== userId);
    const dislikes = (data.dislikes ?? []).filter((id: string) => id !== userId);

    if (!alreadyInTarget) {
      if (type === "like") likes.push(userId);
      else dislikes.push(userId);
    }

    tx.update(ref, { likes, dislikes });
    return { likes, dislikes };
  });
}

// ─── Comments ─────────────────────────────────────────────────

export async function addCommentToPost(
  postId: string,
  comment: { id: string; authorId: string; content: string },
): Promise<void> {
  await adminDb.collection(NEWS_COLLECTION).doc(postId).update({
    comments: FieldValue.arrayUnion({
      id: comment.id,
      authorId: comment.authorId,
      content: comment.content,
      date: new Date(),
      replies: [],
    }),
  });
}

export async function addReplyToComment(
  postId: string,
  commentId: string,
  reply: { id: string; authorId: string; content: string },
): Promise<void> {
  const ref = adminDb.collection(NEWS_COLLECTION).doc(postId);
  await adminDb.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) return;
    const data = doc.data()!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comments = (data.comments ?? []).map((c: any) =>
      c.id === commentId
        ? { ...c, replies: [...(c.replies ?? []), { id: reply.id, authorId: reply.authorId, content: reply.content, date: new Date() }] }
        : c,
    );
    tx.update(ref, { comments });
  });
}
