"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { CHAPTERS_COUNT } from "@/app/lib/chapters";
import { useAllProgressWithUsers } from "@/app/lib/progress";
import CodeBlock from "@/app/components/CodeBlock";
import GoogleSignInButton from "@/app/components/GoogleSignInButton";

type Grouped = Record<string, {
  user_id: string;
  name: string | null;
  email: string | null;
  progresses: Map<number, { page: number; chat_link: string | null; source_code: string | null }>
}>;

const TEACHER_ID = "5dbf78cf-206b-45f9-a7af-37116875bd33";

type Profile = {
  id: string;
  email?: string | null;
  name?: string | null;
  avatar_url?: string | null;
};

export default function TeacherPage() {
  const [user, setUser] = useState<Profile | null>(null);

  // Load auth on mount and track changes
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const u = data.user;
      if (u) {
        setUser({
          id: u.id,
          email: u.email,
          name: (u.user_metadata as any)?.name ?? (u.user_metadata as any)?.full_name ?? null,
          avatar_url: (u.user_metadata as any)?.avatar_url ?? null,
        });
      } else {
        setUser(null);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      if (u) {
        setUser({
          id: u.id,
          email: u.email,
          name: (u.user_metadata as any)?.name ?? (u.user_metadata as any)?.full_name ?? null,
          avatar_url: (u.user_metadata as any)?.avatar_url ?? null,
        });
      } else {
        setUser(null);
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const isTeacher = user?.id === TEACHER_ID;
  const { data, refetch } = useAllProgressWithUsers(Boolean(isTeacher));

  // Start realtime only after teacher is confirmed
  useEffect(() => {
    if (!isTeacher) return;
    const channel = supabase
      .channel("teacher-progress")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "progress" },
        () => {
          refetch();
        }
      )
      .subscribe();
    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [isTeacher, refetch]);

  const grouped: Grouped = useMemo(() => {
    const g: Grouped = {};
    for (const row of data ?? []) {
      const key = row.user_id;
      if (!g[key]) {
        g[key] = { user_id: row.user_id, name: row.name, email: row.email, progresses: new Map() };
      }
      g[key].progresses.set(row.page, { page: row.page, chat_link: row.chat_link, source_code: row.source_code });
    }
    return g;
  }, [data]);

  const students = Object.values(grouped).sort((a, b) => {
    const an = (a.name ?? a.email ?? "").toLowerCase();
    const bn = (b.name ?? b.email ?? "").toLowerCase();
    return an.localeCompare(bn);
  });

  if (!user) {
    return (
      <div className="p-6 flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>
        <div className="text-white/70">Please sign in to continue</div>
        <GoogleSignInButton />
      </div>
    );
  }

  if (!isTeacher) {
    return (
      <div className="p-6 flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>
        <div className="text-red-400">Not authorized</div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>
      <div className="flex items-center justify-between">
        <div className="text-white/70">Logged in as teacher: {user.name ?? user.email ?? user.id}</div>
        <button
          onClick={async () => { await supabase.auth.signOut(); }}
          className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 cursor-pointer"
        >
          Sign out
        </button>
      </div>
      <div className="h-px w-full bg-white/10" />

      <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
        {students.map((s) => (
          <div key={s.user_id} className="rounded-lg border border-white/10 p-4 bg-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="text-white/90 font-medium truncate">
                {s.name ?? s.email ?? s.user_id}
              </div>
              <div className="text-xs text-white/50 truncate max-w-[12rem]">{s.email}</div>
            </div>

            {/* Circular header-nav-like progress */}
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: CHAPTERS_COUNT }, (_, i) => i + 1).map((n) => {
                const has = s.progresses.has(n);
                return (
                  <div
                    key={n}
                    className={
                      "rounded-full w-8 h-8 flex items-center justify-center text-sm " +
                      (has ? "bg-green-500 text-black" : "bg-black text-white border border-white/20")
                    }
                    title={has ? `Submitted step ${n}` : `No submission for step ${n}`}
                  >
                    {n}
                  </div>
                );
              })}
            </div>

            {/* Per-step details */}
            <div className="flex flex-col gap-4">
              {Array.from(s.progresses.values())
                .filter((p) => p.page !== 14)
                .sort((a, b) => a.page - b.page)
                .map((p) => (
                  <div key={p.page} className="rounded-md border border-white/10 p-3 bg-black/40 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="text-white/80">Step {p.page}</div>
                      <div className="flex items-center gap-2">
                        {p.chat_link ? (
                          <a
                            className="px-2 py-1 rounded-md bg-white text-black hover:bg-white/90 text-xs no-underline"
                            href={p.chat_link}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open chat
                          </a>
                        ) : null}
                        {p.source_code ? (
                          <details>
                            <summary className="list-none cursor-pointer px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-xs">View code</summary>
                            <div className="mt-2">
                              <CodeBlock code={p.source_code} />
                            </div>
                          </details>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


