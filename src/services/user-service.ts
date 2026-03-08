"use server";

import { adminAuth, adminDb } from "@/lib/firebase/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { UserProfile } from "@/types/user-profile";

const RESIDENTS_COLLECTION = 'residents';
const STAFF_COLLECTION = 'staff';

export async function createResident(userId: string, fullName: string, email: string) {
  const docRef = adminDb.collection(RESIDENTS_COLLECTION).doc(userId);
  await docRef.set({
    fullName,
    email,
    role: 'Resident',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function signupStaff(fullName: string, email: string, password: string) {
  const userRecord = await adminAuth.createUser({ email, password });
  await adminAuth.setCustomUserClaims(userRecord.uid, { admin: true });
  const docRef = adminDb.collection(STAFF_COLLECTION).doc(userRecord.uid);
  await docRef.set({
    fullName,
    email,
    role: 'Super Admin',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function getUserById(userId: string, isAdmin: boolean): Promise<UserProfile | null> {
  const collection = isAdmin ? STAFF_COLLECTION : RESIDENTS_COLLECTION;
  const docRef = adminDb.collection(collection).doc(userId);
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
