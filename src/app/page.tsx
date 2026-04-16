"use client";

import {
  Megaphone,
  FileText,
  GraduationCap,
  AlertTriangle,
  Eye,
  Shield,
  UserCog,
  User,
  Brain,
  ScanText,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ResidentAuthDialog from "@/components/resident-auth-dialog";
import StaffAuthDialog from "@/components/staff-auth-dialog";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";
import { useBarangayProfile } from "@/hooks/use-barangay-profile-query";

const getFeatures = (name: string) => [
  {
    icon: Megaphone,
    title: "Announcements",
    description:
      `Stay up-to-date with the latest news, events, and official notices from ${name}.`,
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
    icon: GraduationCap,
    title: "Scholarship Processing",
    description:
      "Apply for barangay scholarship programs and track your application status online.",
    badge: "Education",
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
  const { barangayName } = useBarangayProfile();
  const features = getFeatures(barangayName);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary px-6 py-24 text-primary-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white" />
        </div>
        <div className="relative container m-auto text-center">
          <Badge className="mb-6 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30">
            KaagapAI: Barangay Management System
          </Badge>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Welcome to Barangay
            <br />
            <span className="text-secondary">{barangayName.replace(/^Barangay\s*/i, "")}</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-primary-foreground/80 sm:text-xl">
            Your one-stop digital portal for barangay services. Access
            announcements, request documents, report complaints, and connect
            with your community — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ResidentAuthDialog />
            <StaffAuthDialog />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="container m-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg">
              {barangayName} brings essential government services directly
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

      {/* Emerging Technologies Section */}
      <section className="px-6 py-20">
        <div className="container m-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Powered by Emerging Technologies
            </h2>
            <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg">
              Our system leverages cutting-edge technologies to deliver smarter,
              faster, and more accessible barangay services.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {/* AI */}
            <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                <Brain className="h-10 w-10" />
              </div>
              <Badge className="mb-3 bg-violet-500/10 text-violet-600 hover:bg-violet-500/20">AI-Powered</Badge>
              <h3 className="mb-3 text-xl font-bold text-foreground">Artificial Intelligence</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                AI-driven insights help barangay staff make informed decisions,
                automate routine tasks, and deliver personalized services to
                every resident.
              </p>
            </div>

            {/* OCR */}
            <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-sky-500/10 text-sky-500">
                <ScanText className="h-10 w-10" />
              </div>
              <Badge className="mb-3 bg-sky-500/10 text-sky-600 hover:bg-sky-500/20">OCR</Badge>
              <h3 className="mb-3 text-xl font-bold text-foreground">Optical Character Recognition</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Automatically extract and digitize text from scanned
                documents, reducing manual data entry and speeding up
                verification processes.
              </p>
            </div>

            {/* Voice Assistant */}
            <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Mic className="h-10 w-10" />
              </div>
              <Badge className="mb-3 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">Voice</Badge>
              <h3 className="mb-3 text-xl font-bold text-foreground">Voice-Powered Assistant</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Speak naturally to navigate services, submit requests, or get
                answers — making the portal accessible to all residents,
                including those with limited digital literacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Entry Section */}
      <section className="bg-muted/50 px-6 py-20">
        <div className="container m-auto">
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
              <ResidentAuthDialog triggerClassName="w-full cursor-pointer px-8" />
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
              <StaffAuthDialog triggerClassName="w-full cursor-pointer px-8" />
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
