"use client";

import Image from "next/image";
import Link from "next/link";
import { Home, Menu, Megaphone, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useBarangayProfile } from "@/contexts/barangay-profile-context";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/news", label: "News", icon: Megaphone },
  { href: "/about-us", label: "About Us", icon: Info },
];

export default function PublicHeader() {
  const { barangayName, barangayLogoUrl } = useBarangayProfile();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card py-2 px-4">
      <div className="container flex h-full m-auto items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={barangayLogoUrl ?? "/logo.png"}
            alt={`${barangayName} logo`}
            width={75}
            height={75}
          />
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Republic of the Philippines
            </p>
            <p className="text-base font-bold leading-tight text-foreground">
              {barangayName}
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="sm:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            {/* Sidebar-style branding header */}
            <SheetHeader className="flex flex-col items-center gap-2 border-b border-border py-4 px-4">
              <Image
                src={barangayLogoUrl ?? "/no-image.jpg"}
                alt={`${barangayName} logo`}
                width={100}
                height={100}
              />
              <SheetTitle className="text-sm font-semibold">
                {barangayName} Website
              </SheetTitle>
            </SheetHeader>

            {/* Navigation — sidebar menu style */}
            <nav className="flex-1 flex flex-col gap-1 p-2">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <Separator />

            {/* CTA footer */}
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-3 text-center">
                Access barangay services
              </p>
              <div className="flex flex-col gap-2">
                <Button asChild size="sm" className="w-full">
                  <Link href="/">Enter as Resident</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/">Enter as Staff</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
