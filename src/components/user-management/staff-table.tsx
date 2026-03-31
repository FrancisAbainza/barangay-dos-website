'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '@/schemas/profile-schema';
import { ConfirmAction, formatDate } from './types';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TablePagination } from '@/components/table-pagination';
import { MoreHorizontal, Trash2 } from 'lucide-react';

interface StaffTableProps {
  staff: UserProfile[];
  searchKey: string;
  isSuperAdmin: boolean;
  currentUserId: string | undefined;
  onConfirmAction: (action: ConfirmAction) => void;
}

const PAGE_SIZE = 10;

export function StaffTable({
  staff,
  searchKey,
  isSuperAdmin,
  currentUserId,
  onConfirmAction,
}: StaffTableProps) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [searchKey]);

  const totalPages = Math.max(1, Math.ceil(staff.length / PAGE_SIZE));
  const paginated = staff.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
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
            {staff.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isSuperAdmin ? 5 : 4}
                  className="text-center text-muted-foreground py-10"
                >
                  {searchKey ? 'No staff match your search.' : 'No staff accounts found.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((member) => (
                <TableRow key={member.uid}>
                  <TableCell className="font-medium">{member.fullName ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{member.email ?? '—'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.role === 'Super Admin'
                          ? 'default'
                          : member.role === 'Tanod'
                            ? 'outline'
                            : 'secondary'
                      }
                    >
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(member.createdAt)}
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell className="text-right">
                      {member.uid !== currentUserId ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Open actions menu">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                onConfirmAction({ type: 'delete-staff', user: member })
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
      {staff.length > 0 && (
        <TablePagination
          page={page}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalItems={staff.length}
          itemLabel="staff"
          onPageChange={setPage}
        />
      )}
    </>
  );
}
