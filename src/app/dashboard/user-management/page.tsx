import { getAllResidents, getAllStaff } from "@/services/user-service";
import { UserManagementDashboard } from "@/components/user-management/user-management-dashboard";

export default async function UserManagementPage() {
  const [residents, staff] = await Promise.all([getAllResidents(), getAllStaff()]);
  return <UserManagementDashboard initialResidents={residents} initialStaff={staff} />;
}
