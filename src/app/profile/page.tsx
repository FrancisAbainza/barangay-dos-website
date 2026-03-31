"use client";

import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, UserRound, ShieldCheck, CalendarDays } from "lucide-react";
import EditProfileButton from "@/components/profile/edit-profile-button";

export default function ProfilePage() {
  const { userProfile } = useAuth();

  const formattedDate = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "—";

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center pb-4">
          <div className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16 text-xl">
              <AvatarImage src={userProfile?.profilePicture?.[0]?.uri as string | undefined} />
              <AvatarFallback>
                {userProfile?.fullName?.charAt(0).toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl">{userProfile?.fullName ?? "User"}</CardTitle>
              <Badge variant="secondary" className="w-fit">
                {userProfile?.role ?? "—"}
              </Badge>
            </div>
          </div>
          <EditProfileButton />
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{userProfile?.email ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="text-sm font-medium">{userProfile?.fullName ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-sm font-medium">{userProfile?.role ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Member Since</p>
              <p className="text-sm font-medium">{formattedDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
