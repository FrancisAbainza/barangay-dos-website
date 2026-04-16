"use client";

import { useState } from "react";
import { Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import NewsForm from "@/components/news/news-form";
import { NewsFormValues } from "@/schemas/news-schema";
import { useAuth } from "@/contexts/auth-context";
import { useCreatePost } from "@/hooks/use-news-queries";
import { createNewsPost } from "@/services/news-service";
import { uploadMultipleMedia, uploadMultipleAttachments } from "@/services/storage-service";

export function CreateNewsDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const createPost = useCreatePost();

  async function handleSubmit(data: NewsFormValues) {
    if (!user) return;

    try {
      const basePath = `news/${Date.now()}`;

      const media =
        data.media && data.media.length > 0
          ? await uploadMultipleMedia(data.media, `${basePath}/media`)
          : undefined;

      const attachments =
        data.attachments && data.attachments.length > 0
          ? await uploadMultipleAttachments(data.attachments, `${basePath}/attachments`)
          : undefined;

      const post = await createNewsPost({
        ...data,
        media,
        attachments,
        authorId: user.uid,
      });

      createPost.mutate(post);
      toast.success("Post published successfully.");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish post.");
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
