"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
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
import { uploadMultiplePostImages } from "@/services/storage-service";
import { addOfficial } from "@/services/about-us-service";
import { useAboutUs } from "@/contexts/about-us-context";

interface AddOfficialDialogProps {
  title: string;
  type: OfficialType;
  takenRoles: string[];
}

export default function AddOfficialDialog({
  title,
  type,
  takenRoles,
}: AddOfficialDialogProps) {
  const [open, setOpen] = useState(false);
  const { addOfficial: addOfficialToState } = useAboutUs();

  const roles = type === "barangay" ? BARANGAY_ROLES : SK_ROLES;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OfficialFormValues>({
    resolver: zodResolver(officialSchema),
    defaultValues: { fullName: "", role: "", picture: [] },
  });

  useEffect(() => {
    if (open) {
      reset({ fullName: "", role: "", picture: [] });
    }
  }, [open, reset]);

  const onSubmit = async (data: OfficialFormValues) => {
    try {
      const { fullName, role, picture = [] } = data;

      // Upload the picture to Firebase Storage if one was selected.
      // - If uri is a File, it gets uploaded and a download URL + path are returned.
      // - If picture is empty (no picture selected), this resolves to an empty array.
      const uploadedPictures = await uploadMultiplePostImages(
        picture,
        `officials/${type}`,
      );

      // Persist the new official to Firestore under the correct collection.
      // The server action returns the new document ID.
      const docId = await addOfficial(type, {
        fullName,
        role,
        picture: uploadedPictures[0],
      });

      // Optimistically add the official to local state so the UI updates
      // immediately without refetching from the database.
      addOfficialToState(type, {
        id: docId,
        fullName,
        role,
        picture: uploadedPictures[0],
      });
      toast.success("Official added successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Failed to add official:", error);
      toast.error("Failed to add official. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="size-3.5" />
          Add Official
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add {title}</DialogTitle>
        </DialogHeader>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isSubmitting} className="space-y-4">
            <Field data-invalid={!!errors.fullName}>
              <FieldLabel htmlFor="official-fullName">Full Name</FieldLabel>
              <Input
                {...register("fullName")}
                id="official-fullName"
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
                      {roles.map((role) => (
                        <SelectItem
                          key={role}
                          value={role}
                          disabled={takenRoles.includes(role)}
                        >
                          {role}
                          {takenRoles.includes(role)
                            ? " (already assigned)"
                            : ""}
                        </SelectItem>
                      ))}
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
              <Button type="submit">Add Official</Button>
            </DialogFooter>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}
