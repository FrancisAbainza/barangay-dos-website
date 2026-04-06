"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { NewsPostData, NewsPost, MediaEntry, Attachment } from "@/schemas/news-schema";

const NEWS_COLLECTION = "news";

export async function createNewsPost(data: NewsPostData): Promise<void> {
  await adminDb.collection(NEWS_COLLECTION).add({
    title: data.title,
    content: data.content,
    category: data.category,
    pinned: data.pinned,

    // Only store media/attachments if they were provided.
    ...(data.media && data.media.length > 0 ? { media: data.media } : {}),
    ...(data.attachments && data.attachments.length > 0
      ? { attachments: data.attachments }
      : {}),

    // Author metadata captured at publish time.
    authorId: data.authorId,
    authorName: data.authorName,
    authorRole: data.authorRole,
    ...(data.authorAvatarUrl ? { authorAvatarUrl: data.authorAvatarUrl } : {}),

    // Initial engagement state.
    likes: 0,
    dislikes: 0,
    comments: [],

    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Revalidate the staff news pages so server components
  // reflect the newly published post without requiring a full redeploy.
  revalidatePath("/staff/news");
}

export async function getNewsPosts(): Promise<NewsPost[]> {
  const snapshot = await adminDb
    .collection(NEWS_COLLECTION)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    const media: MediaEntry[] | undefined =
      data.media && data.media.length > 0
        ? data.media.map(
            (m: { uri: string; path?: string; type: "image" | "video" }) => ({
              url: m.uri,
              type: m.type,
            }),
          )
        : undefined;

    const attachments: Attachment[] | undefined =
      data.attachments && data.attachments.length > 0
        ? data.attachments.map(
            (
              att: { uri: string; path?: string; name: string; size?: string },
              index: number,
            ) => ({
              id: att.path ?? `${doc.id}-att-${index}`,
              name: att.name,
              url: att.uri,
              size: att.size ?? "",
            }),
          )
        : undefined;

    return {
      id: doc.id,
      title: data.title,
      content: data.content,
      category: data.category,
      pinned: data.pinned ?? false,
      authorName: data.authorName,
      authorAvatarUrl: data.authorAvatarUrl ?? undefined,
      authorRole: data.authorRole,
      likes: data.likes ?? 0,
      dislikes: data.dislikes ?? 0,
      comments: data.comments ?? [],
      date: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
      media,
      attachments,
    };
  });
}
