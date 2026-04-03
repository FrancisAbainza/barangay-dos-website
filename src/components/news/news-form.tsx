"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogClose } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import MultiImageUploader from "@/components/multi-image-uploader";
import AttachmentPicker from "@/components/attachment-picker";
import { newsFormSchema, NewsFormValues } from "@/schemas/news-schema";

const EMPTY_DEFAULTS: NewsFormValues = {
  title: "",
  category: undefined as unknown as NewsFormValues["category"],
  content: "",
  pinned: false,
  images: [],
  attachments: [],
};

interface NewsFormProps {
  open: boolean;
  onSubmit: (data: NewsFormValues) => void;
  defaultValues?: Partial<NewsFormValues>;
  submitLabel?: string;
}

export default function NewsForm({
  open,
  onSubmit,
  defaultValues,
  submitLabel = "Publish",
}: NewsFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  });

  useEffect(() => {
    if (open) reset({ ...EMPTY_DEFAULTS, ...defaultValues });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={isSubmitting} className="space-y-4">
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="news-title">Title</FieldLabel>
          <Input
            {...register("title")}
            id="news-title"
            placeholder="Enter post title"
            aria-invalid={!!errors.title}
          />
          <FieldError errors={[errors.title]} />
        </Field>

        <Controller
          name="category"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Category</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Announcement">Announcement</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Field data-invalid={!!errors.content}>
          <FieldLabel htmlFor="news-content">Content</FieldLabel>
          <Textarea
            {...register("content")}
            id="news-content"
            placeholder="Write your post content here..."
            className="min-h-32 resize-none"
            aria-invalid={!!errors.content}
          />
          <FieldError errors={[errors.content]} />
        </Field>

        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>
                Images{" "}
                <span className="text-muted-foreground font-normal">
                  (optional, max 10)
                </span>
              </FieldLabel>
              <MultiImageUploader
                images={field.value ?? []}
                onImagesChange={field.onChange}
                maxFiles={10}
              />
            </Field>
          )}
        />

        <Controller
          name="attachments"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>
                Attachments{" "}
                <span className="text-muted-foreground font-normal">
                  (optional, max 3)
                </span>
              </FieldLabel>
              <AttachmentPicker
                files={field.value ?? []}
                onFilesChange={field.onChange}
                maxFiles={3}
              />
            </Field>
          )}
        />

        <Controller
          name="pinned"
          control={control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                id="news-pinned"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <FieldLabel htmlFor="news-pinned" className="cursor-pointer">
                Pin to top
              </FieldLabel>
            </Field>
          )}
        />
      </fieldset>

      <Separator />

      <div className="flex justify-end gap-2">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {submitLabel === "Publish" ? "Publishing..." : "Saving..."}
            </>
          ) : (
            <>
              <Newspaper className="size-4" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>

    </form>
  );
}
