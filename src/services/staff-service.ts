"use server";

import { adminAuth, adminDb } from "@/lib/firebase/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { StaffProfile } from "@/types/user-profile";

const STAFF_COLLECTION = 'staff';
const staffDomain = "@staff.barangay-milagrosa.local";

export async function signupStaff(idNumber: string, password: string, fullName: string) {
  const syntheticEmail = `${idNumber}${staffDomain}`;

  const userRecord = await adminAuth.createUser({
    email: syntheticEmail,
    password,
  });

  await makeStaffAdmin(userRecord.uid);
  await createStaff(userRecord.uid, fullName, idNumber);
}

export async function makeStaffAdmin(userId: string) {
  await adminAuth.setCustomUserClaims(userId, { admin: true });
}

export async function createStaff(
  userId: string,
  fullName: string,
  idNumber: string,
) {
  const docRef = adminDb.collection(STAFF_COLLECTION).doc(userId);

  // Add post data to Firestore
  const data = {
    fullName,
    idNumber,
    role: 'Super Admin',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(data);
}

export async function getStaffById(userId: string): Promise<StaffProfile | null> {
  const docRef = adminDb.collection(STAFF_COLLECTION).doc(userId);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    return null;
  }

  const data = doc.data()!;
  return {
    uid: doc.id,
    fullName: data.fullName ?? null,
    idNumber: data.idNumber ?? null,
    role: data.role,
    createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
  };
}