"use server";

import { adminDb } from "@/lib/firebase/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { ResidentProfile } from "@/types/user-profile";

const RESIDENTS_COLLECTION = 'residents';

export async function createResident(
  userId: string,
  fullName: string,
  email: string,
) {
  const docRef = adminDb.collection(RESIDENTS_COLLECTION).doc(userId);

  // Add post data to Firestore
  const data = {
    fullName,
    email,
    role: 'Resident',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(data);
}

export async function getResidentById(userId: string): Promise<ResidentProfile | null> {
  const docRef = adminDb.collection(RESIDENTS_COLLECTION).doc(userId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data()!;
  return {
    uid: doc.id,
    fullName: data.fullName ?? null,
    email: data.email ?? null,
    role: data.role,
    createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
  };
}