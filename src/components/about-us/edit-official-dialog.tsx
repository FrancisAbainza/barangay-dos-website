"use client";

import { useState } from "react";
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
import SingleImageUploader from "@/components/single-image-uploader";
import {
  officialSchema,
  type OfficialFormValues,
} from "@/schemas/about-us-schema";
import {
  BARANGAY_ROLES,
  SK_ROLES,
  type Official,
  type OfficialType,
} from "@/types/about-us";
import { useUpdateOfficial } from "@/hooks/use-officials-queries";

interface EditOfficialDialogProps {
  official: Official;
  type: OfficialType;
  takenRoles: string[];
}

export default function EditOfficialDialog({
  official,
  type,
  takenRoles,
}: EditOfficialDialogProps) {
  const roles = type === "barangay" ? BARANGAY_ROLES : SK_ROLES;
  const [open, setOpen] = useState(false);
  const updateOfficialMutation = useUpdateOfficial();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OfficialFormValues>({
    resolver: zodResolver(officialSchema),
    defaultValues: {
      fullName: official.fullName,
      role: official.role,
      picture: official.picture,
    },
  });



  const onSubmit = async (data: OfficialFormValues) => {
    try {
      // Call the mutation which handles upload and delete internally
      updateOfficialMutation.mutate({
        type,
        id: official.id,
        data: {
          fullName: data.fullName,
          role: data.role,
          picture: data.picture ?? undefined,
        },
        oldPicture: official.picture,
      });

      toast.success("Official updated successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Failed to update official:", error);
      toast.error("Failed to update official. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);

        if (val) {
          reset({
            fullName: official.fullName,
            role: official.role,
            picture: official.picture,
          });
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-muted-foreground hover:text-primary"
        >
          <Pencil className="size-3.5" />
          <span className="sr-only">Edit {official.fullName}</span>
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
                          role !== official.role;
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
                  <SingleImageUploader
                    image={field.value}
                    onImageChange={field.onChange}
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
