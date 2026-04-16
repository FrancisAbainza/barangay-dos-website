import type { ImageItem } from "./shared";

export type { ImageItem };

export interface BarangayProfile {
  name: string;
  address: string;
  tagline: string;
  barangayLogo?: ImageItem;
  skLogo?: ImageItem;
}

export interface Official {
  id: string;
  fullName: string;
  role: string;
  picture?: ImageItem;
}

export type OfficialType = "barangay" | "sk";

export const BARANGAY_ROLES = [
  "Punong Barangay",
  "Kagawad",
  "Secretary",
  "Treasurer",
] as const;

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

export const SK_SINGLETON_ROLES: string[] = [
  "SK Chairman",
  "SK Secretary",
  "SK Treasurer",
];
