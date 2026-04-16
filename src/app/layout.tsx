import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/contexts/auth-context";
import QueryProvider from "@/lib/query-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Barangay Dos Website",
  description: "A modern, user-friendly website for Barangay Dos, providing residents with easy access to announcements, document requests, court reservations, complaint reporting, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <AuthProvider>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
