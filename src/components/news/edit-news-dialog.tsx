"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import NewsForm from "@/components/news/news-form";
import { NewsFormValues, NewsPost } from "@/schemas/news-schema";
import { useNews } from "@/contexts/news-context";
import { updateNewsPost } from "@/services/news-service";
import { uploadMultipleMedia, uploadMultipleAttachments } from "@/services/storage-service";

interface EditNewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: NewsPost;
}

export function EditNewsDialog({
  open,
  onOpenChange,
  post,
}: EditNewsDialogProps) {
  const { updatePost } = useNews();

  const defaultValues: NewsFormValues = {
    title: post.title,
    category: post.category,
    content: post.content,
    pinned: post.pinned ?? false,
    media:
      post.media?.map((item) => ({
        uri: item.uri,
        path: item.path,
        type: item.type,
      })) ?? [],
    attachments:
      post.attachments?.map((att) => ({
        uri: att.uri,
        path: att.path,
        name: att.name,
        size: att.size,
      })) ?? [],
  };

  async function handleSubmit(data: NewsFormValues) {
    try {
      const basePath = `news/${post.id}`;

      const media =
        data.media && data.media.length > 0
          ? await uploadMultipleMedia(data.media, `${basePath}/media`)
          : undefined;

      const attachments =
        data.attachments && data.attachments.length > 0
          ? await uploadMultipleAttachments(data.attachments, `${basePath}/attachments`)
          : undefined;

      const updated = await updateNewsPost(post.id, {
        ...data,
        media,
        attachments,
      });

      updatePost(updated);
      toast.success("Post updated successfully.");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update post.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit News Post</DialogTitle>
        </DialogHeader>
        <NewsForm
          open={open}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}
