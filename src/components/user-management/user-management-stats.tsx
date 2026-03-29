import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCog } from 'lucide-react';

interface UserManagementStatsProps {
  residentCount: number;
  staffCount: number;
}

export function UserManagementStats({ residentCount, staffCount }: UserManagementStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="size-4" />
            Total Residents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{residentCount}</p>
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
          <p className="text-3xl font-bold">{staffCount}</p>
          <p className="text-muted-foreground text-xs">All staff members</p>
        </CardContent>
      </Card>
    </div>
  );
}
