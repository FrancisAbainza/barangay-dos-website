"use server";

import { adminAuth } from "@/lib/firebase/server";
import { cookies } from "next/headers";

/// Logs in the user by creating a session cookie and setting it in the browser.
export async function loginAction(idToken: string) {
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

  (await cookies()).set("__session", sessionCookie, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: true,
    path: "/",
  });
}

export async function logoutAction() {
  (await cookies()).set("__session", "", {
    maxAge: -1,
    path: "/",
  });
}

/// Returns true/false based on the admin claim, or null if the user doesn't exist.
export async function checkIsAdminAction(email: string): Promise<boolean | null> {
  try {
    const userRecord = await adminAuth.getUserByEmail(email);
    return userRecord.customClaims?.admin === true;
  } catch {
    return null;
  }
}