"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Official, OfficialType } from "@/types/about-us";
import { useDeleteOfficial } from "@/hooks/use-officials-queries";
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
  official: Official;
  type: OfficialType;
}

export default function DeleteOfficialDialog({
  official,
  type,
}: DeleteOfficialDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const deleteOfficialMutation = useDeleteOfficial();

  const handleDelete = async () => {
    setIsPending(true);
    try {
      // Call the mutation which handles image deletion internally
      await deleteOfficialMutation.mutateAsync({
        type,
        id: official.id,
        picture: official.picture,
      });
      
      toast.success(`${official.fullName} removed successfully!`);
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
          <span className="sr-only">Delete {official.fullName}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Official</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-medium text-foreground">{official.fullName}</span>{" "}
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
