import ResidentHeader from "@/components/resident-header";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ResidentHeader />
      <main className="pt-16">
        {children}
      </main>
    </>
  );
}
