"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getOfficials, type Official } from "@/services/about-us-service";
import type { OfficialType } from "@/schemas/about-us-schema";

interface AboutUsContextType {
  barangayOfficials: Official[];
  skOfficials: Official[];
  addOfficial: (type: OfficialType, official: Official) => void;
  updateOfficial: (
    type: OfficialType,
    id: string,
    updated: Partial<Official>,
  ) => void;
  removeOfficial: (type: OfficialType, id: string) => void;
}

const AboutUsContext = createContext<AboutUsContextType | null>(null);

export function AboutUsProvider({ children }: { children: React.ReactNode }) {
  const [barangayOfficials, setBarangayOfficials] = useState<Official[]>([]);
  const [skOfficials, setSkOfficials] = useState<Official[]>([]);
  const fetchDone = useRef(false);

  useEffect(() => {
    if (fetchDone.current) return;
    fetchDone.current = true;
    Promise.all([getOfficials("barangay"), getOfficials("sk")]).then(
      ([b, s]) => {
        setBarangayOfficials(b);
        setSkOfficials(s);
      },
    );
  }, []);

  const setter = useCallback(
    (type: OfficialType) =>
      type === "barangay" ? setBarangayOfficials : setSkOfficials,
    [],
  );

  const addOfficialToState = useCallback(
    (type: OfficialType, official: Official) => {
      setter(type)((prev) => [...prev, official]);
    },
    [setter],
  );

  const updateOfficialInState = useCallback(
    (type: OfficialType, id: string, updated: Partial<Official>) => {
      setter(type)((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...updated } : o)),
      );
    },
    [setter],
  );

  const removeOfficialFromState = useCallback(
    (type: OfficialType, id: string) => {
      setter(type)((prev) => prev.filter((o) => o.id !== id));
    },
    [setter],
  );

  return (
    <AboutUsContext.Provider
      value={{
        barangayOfficials,
        skOfficials,
        addOfficial: addOfficialToState,
        updateOfficial: updateOfficialInState,
        removeOfficial: removeOfficialFromState,
      }}
    >
      {children}
    </AboutUsContext.Provider>
  );
}

export const useAboutUs = () => {
  const context = useContext(AboutUsContext);
  if (!context)
    throw new Error("useAboutUs must be used within an AboutUsProvider");
  return context;
};
