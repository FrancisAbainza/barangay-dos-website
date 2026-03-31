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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TablePagination } from '@/components/table-pagination';
import { MoreHorizontal, ShieldBan, ShieldCheck, Trash2 } from 'lucide-react';

interface ResidentsTableProps {
  residents: UserProfile[];
  searchKey: string;
  onConfirmAction: (action: ConfirmAction) => void;
}

const PAGE_SIZE = 10;

export function ResidentsTable({ residents, searchKey, onConfirmAction }: ResidentsTableProps) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [searchKey]);

  const totalPages = Math.max(1, Math.ceil(residents.length / PAGE_SIZE));
  const paginated = residents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
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
            {residents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  {searchKey ? 'No residents match your search.' : 'No resident accounts found.'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((resident) => (
                <TableRow key={resident.uid}>
                  <TableCell className="font-medium">{resident.fullName ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{resident.email ?? '—'}</TableCell>
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
                            onClick={() => onConfirmAction({ type: 'unban', user: resident })}
                            className="gap-2"
                          >
                            <ShieldCheck className="size-4 text-green-600" />
                            Unban Resident
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => onConfirmAction({ type: 'ban', user: resident })}
                            className="gap-2"
                          >
                            <ShieldBan className="size-4 text-amber-600" />
                            Ban Resident
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            onConfirmAction({ type: 'delete-resident', user: resident })
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
      {residents.length > 0 && (
        <TablePagination
          page={page}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          totalItems={residents.length}
          itemLabel="residents"
          onPageChange={setPage}
        />
      )}
    </>
  );
}
