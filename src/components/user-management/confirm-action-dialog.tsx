'use client';

import { ConfirmAction, confirmMeta } from './types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface ConfirmActionDialogProps {
  confirmAction: ConfirmAction | null;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmActionDialog({
  confirmAction,
  isPending,
  onConfirm,
  onClose,
}: ConfirmActionDialogProps) {
  return (
    <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        {confirmAction && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmMeta[confirmAction.type].title}</AlertDialogTitle>
              <AlertDialogDescription>
                {confirmMeta[confirmAction.type].description(
                  confirmAction.user.fullName ?? confirmAction.user.email ?? 'this user'
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onConfirm}
                disabled={isPending}
                className={
                  confirmMeta[confirmAction.type].destructive
                    ? 'bg-destructive text-white hover:bg-destructive/90'
                    : ''
                }
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  confirmMeta[confirmAction.type].actionLabel
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
