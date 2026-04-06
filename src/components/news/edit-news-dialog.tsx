"use client";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NewsForm from "@/components/news/news-form";
import { NewsFormValues } from "@/schemas/news-schema";
import { NewsPost } from "@/schemas/news-schema";

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
  const defaultValues: NewsFormValues = {
    title: post.title,
    category: post.category,
    content: post.content,
    pinned: post.pinned ?? false,
    media:
      post.media?.map((item) => ({
        uri: item.url,
        type: item.type,
      })) ?? [],
    attachments:
      post.attachments?.map((att) => ({
        uri: att.url,
        name: att.name,
        size: att.size,
      })) ?? [],
  };

  function handleSubmit(data: NewsFormValues) {
    // TODO: connect to database
    console.log(data);
    onOpenChange(false);
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
