"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MultiImageUploader from "@/components/multi-image-uploader";
import {
  editHeaderSchema,
  EditHeaderFormValues,
} from "@/schemas/about-us-schema";
import { uploadMultiplePostImages, deleteImagesByPath } from "@/services/storage-service";
import { useUpdateBarangayHeader } from "@/hooks/use-barangay-profile-query";

interface EditHeaderDialogProps {
  defaultValues: EditHeaderFormValues;
}

export default function EditHeaderDialog({
  defaultValues,
}: EditHeaderDialogProps) {
  const [open, setOpen] = useState(false);
  const updateHeaderMutation = useUpdateBarangayHeader();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditHeaderFormValues>({
    resolver: zodResolver(editHeaderSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const onSubmit = async (data: EditHeaderFormValues) => {
    try {
      const { name, address, tagline, barangayLogo = [], skLogo = [] } = data;

      // Upload logos to Firebase Storage.
      // - Items that already have a `path` (existing uploads) are returned as-is.
      // - Items whose `uri` is a File are uploaded and a download URL + path are returned.
      // - Empty arrays (logo cleared by user) resolve to an empty array.
      const [uploadedBarangayLogo, uploadedSkLogo] = await Promise.all([
        uploadMultiplePostImages(barangayLogo, "about-us/barangay-logo"),
        uploadMultiplePostImages(skLogo, "about-us/sk-logo"),
      ]);

      // Persist the updated header fields to Firestore and update the cache.
      await updateHeaderMutation.mutateAsync({
        name,
        address,
        tagline,
        barangayLogo: uploadedBarangayLogo[0],
        skLogo: uploadedSkLogo[0],
      });

      // Delete logos that existed before but are no longer in the uploaded set
      // (i.e. the user removed them), then delete them from Firebase Storage.
      const logosToDelete = [
        ...(defaultValues.barangayLogo ?? []).filter(
          (existing) => !uploadedBarangayLogo.some((u) => u.path === existing.path),
        ),
        ...(defaultValues.skLogo ?? []).filter(
          (existing) => !uploadedSkLogo.some((u) => u.path === existing.path),
        ),
      ];
      await deleteImagesByPath(logosToDelete);

      toast.success("Header updated successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Failed to update header:", error);
      toast.error("Failed to update header. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2 shrink-0 self-start">
          <Pencil className="size-3.5" />
          Edit Header
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Barangay Header</DialogTitle>
        </DialogHeader>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isSubmitting} className="space-y-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="header-name">Barangay Name</FieldLabel>
              <Input
                {...register("name")}
                id="header-name"
                placeholder="Enter barangay name"
                aria-invalid={!!errors.name}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.address}>
              <FieldLabel htmlFor="header-address">Address</FieldLabel>
              <Input
                {...register("address")}
                id="header-address"
                placeholder="Enter barangay address"
                aria-invalid={!!errors.address}
              />
              <FieldError errors={[errors.address]} />
            </Field>

            <Field data-invalid={!!errors.tagline}>
              <FieldLabel htmlFor="header-tagline">Tagline</FieldLabel>
              <Textarea
                {...register("tagline")}
                id="header-tagline"
                placeholder="Enter barangay tagline"
                rows={3}
                aria-invalid={!!errors.tagline}
              />
              <FieldError errors={[errors.tagline]} />
            </Field>

            <Controller
              name="barangayLogo"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Barangay Logo</FieldLabel>
                  <MultiImageUploader
                    mode="single"
                    images={field.value ?? []}
                    onImagesChange={field.onChange}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="skLogo"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>SK Logo</FieldLabel>
                  <MultiImageUploader
                    mode="single"
                    images={field.value ?? []}
                    onImagesChange={field.onChange}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}
