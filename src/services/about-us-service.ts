"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/server";
import { FieldValue } from "firebase-admin/firestore";
import type { ImageItem } from "@/components/multi-image-uploader";
import type { OfficialType } from "@/schemas/about-us-schema";

const SETTINGS_COLLECTION = "settings";
const BARANGAY_PROFILE_DOC = "barangay-profile";

const OFFICIALS_COLLECTIONS: Record<OfficialType, string> = {
  barangay: "barangay-officials",
  sk: "sk-officials",
};

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

export async function getOfficials(type: OfficialType): Promise<Official[]> {
  const collectionName = OFFICIALS_COLLECTIONS[type];
  const snapshot = await adminDb
    .collection(collectionName)
    .orderBy("createdAt", "asc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      fullName: data.fullName,
      role: data.role,
      picture: data.picture ?? undefined,
    };
  });
}

export async function addOfficial(
  type: OfficialType,
  data: { fullName: string; role: string; picture?: ImageItem },
): Promise<void> {
  const collectionName = OFFICIALS_COLLECTIONS[type];

  await adminDb.collection(collectionName).add({
    fullName: data.fullName,
    role: data.role,
    // Only store picture field if a picture was uploaded.
    ...(data.picture ? { picture: data.picture } : {}),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  revalidatePath("/staff/about-us");
}

export async function updateOfficial(
  type: OfficialType,
  id: string,
  data: { fullName: string; role: string; picture?: ImageItem },
): Promise<void> {
  const collectionName = OFFICIALS_COLLECTIONS[type];
  const docRef = adminDb.collection(collectionName).doc(id);

  await docRef.update({
    fullName: data.fullName,
    role: data.role,
    // Remove the picture field if the user cleared it, otherwise store the new value.
    picture: data.picture ?? FieldValue.delete(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  revalidatePath("/staff/about-us");
}

export async function deleteOfficial(
  type: OfficialType,
  id: string,
): Promise<void> {
  const collectionName = OFFICIALS_COLLECTIONS[type];
  await adminDb.collection(collectionName).doc(id).delete();
  revalidatePath("/staff/about-us");
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
