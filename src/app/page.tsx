import {
  Megaphone,
  FileText,
  CalendarCheck,
  AlertTriangle,
  Eye,
  Shield,
  UserCog,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ResidentAuthButton from "@/components/resident-auth-button";
import StaffAuthButton from "@/components/staff-auth-button";
import Image from "next/image";
import logo from '../../public/logo.png';

const features = [
  {
    icon: Megaphone,
    title: "Announcements",
    description:
      "Stay up-to-date with the latest news, events, and official notices from Barangay Milagrosa.",
    badge: "Community",
  },
  {
    icon: FileText,
    title: "Document Request",
    description:
      "Request barangay certificates, clearances, and other official documents online — no need to queue.",
    badge: "Services",
  },
  {
    icon: CalendarCheck,
    title: "Court Reservations",
    description:
      "Book the barangay basketball court or multi-purpose hall for your events and activities.",
    badge: "Facilities",
  },
  {
    icon: AlertTriangle,
    title: "Complaint Reporting",
    description:
      "Submit complaints or concerns directly to barangay officials and track the resolution status.",
    badge: "Safety",
  },
  {
    icon: Eye,
    title: "Transparency",
    description:
      "Access public records, budget reports, and barangay project updates in one transparent portal.",
    badge: "Governance",
  },
  {
    icon: Shield,
    title: "Tanod Tracking",
    description:
      "Monitor real-time patrol coverage of Barangay Tanod to ensure safety across the community.",
    badge: "Security",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-2">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={logo}
              alt="Picture of barangay milagrosa's logo"
              width={75}
              height={75}
            />
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Republic of the Philippines
              </p>
              <p className="text-xl font-bold leading-tight text-foreground">
                Barangay Milagrosa
              </p>
            </div>
          </div>
          <Badge className="hidden sm:flex">
            Official Portal
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary px-6 py-24 text-primary-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white" />
        </div>
        <div className="relative mx-auto max-w-6xl text-center">
          <Badge className="mb-6 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30">
            Digital Barangay Services
          </Badge>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Welcome to Barangay
            <br />
            <span className="text-secondary">Milagrosa</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-primary-foreground/80 sm:text-xl">
            Your one-stop digital portal for barangay services. Access
            announcements, request documents, reserve facilities, and connect
            with your community — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ResidentAuthButton />
            <StaffAuthButton />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg">
              Barangay Milagrosa brings essential government services directly
              to your fingertips.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description, badge }) => (
              <Card
                key={title}
                className="group border-border transition-shadow duration-300 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge className="text-xs">
                      {badge}
                    </Badge>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Entry Section */}
      <section className="bg-muted/50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Choose Your Portal
            </h2>
            <p className="text-base text-muted-foreground sm:text-lg">
              Select the portal that matches your role to get started.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Resident Card */}
            <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-10 text-center shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-10 w-10" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-foreground">
                Resident
              </h3>
              <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
                Access barangay services, submit requests, view announcements,
                and track your community.
              </p>
              <Button size="lg" className="w-full cursor-pointer">
                <User className="mr-2 h-5 w-5" />
                Enter as Resident
              </Button>
            </div>

            {/* Staff Card */}
            <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-10 text-center shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserCog className="h-10 w-10" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-foreground">
                Staff
              </h3>
              <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
                Manage barangay operations, process document requests, monitor
                tanod dispatches, and more.
              </p>
              <Button size="lg" className="w-full cursor-pointer">
                <UserCog className="mr-2 h-5 w-5" />
                Enter as Staff
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 py-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Barangay Milagrosa &mdash; Official Digital Portal. All rights reserved.
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Republic of the Philippines
          </p>
        </div>
      </footer>
    </div>
  );
}
