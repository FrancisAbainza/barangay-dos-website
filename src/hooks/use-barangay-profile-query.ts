"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBarangayProfile,
  updateBarangayHeader,
} from "@/services/about-us-service";
import type { ImageItem, BarangayProfile } from "@/types";
import { useMemo } from "react";

// ── Query Keys ─────────────────────────────────────────────────

export const barangayProfileKeys = {
  all: ["barangayProfile"] as const,
};

// ── Helpers ────────────────────────────────────────────────────

const FALLBACK_NAME = "Barangay Dos";

function resolveLogoUrl(logo?: ImageItem): string | null {
  return logo?.uri ?? null;
}

// ── Query Hook ─────────────────────────────────────────────────

export function useBarangayProfile() {
  const { data: profile, isLoading } = useQuery({
    queryKey: barangayProfileKeys.all,
    queryFn: getBarangayProfile,
    staleTime: 5 * 60 * 1000,
  });

  return {
    profile: profile ?? null,
    barangayName: profile?.name || FALLBACK_NAME,
    barangayLogoUrl: resolveLogoUrl(profile?.barangayLogo),
    skLogoUrl: resolveLogoUrl(profile?.skLogo),
    isLoading,
  };
}

// ── Update Header Mutation ─────────────────────────────────────

export function useUpdateBarangayHeader() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      address: string;
      tagline: string;
      barangayLogo?: ImageItem;
      skLogo?: ImageItem;
    }) => updateBarangayHeader(data),
    onSuccess: (_, data) => {
      queryClient.setQueryData<BarangayProfile>(barangayProfileKeys.all, {
        name: data.name,
        address: data.address,
        tagline: data.tagline,
        barangayLogo: data.barangayLogo,
        skLogo: data.skLogo,
      });
    },
  });
}
