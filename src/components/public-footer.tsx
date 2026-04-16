"use client";

import { useBarangayProfile } from "@/hooks/use-barangay-profile-query";

export default function PublicFooter() {
  const { barangayName } = useBarangayProfile();

  return (
    <footer className="border-t border-border bg-card px-6 py-8">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {barangayName} &mdash; KaagapAI: Barangay Management System. All rights reserved.
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Republic of the Philippines
        </p>
      </div>
    </footer>
  );
}
