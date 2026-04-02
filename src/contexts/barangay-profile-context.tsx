"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getBarangayProfile } from "@/services/about-us-service";

interface BarangayProfileContextType {
  barangayName: string;
  barangayLogoUrl: string | null;
  refreshBarangayProfile: () => Promise<void>;
}

const FALLBACK_NAME = "Barangay Dos";

const BarangayProfileContext = createContext<BarangayProfileContextType | null>(null);

export default function BarangayProfileProvider({ children }: { children: React.ReactNode }) {
  const [barangayName, setBarangayName] = useState(FALLBACK_NAME);
  const [barangayLogoUrl, setBarangayLogoUrl] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const profile = await getBarangayProfile();
      if (profile) {
        setBarangayName(profile.name || FALLBACK_NAME);
        const uri = profile.barangayLogo?.uri;
        setBarangayLogoUrl(typeof uri === "string" ? uri : null);
      }
    } catch (error) {
      console.error("Error fetching barangay profile:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <BarangayProfileContext.Provider value={{ barangayName, barangayLogoUrl, refreshBarangayProfile: fetchProfile }}>
      {children}
    </BarangayProfileContext.Provider>
  );
}

export const useBarangayProfile = () => {
  const context = useContext(BarangayProfileContext);
  if (!context) throw new Error("useBarangayProfile must be used within a BarangayProfileProvider");
  return context;
};
