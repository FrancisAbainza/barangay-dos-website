"use server";

import { revalidatePath } from "next/cache";
import { adminAuth, adminDb } from "@/lib/firebase/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { ImageItem } from "@/components/multi-image-uploader";
import { UserProfile } from "@/schemas/profile-schema";

const USERS_COLLECTION = 'users';

function docToProfile(doc: FirebaseFirestore.DocumentSnapshot): UserProfile {
  const data = doc.data()!;
  return {
    uid: doc.id,
    fullName: data.fullName ?? null,
    email: data.email ?? null,
    role: data.role,
    banned: data.banned ?? false,
    profilePicture: data.profilePicture ? [data.profilePicture] : [],
    createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
  };
}

export async function createResident(userId: string, fullName: string, email: string) {
  const docRef = adminDb.collection(USERS_COLLECTION).doc(userId);
  await docRef.set({
    fullName,
    email,
    role: 'Resident',
    banned: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function createStaff(fullName: string, email: string, password: string, role: 'Admin' | 'Super Admin' | 'Tanod') {
  const userRecord = await adminAuth.createUser({ email, password });
  await adminAuth.setCustomUserClaims(userRecord.uid, { admin: true });
  const docRef = adminDb.collection(USERS_COLLECTION).doc(userRecord.uid);
  await docRef.set({
    fullName,
    email,
    role,
    banned: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath('/staff/user-management');
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
  const docRef = adminDb.collection(USERS_COLLECTION).doc(userId);
  const doc = await docRef.get();
  if (!doc.exists) return null;
  return docToProfile(doc);
}

export async function getAllResidents(): Promise<UserProfile[]> {
  const snapshot = await adminDb.collection(USERS_COLLECTION).where('role', '==', 'Resident').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(docToProfile);
}

export async function getAllStaff(): Promise<UserProfile[]> {
  const snapshot = await adminDb.collection(USERS_COLLECTION).where('role', 'in', ['Admin', 'Super Admin', 'Tanod']).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(docToProfile);
}

export async function banResident(userId: string): Promise<void> {
  await Promise.all([
    adminDb.collection(USERS_COLLECTION).doc(userId).update({
      banned: true,
      updatedAt: FieldValue.serverTimestamp(),
    }),
    adminAuth.updateUser(userId, { disabled: true }),
  ]);
  revalidatePath('/staff/user-management');
}

export async function unbanResident(userId: string): Promise<void> {
  await Promise.all([
    adminDb.collection(USERS_COLLECTION).doc(userId).update({
      banned: false,
      updatedAt: FieldValue.serverTimestamp(),
    }),
    adminAuth.updateUser(userId, { disabled: false }),
  ]);
  revalidatePath('/staff/user-management');
}

export async function deleteResident(userId: string): Promise<void> {
  await Promise.all([
    adminDb.collection(USERS_COLLECTION).doc(userId).delete(),
    adminAuth.deleteUser(userId),
  ]);
  revalidatePath('/staff/user-management');
}

export async function deleteUserAccount(userId: string): Promise<void> {
  await Promise.all([
    adminDb.collection(USERS_COLLECTION).doc(userId).delete(),
    adminAuth.deleteUser(userId),
  ]);
}

export async function updateUserProfile(
  userId: string,
  data: { fullName: string; profilePicture?: ImageItem }
): Promise<void> {
  await adminDb.collection(USERS_COLLECTION).doc(userId).update({
    fullName: data.fullName,
    profilePicture: data.profilePicture ?? FieldValue.delete(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath('/profile');
}

export async function deleteStaff(userId: string): Promise<void> {
  await Promise.all([
    adminDb.collection(USERS_COLLECTION).doc(userId).delete(),
    adminAuth.deleteUser(userId),
  ]);
  revalidatePath('/staff/user-management');
}
