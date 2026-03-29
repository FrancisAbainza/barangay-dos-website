'use client';

import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';

interface UserManagementHeaderProps {
  isSuperAdmin: boolean;
  onAddStaff: () => void;
}

export function UserManagementHeader({ isSuperAdmin, onAddStaff }: UserManagementHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-accent text-primary p-2 rounded-md">
          <Users />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage resident and staff accounts.
          </p>
        </div>
      </div>
      {isSuperAdmin && (
        <Button onClick={onAddStaff} className="gap-2">
          <UserPlus className="size-4" />
          Add Staff Account
        </Button>
      )}
    </div>
  );
}
