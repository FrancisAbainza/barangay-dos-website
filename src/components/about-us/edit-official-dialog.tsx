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
import MultiImageUploader from "@/components/multi-image-uploader";
import {
  officialSchema,
  OfficialFormValues,
} from "@/schemas/about-us-schema";
import type { ImageItem } from "@/components/multi-image-uploader";

interface EditOfficialDialogProps {
  defaultValues: {
    fullName: string;
    role: string;
    picture?: ImageItem[];
  };
}

export default function EditOfficialDialog({
  defaultValues,
}: EditOfficialDialogProps) {
  const [open, setOpen] = useState(false);

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
    // TODO: Implement submission logic
    console.log("Edit official data:", data);
    toast.success("Official updated successfully!");
    setOpen(false);
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

            <Field data-invalid={!!errors.role}>
              <FieldLabel htmlFor="edit-official-role">Role</FieldLabel>
              <Input
                {...register("role")}
                id="edit-official-role"
                placeholder="e.g. Kagawad, Secretary"
                aria-invalid={!!errors.role}
              />
              <FieldError errors={[errors.role]} />
            </Field>

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
