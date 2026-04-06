"use client";

import { useState } from "react";
import { Newspaper } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NewsForm from "@/components/news/news-form";
import { NewsFormValues } from "@/schemas/news-schema";
import { useAuth } from "@/contexts/auth-context";
import { uploadMultipleMedia, uploadMultipleAttachments } from "@/services/storage-service";
import { createNewsPost } from "@/services/news-service";

export function CreateNewsDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, userProfile } = useAuth();

  async function handleSubmit(data: NewsFormValues) {
    if (!user || !userProfile) return;

    try {
      // Upload all selected media (images/videos) to Firebase Storage.
      const uploadedMedia = await uploadMultipleMedia(
        data.media ?? [],
        "news/media",
      );

      // Upload all selected attachments to Firebase Storage in the same way.
      const uploadedAttachments = await uploadMultipleAttachments(
        data.attachments ?? [],
        "news/attachments",
      );

      // Resolve the author's avatar URL from their stored profile picture.
      // profilePicture is an ImageItem array; the URI is a download URL string
      // once the picture has been uploaded (not a raw File).
      const avatarUrl =
        typeof userProfile.profilePicture?.[0]?.uri === "string"
          ? userProfile.profilePicture[0].uri
          : undefined;

      // Persist the news post to Firestore via the server action.
      await createNewsPost({
        title: data.title,
        content: data.content,
        category: data.category,
        pinned: data.pinned,
        media: uploadedMedia,
        attachments: uploadedAttachments,
        authorId: user.uid,
        authorName: userProfile.fullName ?? "Unknown",
        authorAvatarUrl: avatarUrl,
        authorRole: userProfile.role,
      });

      // Re-run server components on the current page to reflect the new post.
      router.refresh();
      toast.success("News post published successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Failed to create news post:", error);
      toast.error("Failed to publish news post. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 shrink-0">
          <Newspaper className="size-4" />
          Create News
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create News Post</DialogTitle>
        </DialogHeader>
        <NewsForm
          open={open}
          onSubmit={handleSubmit}
          submitLabel="Publish"
        />
      </DialogContent>
    </Dialog>
  );
}
