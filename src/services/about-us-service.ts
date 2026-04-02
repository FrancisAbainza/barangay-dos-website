"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/server";
import { FieldValue } from "firebase-admin/firestore";
import type { ImageItem } from "@/components/multi-image-uploader";

const SETTINGS_COLLECTION = "settings";
const BARANGAY_PROFILE_DOC = "barangay-profile";

export interface BarangayProfile {
  name: string;
  address: string;
  tagline: string;
  barangayLogo?: ImageItem;
  skLogo?: ImageItem;
}

export async function getBarangayProfile(): Promise<BarangayProfile | null> {
  const docRef = adminDb
    .collection(SETTINGS_COLLECTION)
    .doc(BARANGAY_PROFILE_DOC);

  const doc = await docRef.get();

  if (!doc.exists) return null;

  const data = doc.data()!;

  return {
    name: data.name ?? "",
    address: data.address ?? "",
    tagline: data.tagline ?? "",
    barangayLogo: data.barangayLogo ?? undefined,
    skLogo: data.skLogo ?? undefined,
  };
}

export async function updateBarangayHeader(data: {
  name: string;
  address: string;
  tagline: string;
  barangayLogo?: ImageItem;
  skLogo?: ImageItem;
}) {
  const docRef = adminDb
    .collection(SETTINGS_COLLECTION)
    .doc(BARANGAY_PROFILE_DOC);

  await docRef.set(
    {
      name: data.name,
      address: data.address,
      tagline: data.tagline,
      barangayLogo: data.barangayLogo ?? FieldValue.delete(),
      skLogo: data.skLogo ?? FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  revalidatePath("/staff/about-us");
}
