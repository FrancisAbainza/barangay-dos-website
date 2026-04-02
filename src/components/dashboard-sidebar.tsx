"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Megaphone,
  FileText,
  CalendarCheck,
  MessageSquareWarning,
  Eye,
  Navigation,
  Camera,
  Info,
  LogOut,
  ChevronsUpDown,
  Users,
  User,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useBarangayProfile } from "@/contexts/barangay-profile-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";

const residentMenuItems = [
  { title: "Home", href: "/resident", icon: Home },
  { title: "News", href: "/resident/news", icon: Megaphone },
  { title: "Document Request", href: "/resident/document-request", icon: FileText },
  { title: "Scholarships", href: "/resident/scholarships", icon: GraduationCap },
  { title: "Complaint", href: "/resident/complaint", icon: MessageSquareWarning },
  { title: "Transparency", href: "/resident/transparency", icon: Eye },
  { title: "Tanod Tracking", href: "/resident/tanod-tracking", icon: Navigation },
  { title: "Surveillance (Tentative)", href: "/resident/surveillance", icon: Camera },
  { title: "About Us", href: "/resident/about-us", icon: Info },
];

const adminMenuItems = [
  { title: "Home", href: "/staff", icon: Home },
  { title: "News", href: "/staff/news", icon: Megaphone },
  { title: "Document Request", href: "/staff/document-request", icon: FileText },
  { title: "Scholarships", href: "/staff/scholarships", icon: GraduationCap },
  { title: "Complaint", href: "/staff/complaint", icon: MessageSquareWarning },
  { title: "Transparency", href: "/staff/transparency", icon: Eye },
  { title: "Tanod Tracking", href: "/staff/tanod-tracking", icon: Navigation },
  { title: "Surveillance (Tentative)", href: "/staff/surveillance", icon: Camera },
  { title: "About Us", href: "/staff/about-us", icon: Info },
  { title: "User Management", href: "/staff/user-management", icon: Users },
];

const tanodMenuItems = [
  { title: "Home", href: "/staff", icon: Home },
  { title: "Tanod Tracking", href: "/staff/tanod-tracking", icon: Navigation },
  { title: "Surveillance (Tentative)", href: "/staff/surveillance", icon: Camera },
]

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, userProfile, logout } = useAuth();
  const { barangayName, barangayLogoUrl } = useBarangayProfile();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <>
      <Sidebar collapsible="icon" className="hidden md:flex border-r-0">
        {/* Header */}
        {!collapsed && (
          <SidebarHeader className="flex flex-row items-center justify-center border-b border-sidebar-border py-4">
            <div className="flex flex-col items-center gap-2">
              <Image
                src={barangayLogoUrl ?? "/no-image.jpg"}
                alt={`${barangayName} logo`}
                width={150}
                height={150}
              />
              <span className="font-semibold text-sm">{barangayName} Website</span>
            </div>

          </SidebarHeader>
        )}
        {/* Navigation */}
        <SidebarContent>
          <SidebarMenu className="p-2">
            {(
              userProfile?.role === "Resident" ? residentMenuItems :
              userProfile?.role === "Tanod" ? tanodMenuItems :
              adminMenuItems
            ).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={collapsed ? item.title : undefined}
                    className="gap-3"
                  >
                    <Link href={item.href}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        {/* User Section */}
        <SidebarFooter className="border-t border-sidebar-border p-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={`h-auto w-full gap-2 px-0 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${collapsed ? "justify-center" : "justify-between"
                  }`}
                title={collapsed ? user?.email ?? "User" : undefined}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={userProfile?.profilePicture?.[0]?.uri as string | undefined} />
                    <AvatarFallback className="text-xs">
                      {userProfile?.fullName?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="min-w-0 text-left">
                      <p className="truncate text-sm font-semibold leading-tight text-sidebar-foreground">
                        {userProfile?.fullName ?? "User"}
                      </p>
                      <p className="truncate text-xs text-sidebar-foreground/60">
                        {userProfile?.role}
                      </p>
                    </div>
                  )}
                </div>
                {!collapsed && <ChevronsUpDown className="h-4 w-4 shrink-0 text-sidebar-foreground/60" />}
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-64 p-0">
              <div className="flex items-center gap-3 p-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={userProfile?.profilePicture?.[0]?.uri as string | undefined} />
                  <AvatarFallback>
                    {userProfile?.fullName?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {userProfile?.fullName ?? "User"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {userProfile?.email ?? "—"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="p-1">
                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start gap-2"
                >
                  <Link href="/profile">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="w-full justify-start gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </SidebarFooter>
      </Sidebar>
      <SidebarTrigger className="p-4 hidden md:flex" />
    </>
  );
}
