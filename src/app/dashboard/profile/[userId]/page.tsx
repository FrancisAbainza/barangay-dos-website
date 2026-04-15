import { getUserById } from "@/services/user-service";
import ProfileContent from "@/components/profile/profile-content";

export default async function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const profile = await getUserById(userId);
  return <ProfileContent profile={profile} userId={userId} />;
}
