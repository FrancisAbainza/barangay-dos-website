"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { OfficialType } from "@/schemas/about-us-schema";
import { deleteOfficial } from "@/services/about-us-service";
import { useAboutUs } from "@/contexts/about-us-context";
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

interface DeleteOfficialDialogProps {
  id: string;
  type: OfficialType;
  officialName: string;
}

export default function DeleteOfficialDialog({
  id,
  type,
  officialName,
}: DeleteOfficialDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { removeOfficial } = useAboutUs();

  const handleDelete = async () => {
    setIsPending(true);
    try {
      // Delete the official document from the correct Firestore collection.
      await deleteOfficial(type, id);

      // Optimistically remove the official from local state so the UI updates
      // immediately without refetching from the database.
      removeOfficial(type, id);
      toast.success(`${officialName} removed successfully!`);
      setOpen(false);
    } catch (error) {
      console.error("Failed to delete official:", error);
      toast.error("Failed to remove official. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-3.5" />
          <span className="sr-only">Delete {officialName}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Official</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-medium text-foreground">{officialName}</span>{" "}
            from the officials list? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
