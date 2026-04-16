"use client";

import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, UserRound, ShieldCheck, CalendarDays } from "lucide-react";
import EditProfileDialog from "@/components/profile/edit-profile-dialog";
import DeleteAccountButton from "@/components/profile/delete-account-button";
import { UserProfile } from "@/types";
import { formatShortDate } from "@/lib/utils";
import { UserX } from "lucide-react";

interface ProfileContentProps {
  profile: UserProfile | null;
  userId: string;
}

export default function ProfileContent({ profile, userId }: ProfileContentProps) {
  const { user } = useAuth();
  const isOwner = user?.uid === userId;

  if (!profile) {
    return (
      <div className="container mx-auto">
        <Card className="overflow-hidden shadow-md">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <UserX className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">User Not Found</h2>
              <p className="text-sm text-muted-foreground">
                The profile you&apos;re looking for doesn&apos;t exist or may have been removed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Card className="overflow-hidden shadow-md py-0">
        {/* Banner */}
        <div className="relative h-32 bg-primary" />

        {/* Avatar — overlapping the banner */}
        <div className="relative px-6">
          <Avatar className="absolute -top-20 right-[50%] translate-x-1/2 h-25 w-25 text-2xl ring-4 ring-background shadow-md md:translate-x-0 md:left-6">
            <AvatarImage src={profile.profilePicture?.uri} />
            <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
              {profile.fullName.charAt(0).toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
        </div>

        <CardContent className="pt-3 px-6 pb-6 space-y-6">
          {/* Name, role & actions */}
          <div className="flex flex-col items-center justify-between gap-4 text-center md:items-start md:flex-row md:text-start">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold leading-tight">
                {profile.fullName}
              </h2>
              <Badge variant="secondary" className="text-xs">
                {profile.role}
              </Badge>
            </div>
            {isOwner && (
              <div className="flex items-center gap-2 shrink-0">
                <EditProfileDialog />
                <DeleteAccountButton />
              </div>
            )}
          </div>

          <Separator />

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 px-4 py-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium truncate">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 px-4 py-3">
              <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="text-sm font-medium truncate">{profile.fullName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 px-4 py-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-medium">{profile.role}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 px-4 py-3">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium">{formatShortDate(profile.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
