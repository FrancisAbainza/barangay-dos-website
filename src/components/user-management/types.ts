import { UserProfile } from '@/schemas/profile-schema';

export type ConfirmAction =
  | { type: 'ban'; user: UserProfile }
  | { type: 'unban'; user: UserProfile }
  | { type: 'delete-resident'; user: UserProfile }
  | { type: 'delete-staff'; user: UserProfile };

export const confirmMeta: Record<
  ConfirmAction['type'],
  { title: string; description: (name: string) => string; actionLabel: string; destructive: boolean }
> = {
  ban: {
    title: 'Ban Resident',
    description: (n) => `Are you sure you want to ban ${n}? They will no longer be able to log in.`,
    actionLabel: 'Ban',
    destructive: true,
  },
  unban: {
    title: 'Unban Resident',
    description: (n) =>
      `Are you sure you want to unban ${n}? They will regain access to their account.`,
    actionLabel: 'Unban',
    destructive: false,
  },
  'delete-resident': {
    title: 'Delete Resident Account',
    description: (n) =>
      `Are you sure you want to permanently delete ${n}'s account? This action cannot be undone.`,
    actionLabel: 'Delete',
    destructive: true,
  },
  'delete-staff': {
    title: 'Delete Staff Account',
    description: (n) =>
      `Are you sure you want to permanently delete ${n}'s staff account? This action cannot be undone.`,
    actionLabel: 'Delete',
    destructive: true,
  },
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
