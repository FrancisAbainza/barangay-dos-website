'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { UserProfile } from "@/types";
import { banResident, unbanResident, deleteResident, deleteStaff } from '@/services/user-service';
import { ConfirmAction } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { UserManagementHeader } from './user-management-header';
import { UserManagementStats } from './user-management-stats';
import { ResidentsTable } from './residents-table';
import { StaffTable } from './staff-table';
import { ConfirmActionDialog } from './confirm-action-dialog';
import { CreateStaffDialog } from './create-staff-dialog';
import { Users, UserCog, Search } from 'lucide-react';

interface UserManagementDashboardProps {
  initialResidents: UserProfile[];
  initialStaff: UserProfile[];
}

export function UserManagementDashboard({
  initialResidents,
  initialStaff,
}: UserManagementDashboardProps) {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const isSuperAdmin = userProfile?.role === 'Super Admin';

  const searchLower = search.toLowerCase();
  const filteredResidents = initialResidents.filter(
    (r) =>
      r.uid.toLowerCase().includes(searchLower) ||
      (r.fullName ?? '').toLowerCase().includes(searchLower) ||
      (r.email ?? '').toLowerCase().includes(searchLower)
  );
  const filteredStaff = initialStaff.filter(
    (s) =>
      s.uid.toLowerCase().includes(searchLower) ||
      (s.fullName ?? '').toLowerCase().includes(searchLower) ||
      (s.email ?? '').toLowerCase().includes(searchLower)
  );

  function executeConfirm() {
    if (!confirmAction) return;
    setActionError(null);

    startTransition(async () => {
      try {
        switch (confirmAction.type) {
          case 'ban':
            await banResident(confirmAction.user.uid);
            break;
          case 'unban':
            await unbanResident(confirmAction.user.uid);
            break;
          case 'delete-resident':
            await deleteResident(confirmAction.user.uid);
            break;
          case 'delete-staff':
            await deleteStaff(confirmAction.user.uid);
            break;
        }
        setConfirmAction(null);
        router.refresh();
      } catch (err: unknown) {
        setActionError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
        setConfirmAction(null);
      }
    });
  }

  return (
    <div className="container space-y-6 m-auto">
      <UserManagementHeader
        isSuperAdmin={isSuperAdmin}
        onAddStaff={() => setShowCreateDialog(true)}
      />

      <UserManagementStats
        residentCount={initialResidents.length}
        staffCount={initialStaff.length}
      />

      {actionError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
          {actionError}
        </div>
      )}

      <Tabs defaultValue="residents">
        <TabsList>
          <TabsTrigger value="residents" className="gap-2">
            <Users className="size-4" />
            Residents
          </TabsTrigger>
          <TabsTrigger value="staff" className="gap-2">
            <UserCog className="size-4" />
            Staff
          </TabsTrigger>
        </TabsList>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or user ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <TabsContent value="residents" className="mt-4">
          <ResidentsTable
            residents={filteredResidents}
            searchKey={search}
            onConfirmAction={setConfirmAction}
          />
        </TabsContent>

        <TabsContent value="staff" className="mt-4">
          <StaffTable
            staff={filteredStaff}
            searchKey={search}
            isSuperAdmin={isSuperAdmin}
            currentUserId={userProfile?.uid}
            onConfirmAction={setConfirmAction}
          />
        </TabsContent>
      </Tabs>

      <ConfirmActionDialog
        confirmAction={confirmAction}
        isPending={isPending}
        onConfirm={executeConfirm}
        onClose={() => setConfirmAction(null)}
      />

      <CreateStaffDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => startTransition(() => router.refresh())}
      />
    </div>
  );
}
