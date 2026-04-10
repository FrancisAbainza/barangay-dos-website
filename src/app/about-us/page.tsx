"use client";

import AboutUsPageDashboard from "@/components/about-us/about-us-page-dashboard";
import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main className="px-4 py-4">
        <AboutUsPageDashboard />
      </main>
      <PublicFooter />
    </div>
  );
}