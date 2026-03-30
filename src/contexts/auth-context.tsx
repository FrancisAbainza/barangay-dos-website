'use client';

import { auth } from "@/lib/firebase/client";
import { createUserWithEmailAndPassword, onIdTokenChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { loginAction, logoutAction, checkIsAdminAction } from "@/actions/auth";
import { createResident, getUserById } from "@/services/user-service";
import { UserProfile } from "@/schemas/profile-schema";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loginResident: (email: string, password: string) => Promise<void>;
  loginStaff: (email: string, password: string) => Promise<void>;
  signupResident: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  /*
  If the user logs in: 
  1. Save the session cookie via server actions 
  2. Set the user in state
  3. Fetch and set the user profile in state
  4. Refresh the router to run the middleware for redirection

  If the user logs out:
  1. Delete the session cookie via server actions
  2. Then set the user in state to null
  3. Refresh the router to run the middleware for redirection
  */
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      console.log("Auth state changed. User:", user);
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult();
          await loginAction(tokenResult.token); // Create a session on the server

          // Fetch the user profile based on admin claim
          const isAdmin = tokenResult.claims.admin === true;
          const profile = await getUserById(user.uid, isAdmin);

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
    const isAdmin = await checkIsAdminAction(email);
    if (isAdmin === true) throw new Error('This is a staff account. Please use the staff login.');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginStaff = async (email: string, password: string) => {
    const isAdmin = await checkIsAdminAction(email);
    if (isAdmin === false) throw new Error('This is a resident account. Please use the resident login.');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signupResident = async (fullName: string, email: string, password: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await createResident(user.uid, fullName, email);
  };

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