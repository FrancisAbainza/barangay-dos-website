import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Info, MapPin, Quote } from "lucide-react";
import EditHeaderDialog from "@/components/about-us/edit-header-dialog";
import AddOfficialDialog from "@/components/about-us/add-official-dialog";
import EditOfficialDialog from "@/components/about-us/edit-official-dialog";
import DeleteOfficialDialog from "@/components/about-us/delete-official-dialog";
import {
  getBarangayProfile,
  getOfficials,
  type Official,
} from "@/services/about-us-service";
import {
  type OfficialType,
  BARANGAY_SINGLETON_ROLES,
  SK_SINGLETON_ROLES,
} from "@/schemas/about-us-schema";

// Fallback values shown when the database has no profile document yet.
const PROFILE_FALLBACK = {
  name: "Barangay Dos",
  address: "District 2, Quezon City, Metro Manila",
  tagline:
    "Dedicated to serving every resident with transparency, compassion, and excellence in public service.",
};

// The role that identifies the chief official for each type.
const CHIEF_ROLES: Record<OfficialType, string> = {
  barangay: "Punong Barangay",
  sk: "SK Chairman",
};

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
  type,
  officials,
  logoSrc,
}: {
  title: string;
  type: OfficialType;
  officials: Official[];
  logoSrc: string;
}) {
  const chiefRole = CHIEF_ROLES[type];
  const chief = officials.find((o) => o.role === chiefRole);
  const rest = officials.filter((o) => o.role !== chiefRole);

  // Singleton roles already assigned across all officials in this section.
  const singletonRoles = type === "barangay" ? BARANGAY_SINGLETON_ROLES : SK_SINGLETON_ROLES;
  const allTakenSingletonRoles = officials
    .map((o) => o.role)
    .filter((r) => singletonRoles.includes(r));

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
          <AddOfficialDialog title={title} type={type} takenRoles={allTakenSingletonRoles} />
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6 space-y-6">
        {officials.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No officials added yet. Click &ldquo;Add Official&rdquo; to get
            started.
          </p>
        ) : (
          <>
            {/* Leader — centered and prominent */}
            {chief && (
              <div className="relative flex flex-col items-center text-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="absolute top-2 right-2 flex gap-0.5">
                  <EditOfficialDialog
                    id={chief.id}
                    type={type}
                    takenRoles={allTakenSingletonRoles}
                    defaultValues={{
                      fullName: chief.fullName,
                      role: chief.role,
                      picture: chief.picture ? [chief.picture] : [],
                    }}
                  />
                  <DeleteOfficialDialog
                    id={chief.id}
                    type={type}
                    officialName={chief.fullName}
                  />
                </div>
                <Avatar className="size-16">
                  <AvatarImage
                    src={
                      typeof chief.picture?.uri === "string"
                        ? chief.picture.uri
                        : undefined
                    }
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                    {getInitials(chief.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-base font-semibold">{chief.fullName}</p>
                  <Badge className="mt-1">{chief.role}</Badge>
                </div>
              </div>
            )}

            {/* Remaining officials — responsive grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {rest.map((official) => (
                  <div
                    key={official.id}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
                  >
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage
                        src={
                          typeof official.picture?.uri === "string"
                            ? official.picture.uri
                            : undefined
                        }
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getInitials(official.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {official.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {official.role}
                      </p>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      <EditOfficialDialog
                        id={official.id}
                        type={type}
                        takenRoles={allTakenSingletonRoles}
                        defaultValues={{
                          fullName: official.fullName,
                          role: official.role,
                          picture: official.picture ? [official.picture] : [],
                        }}
                      />
                      <DeleteOfficialDialog
                        id={official.id}
                        type={type}
                        officialName={official.fullName}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default async function AboutUsPage() {
  // Fetch the barangay profile and both officials lists from Firestore in parallel.
  // Each falls back gracefully when no documents exist yet.
  const [profile, barangayOfficials, skOfficials] = await Promise.all([
    getBarangayProfile(),
    getOfficials("barangay"),
    getOfficials("sk"),
  ]);

  const barangayProfile = {
    name: profile?.name || PROFILE_FALLBACK.name,
    address: profile?.address || PROFILE_FALLBACK.address,
    tagline: profile?.tagline || PROFILE_FALLBACK.tagline,
    barangayLogo: profile?.barangayLogo,
    skLogo: profile?.skLogo,
  };

  return (
    <div className="container space-y-6 m-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="bg-accent text-primary p-2 rounded-md">
          <Info />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">About Us</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {barangayProfile.name} officials and Sangguniang Kabataan.
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
                alt={`${barangayProfile.name} logo`}
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
          type="barangay"
          officials={barangayOfficials}
          logoSrc={
            typeof barangayProfile.barangayLogo?.uri === "string"
              ? barangayProfile.barangayLogo.uri
              : "/no-image.jpg"
          }
        />
        <OfficialsSection
          title="Sangguniang Kabataan"
          type="sk"
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
