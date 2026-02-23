import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/contexts/auth-context";

export const metadata: Metadata = {
  title: "Barangay Milagrosa Website",
  description: "A modern, user-friendly website for Barangay Milagrosa, providing residents with easy access to announcements, document requests, court reservations, complaint reporting, and more.",
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
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
