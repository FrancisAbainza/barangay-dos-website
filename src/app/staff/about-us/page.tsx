import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Info, MapPin, Quote } from "lucide-react";
import EditHeaderDialog from "@/components/about-us/edit-header-dialog";
import AddOfficialDialog from "@/components/about-us/add-official-dialog";
import EditOfficialDialog from "@/components/about-us/edit-official-dialog";
import DeleteOfficialDialog from "@/components/about-us/delete-official-dialog";
import { getBarangayProfile } from "@/services/about-us-service";

interface Official {
  name: string;
  position: string;
  isChief?: boolean;
}

// TODO: Replace with real data from the database
const barangayOfficials: Official[] = [
  { name: "Juan dela Cruz", position: "Punong Barangay", isChief: true },
  { name: "Maria Santos", position: "Kagawad" },
  { name: "Pedro Reyes", position: "Kagawad" },
  { name: "Ana Lopez", position: "Kagawad" },
  { name: "Jose Garcia", position: "Kagawad" },
  { name: "Rosa Martinez", position: "Kagawad" },
  { name: "Carlos Fernandez", position: "Kagawad" },
  { name: "Elena Villanueva", position: "Kagawad" },
  { name: "Liza Bautista", position: "Secretary" },
  { name: "Rodrigo Aquino", position: "Treasurer" },
];

// Fallback values shown when the database has no profile document yet.
const PROFILE_FALLBACK = {
  name: "Barangay Milagrosa",
  address: "District 2, Quezon City, Metro Manila",
  tagline:
    "Dedicated to serving every resident of Barangay Milagrosa with transparency, compassion, and excellence in public service.",
};

const skOfficials: Official[] = [
  { name: "Michael Torres", position: "SK Chairman", isChief: true },
  { name: "Sophia Ramos", position: "SK Kagawad" },
  { name: "Daniel Cruz", position: "SK Kagawad" },
  { name: "Isabella Flores", position: "SK Kagawad" },
  { name: "Gabriel Morales", position: "SK Kagawad" },
  { name: "Camille Navarro", position: "SK Kagawad" },
  { name: "Joshua Castillo", position: "SK Kagawad" },
  { name: "Andrea Mendoza", position: "SK Kagawad" },
  { name: "Patricia Dela Rosa", position: "SK Secretary" },
  { name: "Ryan Santiago", position: "SK Treasurer" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function OfficialsSection({
  title,
  officials,
  logoSrc,
}: {
  title: string;
  officials: Official[];
  logoSrc: string;
}) {
  const chief = officials.find((o) => o.isChief);
  const rest = officials.filter((o) => !o.isChief);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={logoSrc}
              alt={`${title} logo`}
              width={60}
              height={60}
              className="shrink-0 object-contain"
            />
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {officials.length} members
              </p>
            </div>
          </div>
          <AddOfficialDialog title={title} />
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6 space-y-6">
        {/* Leader — centered and prominent */}
        {chief && (
          <div className="relative flex flex-col items-center text-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <div className="absolute top-2 right-2 flex gap-0.5">
              <EditOfficialDialog
                defaultValues={{ fullName: chief.name, role: chief.position }}
              />
              <DeleteOfficialDialog officialName={chief.name} />
            </div>
            <Avatar className="size-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                {getInitials(chief.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-semibold">{chief.name}</p>
              <Badge className="mt-1">{chief.position}</Badge>
            </div>
          </div>
        )}

        {/* Remaining officials — responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rest.map((official) => (
            <div
              key={official.name}
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
            >
              <Avatar className="size-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {getInitials(official.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{official.name}</p>
                <p className="text-xs text-muted-foreground">
                  {official.position}
                </p>
              </div>
              <div className="flex gap-0.5 shrink-0">
                <EditOfficialDialog
                  defaultValues={{
                    fullName: official.name,
                    role: official.position,
                  }}
                />
                <DeleteOfficialDialog officialName={official.name} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AboutUsPage() {
  // Fetch the barangay profile from Firestore.
  // Falls back to hardcoded defaults when no document exists yet.
  const profile = await getBarangayProfile();
  const barangayProfile = {
    name: profile?.name || PROFILE_FALLBACK.name,
    address: profile?.address || PROFILE_FALLBACK.address,
    tagline: profile?.tagline || PROFILE_FALLBACK.tagline,
    barangayLogo: profile?.barangayLogo,
    skLogo: profile?.skLogo,
  };

  return (
    <div className="container space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="bg-accent text-primary p-2 rounded-md">
          <Info />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">About Us</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Barangay Milagrosa officials and Sangguniang Kabataan.
          </p>
        </div>
      </div>

      {/* Barangay Profile Banner */}
      <Card className="overflow-hidden pt-0">
        <div className="bg-primary p-6 text-primary-foreground">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <Image
                src={
                  typeof barangayProfile.barangayLogo?.uri === "string"
                    ? barangayProfile.barangayLogo.uri
                    : "/no-image.jpg"
                }
                alt="Barangay Milagrosa logo"
                width={100}
                height={100}
                className="shrink-0 object-contain"
              />
              <div className="space-y-1.5">
                <h2 className="text-2xl font-bold">{barangayProfile.name}</h2>
                <p className="flex items-center gap-1.5 text-sm text-primary-foreground/70">
                  <MapPin className="size-3.5 shrink-0" />
                  {barangayProfile.address}
                </p>
              </div>
            </div>
            <EditHeaderDialog
              defaultValues={{
                name: barangayProfile.name,
                address: barangayProfile.address,
                tagline: barangayProfile.tagline,
                barangayLogo: barangayProfile.barangayLogo
                  ? [barangayProfile.barangayLogo]
                  : [],
                skLogo: barangayProfile.skLogo
                  ? [barangayProfile.skLogo]
                  : [],
              }}
            />
          </div>
        </div>
        <CardContent className="py-4">
          <div className="flex gap-3 items-start">
            <Quote className="size-5 shrink-0 text-primary mt-0.5" />
            <p className="text-sm italic leading-relaxed text-muted-foreground">
              {barangayProfile.tagline}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Officials Sections */}
      <div className="space-y-6">
        <OfficialsSection
          title="Barangay Officials"
          officials={barangayOfficials}
          logoSrc={
            typeof barangayProfile.barangayLogo?.uri === "string"
              ? barangayProfile.barangayLogo.uri
              : "/no-image.jpg"
          }
        />
        <OfficialsSection
          title="Sangguniang Kabataan"
          officials={skOfficials}
          logoSrc={
            typeof barangayProfile.skLogo?.uri === "string"
              ? barangayProfile.skLogo.uri
              : "/no-image.jpg"
          }
        />
      </div>
    </div>
  );
}
