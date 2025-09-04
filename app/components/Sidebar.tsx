"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

type Profile = {
  id: string;
  email?: string | null;
  name?: string | null;
  avatar_url?: string | null;
};

export default function Sidebar() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;
      const u = data.user;
      if (u) {
        setUser({
          id: u.id,
          email: u.email,
          name: (u.user_metadata as any)?.name ?? (u.user_metadata as any)?.full_name ?? null,
          avatar_url: (u.user_metadata as any)?.avatar_url ?? null,
        });
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

    const onMessage = async (event: MessageEvent) => {
      if (event.data && event.data.type === "supabase-auth-complete") {
        await supabase.auth.getSession();
      }
    };
    window.addEventListener("message", onMessage);

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
      window.removeEventListener("message", onMessage);
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (data?.url) {
        const w = 500;
        const h = 600;
        const y = typeof window !== "undefined" ? window.top!.outerHeight / 2 + window.top!.screenY - h / 2 : 0;
        const x = typeof window !== "undefined" ? window.top!.outerWidth / 2 + window.top!.screenX - w / 2 : 0;
        window.open(
          data.url,
          "supabase_oauth",
          `width=${w},height=${h},left=${x},top=${y},status=no,toolbar=no,menubar=no,location=no`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <h2 className="text-xl font-semibold">Learn & Explore</h2>
      <p className="text-white/80">
        Build songs by toggling squares. Use the timeline arrow to hear patterns.
      </p>
      {user ? (
        <div className="flex items-center" style={{ gap: 12 }}>
          {user.avatar_url ? (
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar_url}
                alt={user.name ?? user.email ?? "User"}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={() => setUser((u) => (u ? { ...u, avatar_url: null } : u))}
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/10 text-white/80 grid place-items-center">
              {(user.name ?? user.email ?? "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="truncate">{user.name ?? user.email ?? "Signed in"}</div>
          </div>
          <button
            onClick={signOut}
            className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      ) : (
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-white text-black hover:bg-white/90 disabled:opacity-70 cursor-pointer"
        >
          {loading ? "Opening…" : "Continue with Google"}
        </button>
      )}

      <div className="text-sm text-white/60">
        No email confirmation required. Sign-in opens a popup and returns here.
      </div>
    </div>
  );
}


