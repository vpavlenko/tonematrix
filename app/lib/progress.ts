"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/app/lib/supabaseClient";

export type Progress = {
  user_id: string;
  page: number;
  chat_link: string | null;
  source_code: string | null;
};

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export function useUserId() {
  return useQuery({
    queryKey: ["auth", "userId"],
    queryFn: getCurrentUserId,
    staleTime: 60_000,
  });
}

export function useProgressAll() {
  return useQuery({
    queryKey: ["progress", "all"],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return [] as Progress[];
      const { data } = await supabase.from("progress").select("user_id,page,chat_link,source_code").eq("user_id", userId);
      return (data as Progress[] | null) ?? [];
    },
    staleTime: 30_000,
  });
}

export function useProgress(page: number) {
  return useQuery({
    queryKey: ["progress", page],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) return null as Progress | null;
      const { data } = await supabase
        .from("progress")
        .select("user_id,page,chat_link,source_code")
        .eq("user_id", userId)
        .eq("page", page)
        .maybeSingle();
      return (data as Progress | null) ?? null;
    },
    staleTime: 30_000,
  });
}

export function useUpsertProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Progress) => {
      await supabase.from("progress").upsert(p, { onConflict: "user_id,page" });
      return p;
    },
    onSuccess: (p) => {
      qc.setQueryData(["progress", p.page], p);
      qc.invalidateQueries({ queryKey: ["progress", "all"] });
    },
  });
}


