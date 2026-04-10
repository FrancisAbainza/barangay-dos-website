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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import MultiImageUploader from "@/components/multi-image-uploader";
import {
  officialSchema,
  OfficialFormValues,
  BARANGAY_ROLES,
  SK_ROLES,
  type OfficialType,
} from "@/schemas/about-us-schema";
import type { ImageItem } from "@/components/multi-image-uploader";
import { uploadMultiplePostImages, deleteImagesByPath } from "@/services/storage-service";
import { updateOfficial } from "@/services/about-us-service";
import { useAboutUs } from "@/contexts/about-us-context";

interface EditOfficialDialogProps {
  id: string;
  type: OfficialType;
  takenRoles: string[];
  defaultValues: {
    fullName: string;
    role: string;
    picture?: ImageItem[];
  };
}

export default function EditOfficialDialog({
  id,
  type,
  takenRoles,
  defaultValues,
}: EditOfficialDialogProps) {
  const roles = type === "barangay" ? BARANGAY_ROLES : SK_ROLES;
  const [open, setOpen] = useState(false);
  const { updateOfficial: updateOfficialInState } = useAboutUs();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OfficialFormValues>({
    resolver: zodResolver(officialSchema),
    defaultValues: {
      fullName: defaultValues.fullName,
      role: defaultValues.role,
      picture: defaultValues.picture ?? [],
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        fullName: defaultValues.fullName,
        role: defaultValues.role,
        picture: defaultValues.picture ?? [],
      });
    }
  }, [open, defaultValues, reset]);

  const onSubmit = async (data: OfficialFormValues) => {
    try {
      const { fullName, role, picture = [] } = data;

      // Upload the picture to Firebase Storage if a new one was selected.
      // - Items that already have a `path` (existing uploads) are returned as-is.
      // - Items whose `uri` is a File are uploaded and a download URL + path are returned.
      // - Empty arrays (picture cleared by user) resolve to an empty array.
      const uploadedPictures = await uploadMultiplePostImages(
        picture,
        `officials/${type}`,
      );

      // Persist the updated fields to Firestore.
      // uploadedPictures[0] is undefined when no picture was selected, which
      // causes updateOfficial to remove the picture field via FieldValue.delete().
      await updateOfficial(type, id, {
        fullName,
        role,
        picture: uploadedPictures[0],
      });

      // Delete the old picture from Firebase Storage if the user replaced or removed it.
      const picturesToDelete = (defaultValues.picture ?? []).filter(
        (existing) =>
          !uploadedPictures.some((u) => u.path === existing.path),
      );
      await deleteImagesByPath(picturesToDelete);

      // Optimistically update the official in local state so the UI reflects
      // the change immediately without refetching from the database.
      updateOfficialInState(type, id, {
        fullName,
        role,
        picture: uploadedPictures[0],
      });
      toast.success("Official updated successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Failed to update official:", error);
      toast.error("Failed to update official. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-muted-foreground hover:text-primary"
        >
          <Pencil className="size-3.5" />
          <span className="sr-only">Edit {defaultValues.fullName}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Official</DialogTitle>
        </DialogHeader>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isSubmitting} className="space-y-4">
            <Field data-invalid={!!errors.fullName}>
              <FieldLabel htmlFor="edit-official-fullName">
                Full Name
              </FieldLabel>
              <Input
                {...register("fullName")}
                id="edit-official-fullName"
                placeholder="Enter full name"
                aria-invalid={!!errors.fullName}
              />
              <FieldError errors={[errors.fullName]} />
            </Field>

            <Controller
              name="role"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Role</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => {
                        // A role is blocked if it's taken by another official.
                        // The official's own current role is never blocked so
                        // they can save without changing it.
                        const blocked =
                          takenRoles.includes(role) &&
                          role !== defaultValues.role;
                        return (
                          <SelectItem
                            key={role}
                            value={role}
                            disabled={blocked}
                          >
                            {role}
                            {blocked ? " (already assigned)" : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="picture"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Picture</FieldLabel>
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
