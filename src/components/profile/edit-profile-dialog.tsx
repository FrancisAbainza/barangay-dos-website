"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import { editProfileSchema, EditProfileFormValues } from "@/schemas/profile-schema";
import { useAuth } from "@/contexts/auth-context";
import { uploadMultiplePostImages, deleteImagesByPath } from "@/services/storage-service";
import { updateUserProfile } from "@/services/user-service";

export default function EditProfileDialog() {
  const [open, setOpen] = useState(false);
  const { user, userProfile, refreshUserProfile } = useAuth();
  const router = useRouter();

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: userProfile?.fullName ?? "",
      profilePicture: userProfile?.profilePicture ?? [],
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        fullName: userProfile?.fullName ?? "",
        profilePicture: userProfile?.profilePicture ?? [],
      });
    }
  }, [open, userProfile, reset]);

  const onSubmit = async (data: EditProfileFormValues) => {
    if (!user || !userProfile) return;

    try {
      const { fullName, profilePicture = [] } = data;

      // Upload the selected picture to Firebase Storage.
      // - If the item already has a `path`, it's an existing upload and is returned as-is.
      // - If the item's `uri` is a File, it gets uploaded and a download URL + path are returned.
      // - If profilePicture is empty (user cleared it), this resolves to an empty array.
      const uploadedPictures = await uploadMultiplePostImages(profilePicture, `profiles/${user.uid}`);

      // Persist the updated profile fields to Firestore.
      // uploadedPictures[0] is undefined when no picture was selected, which
      // causes updateUserProfile to remove the profilePicture field via FieldValue.delete().
      await updateUserProfile(user.uid, { fullName, profilePicture: uploadedPictures[0] });

      // Find pictures that existed before but are no longer in the uploaded set
      // (i.e. the user removed them), then delete them from Firebase Storage.
      const picturesToDelete = (userProfile.profilePicture ?? []).filter(
        (existing) => !uploadedPictures.some((uploaded) => uploaded.path === existing.path)
      );
      await deleteImagesByPath(picturesToDelete);

      // Re-fetch the user profile so the UI reflects the saved changes immediately.
      await refreshUserProfile();
      // Re-run server components on the current page to sync server-rendered data.
      router.refresh();
      toast.success("Profile updated successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isSubmitting} className="space-y-4">
            <Field data-invalid={!!errors.fullName}>
              <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
              <Input
                {...register("fullName")}
                id="fullName"
                placeholder="Enter your full name"
                aria-invalid={!!errors.fullName}
              />
              <FieldError errors={[errors.fullName]} />
            </Field>

            <Controller
              name="profilePicture"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Profile Picture</FieldLabel>
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
