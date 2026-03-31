"use client";

import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, UserRound, ShieldCheck, CalendarDays } from "lucide-react";
import EditProfileDialog from "@/components/profile/edit-profile-dialog";
import DeleteAccountButton from "@/components/profile/delete-account-button";

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
      <Card className="overflow-hidden shadow-md py-0">
        {/* Banner */}
        <div className="relative h-32 bg-primary" />

        {/* Avatar — overlapping the banner */}
        <div className="relative px-6">
          <Avatar className="absolute -top-20 right-[50%] translate-x-1/2 h-25 w-25 text-2xl ring-4 ring-background shadow-md md:translate-x-0 md:left-6">
            <AvatarImage src={userProfile?.profilePicture?.[0]?.uri as string | undefined} />
            <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
              {userProfile?.fullName?.charAt(0).toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
        </div>

        <CardContent className="pt-3 px-6 pb-6 space-y-6">
          {/* Name, role & actions */}
          <div className="flex flex-col items-center justify-between gap-4 text-center md:items-start md:flex-row md:text-start">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold leading-tight">
                {userProfile?.fullName ?? "User"}
              </h2>
              <Badge variant="secondary" className="text-xs">
                {userProfile?.role ?? "—"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <EditProfileDialog />
              <DeleteAccountButton />
            </div>
          </div>

          <Separator />

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 px-4 py-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium truncate">{userProfile?.email ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 px-4 py-3">
              <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="text-sm font-medium truncate">{userProfile?.fullName ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 px-4 py-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-medium">{userProfile?.role ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 px-4 py-3">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium">{formattedDate}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
