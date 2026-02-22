"use server";

import { adminAuth, adminDb } from "@/lib/firebase/server";
import { FieldValue } from "firebase-admin/firestore";

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
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(data);
}

