"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/auth-context";
import { deleteImagesByPath } from "@/services/storage-service";
import { deleteUserAccount } from "@/services/user-service";

export default function DeleteAccountButton() {
  const [isPending, setIsPending] = useState(false);
  const { user, userProfile, logout } = useAuth();

  const handleDelete = async () => {
    if (!user || !userProfile) return;

    setIsPending(true);
    try {
      const isAdmin = userProfile.role !== "Resident";

      // Delete profile picture from storage if one exists
      if (userProfile.profilePicture && userProfile.profilePicture.length > 0) {
        await deleteImagesByPath(userProfile.profilePicture);
      }

      // Delete Firestore document and Firebase Auth user
      await deleteUserAccount(user.uid, isAdmin);

      // Sign out the client session
      await logout();
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account. Please try again.");
      setIsPending(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete account?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete your account and all associated data. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
