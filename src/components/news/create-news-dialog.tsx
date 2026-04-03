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
import NewsForm from "@/components/news/news-form";
import { NewsFormValues } from "@/schemas/news-schema";

export function CreateNewsDialog() {
  const [open, setOpen] = useState(false);

  function handleSubmit(data: NewsFormValues) {
    // TODO: connect to database
    console.log(data);
    setOpen(false);
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
