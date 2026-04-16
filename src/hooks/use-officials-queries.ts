"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getOfficials,
  addOfficial,
  updateOfficial,
  deleteOfficial,
} from "@/services/about-us-service";
import type { Official, ImageItem, OfficialType } from "@/types/about-us";

// ── Query Keys ─────────────────────────────────────────────────

export const officialsKeys = {
  all: ["officials"] as const,
  list: (type: OfficialType) => [...officialsKeys.all, type] as const,
};

// ── Query Hooks ────────────────────────────────────────────────

export function useOfficials(type: OfficialType) {
  return useQuery({
    queryKey: officialsKeys.list(type),
    queryFn: () => getOfficials(type),
  });
}

// ── Add Official Mutation ──────────────────────────────────────

export function useAddOfficial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      type,
      data,
    }: {
      type: OfficialType;
      data: { fullName: string; role: string; picture?: ImageItem };
    }) => addOfficial(type, data),
    onSuccess: (docId, { type, data }) => {
      queryClient.setQueryData<Official[]>(officialsKeys.list(type), (old) => [
        ...(old ?? []),
        { id: docId, fullName: data.fullName, role: data.role, picture: data.picture },
      ]);
    },
  });
}

// ── Update Official Mutation ───────────────────────────────────

export function useUpdateOfficial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      type,
      id,
      data,
    }: {
      type: OfficialType;
      id: string;
      data: { fullName: string; role: string; picture?: ImageItem };
    }) => updateOfficial(type, id, data),
    onSuccess: (_, { type, id, data }) => {
      queryClient.setQueryData<Official[]>(officialsKeys.list(type), (old) =>
        old?.map((o) =>
          o.id === id
            ? { ...o, fullName: data.fullName, role: data.role, picture: data.picture }
            : o,
        ),
      );
    },
  });
}

// ── Delete Official Mutation (Optimistic) ──────────────────────

export function useDeleteOfficial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, id }: { type: OfficialType; id: string }) =>
      deleteOfficial(type, id),
    onMutate: async ({ type, id }) => {
      await queryClient.cancelQueries({ queryKey: officialsKeys.list(type) });
      const prev = queryClient.getQueryData<Official[]>(
        officialsKeys.list(type),
      );
      queryClient.setQueryData<Official[]>(officialsKeys.list(type), (old) =>
        old?.filter((o) => o.id !== id),
      );
      return { prev, type };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(
          officialsKeys.list(context.type),
          context.prev,
        );
      }
    },
  });
}
