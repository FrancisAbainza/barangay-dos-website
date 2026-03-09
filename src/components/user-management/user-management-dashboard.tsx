'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth-context';
import { UserProfile } from '@/types/user-profile';
import {
  banResident,
  unbanResident,
  deleteResident,
  deleteStaff,
  createStaff,
} from '@/services/user-service';
import { createStaffSchema, CreateStaffFormValues } from '@/schemas/auth-schema';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TablePagination } from '@/components/table-pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  MoreHorizontal,
  UserPlus,
  ShieldBan,
  ShieldCheck,
  Trash2,
  Loader2,
  Users,
  UserCog,
  Search,
} from 'lucide-react';

interface UserManagementDashboardProps {
  initialResidents: UserProfile[];
  initialStaff: UserProfile[];
}

type ConfirmAction =
  | { type: 'ban'; user: UserProfile }
  | { type: 'unban'; user: UserProfile }
  | { type: 'delete-resident'; user: UserProfile }
  | { type: 'delete-staff'; user: UserProfile };

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
  const [residentsPage, setResidentsPage] = useState(1);
  const [staffPage, setStaffPage] = useState(1);

  const PAGE_SIZE = 10;

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

  const residentsTotalPages = Math.max(1, Math.ceil(filteredResidents.length / PAGE_SIZE));
  const staffTotalPages = Math.max(1, Math.ceil(filteredStaff.length / PAGE_SIZE));
  const paginatedResidents = filteredResidents.slice(
    (residentsPage - 1) * PAGE_SIZE,
    residentsPage * PAGE_SIZE
  );
  const paginatedStaff = filteredStaff.slice(
    (staffPage - 1) * PAGE_SIZE,
    staffPage * PAGE_SIZE
  );

  // --- Create Staff Form ---
  const form = useForm<CreateStaffFormValues>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: { fullName: '', email: '', role: 'Admin', password: '', confirmPassword: '' },
  });

  function handleOpenCreateDialog() {
    form.reset();
    setActionError(null);
    setShowCreateDialog(true);
  }

  async function handleCreateStaff(values: CreateStaffFormValues) {
    setActionError(null);
    try {
      await createStaff(values.fullName, values.email, values.password, values.role);
      setShowCreateDialog(false);
      startTransition(() => router.refresh());
    } catch (err: any) {
      setActionError(err.message ?? 'Failed to create staff account. Please try again.');
    }
  }

  // --- Confirm Action Execution ---
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
      } catch (err: any) {
        setActionError(err.message ?? 'An error occurred. Please try again.');
        setConfirmAction(null);
      }
    });
  }

  // --- Helpers ---
  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  const confirmMeta: Record<
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
      description: (n) => `Are you sure you want to unban ${n}? They will regain access to their account.`,
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

  return (
    <div className="container space-y-6 m-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
        <div className='flex items-center gap-3'>
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
          <Button onClick={handleOpenCreateDialog} className="gap-2">
            <UserPlus className="size-4" />
            Add Staff Account
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="size-4" />
              Total Residents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{initialResidents.length}</p>
            <p className="text-muted-foreground text-xs">All residents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCog className="size-4" />
              Total Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{initialStaff.length}</p>
            <p className="text-muted-foreground text-xs">All staff members</p>
          </CardContent>
        </Card>
      </div>

      {/* Global Error */}
      {actionError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
          {actionError}
        </div>
      )}

      {/* Tabs */}
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

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or user ID…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setResidentsPage(1);
              setStaffPage(1);
            }}
            className="pl-9"
          />
        </div>

        {/* Residents Tab */}
        <TabsContent value="residents" className="mt-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Member Since</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                      {search ? 'No residents match your search.' : 'No resident accounts found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedResidents.map((resident) => (
                    <TableRow key={resident.uid}>
                      <TableCell className="font-medium">
                        {resident.fullName ?? '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {resident.email ?? '—'}
                      </TableCell>
                      <TableCell>
                        {resident.banned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(resident.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Open actions menu">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {resident.banned ? (
                              <DropdownMenuItem
                                onClick={() => setConfirmAction({ type: 'unban', user: resident })}
                                className="gap-2"
                              >
                                <ShieldCheck className="size-4 text-green-600" />
                                Unban Resident
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setConfirmAction({ type: 'ban', user: resident })}
                                className="gap-2"
                              >
                                <ShieldBan className="size-4 text-amber-600" />
                                Ban Resident
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                setConfirmAction({ type: 'delete-resident', user: resident })
                              }
                              className="gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-4" />
                              Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredResidents.length > 0 && (
            <TablePagination
              page={residentsPage}
              totalPages={residentsTotalPages}
              pageSize={PAGE_SIZE}
              totalItems={filteredResidents.length}
              itemLabel="residents"
              onPageChange={setResidentsPage}
            />
          )}
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="mt-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Member Since</TableHead>
                  {isSuperAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isSuperAdmin ? 5 : 4}
                      className="text-center text-muted-foreground py-10"
                    >
                      {search ? 'No staff match your search.' : 'No staff accounts found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStaff.map((staff) => (
                    <TableRow key={staff.uid}>
                      <TableCell className="font-medium">
                        {staff.fullName ?? '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {staff.email ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={staff.role === 'Super Admin' ? 'default' : staff.role === 'Tanod' ? 'outline' : 'secondary'}
                        >
                          {staff.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(staff.createdAt)}
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell className="text-right">
                          {/* Prevent Super Admin from deleting their own account */}
                          {staff.uid !== userProfile?.uid ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Open actions menu">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    setConfirmAction({ type: 'delete-staff', user: staff })
                                  }
                                  className="gap-2 text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="size-4" />
                                  Delete Account
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-xs text-muted-foreground pr-3">You</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredStaff.length > 0 && (
            <TablePagination
              page={staffPage}
              totalPages={staffTotalPages}
              pageSize={PAGE_SIZE}
              totalItems={filteredStaff.length}
              itemLabel="staff"
              onPageChange={setStaffPage}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Confirm Action Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
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
                  onClick={executeConfirm}
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

      {/* Create Staff Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Staff Account</DialogTitle>
            <DialogDescription>
              Create a new Admin or Super Admin account. They will be able to log in with these
              credentials.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleCreateStaff)} className="space-y-4 mt-2">
            {actionError && (
              <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                {actionError}
              </div>
            )}

            <fieldset disabled={form.formState.isSubmitting} className="space-y-4">
              <Controller
                name="fullName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                    <Input {...field} id={field.name} placeholder="Enter full name" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input {...field} id={field.name} type="email" placeholder="Enter email address" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="role"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Role</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Super Admin">Super Admin</SelectItem>
                        <SelectItem value="Tanod">Tanod</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input {...field} id={field.name} type="password" placeholder="Min. 6 characters" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                    <Input {...field} id={field.name} type="password" placeholder="Re-enter password" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting} className="gap-2">
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="size-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </div>
            </fieldset>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
