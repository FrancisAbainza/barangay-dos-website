'use client';

import { auth } from "@/lib/firebase/client";
import { createUserWithEmailAndPassword, onIdTokenChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { loginAction, logoutAction } from "@/actions/auth";
import { createResident } from "@/services/residents-service";

interface AuthContextType {
  user: User | null;
  loginResident: (email: string, password: string) => Promise<void>;
  loginStaff: (idNumber: string, password: string) => Promise<void>;
  signupResident: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const staffDomain = "@staff.barangay-milagrosa.local";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  /*
  If the use logs in: 
  1. Save the session cookie via server actions 
  2. Set the user in state
  3. Refresh the router to run the middleware for redirection

  If the user logs out:
  1. Delete the session cookie via server actions
  2. Then set the user in state to null
  3. Refresh the router to run the middleware for redirection
  */
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();

        // Create a session on the server
        try {
          await loginAction(token);
          setUser(user); // Set user only after session is created
        } catch (error) {
          console.error('Error creating session:', error);
          // If session creation fails, sign out to keep frontend/backend in sync
          await signOut(auth);
        }

        router.refresh(); // After session is created, refresh the router to run the middleware for redirection
      } else {
        // Destroy the session on the server FIRST before setting user to null
        try {
          await logoutAction();
        } catch (error) {
          console.error('Error destroying session - forcing reload:', error);
          window.location.href = '/'; // Force reload to rerun useEffect and destroy session on the server
        }

        // Only set user to null after confirming session was deleted
        setUser(null);
        router.refresh();
      }
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
    <AuthContext.Provider value={{ user, loginResident, loginStaff, signupResident, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}