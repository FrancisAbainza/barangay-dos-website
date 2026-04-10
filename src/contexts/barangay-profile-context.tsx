"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  getBarangayProfile,
  type BarangayProfile,
} from "@/services/about-us-service";
import type { ImageItem } from "@/components/multi-image-uploader";

interface BarangayProfileContextType {
  /** The full profile object, or null while loading. */
  profile: BarangayProfile | null;
  /** Convenience: resolved name with fallback. */
  barangayName: string;
  /** Convenience: resolved barangay logo URL. */
  barangayLogoUrl: string | null;
  /** Convenience: resolved SK logo URL. */
  skLogoUrl: string | null;
  /** Optimistically replace the cached profile. */
  updateProfile: (updated: BarangayProfile) => void;
  /** Re-fetch the profile from the server. */
  refreshBarangayProfile: () => Promise<void>;
}

const FALLBACK_NAME = "Barangay Dos";

function resolveLogoUrl(logo?: ImageItem): string | null {
  return typeof logo?.uri === "string" ? logo.uri : null;
}

const BarangayProfileContext = createContext<BarangayProfileContextType | null>(null);

export default function BarangayProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<BarangayProfile | null>(null);
  const fetchDone = useRef(false);

  const fetchProfile = useCallback(async () => {
    try {
      const p = await getBarangayProfile();
      if (p) setProfile(p);
    } catch (error) {
      console.error("Error fetching barangay profile:", error);
    }
  }, []);

  useEffect(() => {
    if (fetchDone.current) return;
    fetchDone.current = true;
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback((updated: BarangayProfile) => {
    setProfile(updated);
  }, []);

  const barangayName = profile?.name || FALLBACK_NAME;
  const barangayLogoUrl = resolveLogoUrl(profile?.barangayLogo);
  const skLogoUrl = resolveLogoUrl(profile?.skLogo);

  return (
    <BarangayProfileContext.Provider
      value={{
        profile,
        barangayName,
        barangayLogoUrl,
        skLogoUrl,
        updateProfile,
        refreshBarangayProfile: fetchProfile,
      }}
    >
      {children}
    </BarangayProfileContext.Provider>
  );
}

export const useBarangayProfile = () => {
  const context = useContext(BarangayProfileContext);
  if (!context) throw new Error("useBarangayProfile must be used within a BarangayProfileProvider");
  return context;
};
