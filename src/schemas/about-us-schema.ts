import z from "zod";
import type { ImageItem } from "@/components/multi-image-uploader";

export const editHeaderSchema = z.object({
  name: z.string().min(2, "Barangay name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  tagline: z.string().min(10, "Tagline must be at least 10 characters"),
  barangayLogo: z.array(z.custom<ImageItem>()).optional(),
  skLogo: z.array(z.custom<ImageItem>()).optional(),
});

export type EditHeaderFormValues = z.infer<typeof editHeaderSchema>;

export const BARANGAY_ROLES = [
  "Punong Barangay",
  "Kagawad",
  "Secretary",
  "Treasurer",
] as const;

// Roles that only one official may hold at a time.
export const BARANGAY_SINGLETON_ROLES: string[] = [
  "Punong Barangay",
  "Secretary",
  "Treasurer",
];

export const SK_ROLES = [
  "SK Chairman",
  "SK Kagawad",
  "SK Secretary",
  "SK Treasurer",
] as const;

// Roles that only one official may hold at a time.
export const SK_SINGLETON_ROLES: string[] = [
  "SK Chairman",
  "SK Secretary",
  "SK Treasurer",
];

export type OfficialType = "barangay" | "sk";

export const officialSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  picture: z.array(z.custom<ImageItem>()).optional(),
});

export type OfficialFormValues = z.infer<typeof officialSchema>;
