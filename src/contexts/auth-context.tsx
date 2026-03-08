'use client';

import { auth } from "@/lib/firebase/client";
import { createUserWithEmailAndPassword, onIdTokenChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { loginAction, logoutAction } from "@/actions/auth";
import { createResident, getResidentById } from "@/services/residents-service";
import { ResidentProfile, StaffProfile } from "@/types/user-profile";
import { getStaffById } from "@/services/staff-service";

interface AuthContextType {
  user: User | null;
  userProfile: ResidentProfile | StaffProfile | null;
  loginResident: (email: string, password: string) => Promise<void>;
  loginStaff: (idNumber: string, password: string) => Promise<void>;
  signupResident: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const staffDomain = "@staff.barangay-milagrosa.local";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<ResidentProfile | StaffProfile | null>(null);
  const router = useRouter();

  /*
  If the resident logs in: 
  1. Save the session cookie via server actions 
  2. Set the user in state
  3. Refresh the router to run the middleware for redirection

  If the resident or staff logs out:
  1. Delete the session cookie via server actions
  2. Then set the user in state to null
  3. Refresh the router to run the middleware for redirection
  */
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult();
          await loginAction(tokenResult.token); // Create a session on the server

          // Fetch the user profile based on admin claim
          const isAdmin = tokenResult.claims.admin === true;
          const profile = isAdmin
            ? await getStaffById(user.uid)
            : await getResidentById(user.uid);

          // Set user and profile together after everything succeeds
          setUser(user);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error during login flow:', error);
          // Sign out to keep frontend/backend in sync
          await signOut(auth);
        }
      } else {
        try {
          await logoutAction(); // Destroy the session on the server
          setUser(null);
          setUserProfile(null);
        } catch (error) {
          console.error('Error destroying session - forcing reload:', error);
          window.location.href = '/'; // Force reload to rerun useEffect and destroy session on the server
        }
      }

      router.refresh(); // After session is created or destroyed, refresh the router to run the middleware for redirection
    });

    return () => unsubscribe();
  }, [router]);

  const loginResident = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }

  const loginStaff = async (idNumber: string, password: string) => {
    const syntheticEmail = `${idNumber}${staffDomain}`;
    await signInWithEmailAndPassword(auth, syntheticEmail, password);
  }

  const signupResident = async (email: string, password: string, fullName: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await createResident(user.uid, fullName, email);
  }

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loginResident, loginStaff, signupResident, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}