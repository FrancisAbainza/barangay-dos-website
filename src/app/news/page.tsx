"use client";

import PublicHeader from "@/components/public-header";
import PublicFooter from "@/components/public-footer";
import { NewsPageDashboard } from "@/components/news/news-page-dashboard";

export default function NewsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main className="flex-1 px-4 py-4">
        <NewsPageDashboard />
      </main>
      <PublicFooter />
    </div>
  );
}
