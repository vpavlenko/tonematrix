"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { CHAPTERS_COUNT } from "@/app/lib/chapters";
import { ExternalLink, Copy } from "lucide-react";

type Profile = {
  id: string;
  email?: string | null;
  name?: string | null;
  avatar_url?: string | null;
};

export default function Sidebar() {
  const params = useParams<{ id: string }>();
  const currentId = params?.id ?? "1";
  const currentIndex = useMemo(() => {
    const n = Number.parseInt(String(currentId), 10);
    return Number.isFinite(n) ? n - 1 : 0;
  }, [currentId]);

  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [sourceCode, setSourceCode] = useState("");
  const promptText = "Using React, make a single gray square in the center of the black background screen";

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
    <div className="h-full flex flex-col justify-between" style={{ gap: 16 }}>
      <div className="flex flex-col" style={{ gap: 16 }}>
        <div className="flex flex-col" style={{ gap: 6 }}>
          <p className="text-white/80 mb-6">This is a step-by-step vibe-coding exercise. We replicate the <a href="https://tonematrix.maxlaumeister.com/" target="_blank" rel="noopener noreferrer" style={{ color: "white",fontWeight: "bold", display: "inline-flex", gap: 4 }}>ToneMatrix <ExternalLink size={20} /></a> behavior.</p>
          {currentIndex === 0 ? <>
          <p>Open{" "}
            <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer" style={{ color: "white",fontWeight: "bold", display: "inline-flex", gap: 4 }}>ChatGPT <ExternalLink size={20} /></a>
             and ask:</p>
             <blockquote className="relative text-white/90 bg-white/5 border border-white/10 rounded-md p-4">
              <span>Using React, make a single gray square in the center of the black background screen</span>
              <button
                type="button"
                aria-label="Copy prompt"
                onClick={() => navigator.clipboard?.writeText(promptText)}
                className="absolute bottom-2 right-2 inline-flex items-center justify-center p-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 cursor-pointer"
              >
                <Copy size={16} className="text-white/80" />
              </button>
            </blockquote></>
            
           : (
            <p className="text-white/80">
              At each step, your goal is to find what's new in the behavior on the right and ask ChatGPT to make those changes. Amend prompts to the single chat unless you got stuck.
            </p>
          )}

        </div>
        <div className="h-px w-full bg-white/10" />
      </div>

      <div className="flex flex-col" style={{ gap: 12 }}>
        {user ? (
          <>
            <div className="text-sm text-white/80">Submit your solution for page {currentIndex + 1}</div>
            <div className="flex flex-col" style={{ gap: 8 }}>
              <label className="text-sm text-white/80" htmlFor="share-link">Chat link</label>
              <input
                id="share-link"
                value={shareLink}
                onChange={(e) => setShareLink(e.target.value)}
                placeholder="https://chatgpt.com/share/..."
                className="px-3 py-2 rounded-md bg-white/10 border border-white/20 placeholder:text-white/40"
              />
              {shareLink && !shareLink.startsWith("https://chatgpt.com/share/") ? (
                <div className="text-xs text-red-400">Link must start with https://chatgpt.com/share/</div>
              ) : null}
            </div>
            <div className="flex flex-col" style={{ gap: 8 }}>
              <label className="text-sm text-white/80" htmlFor="source-code">Source code</label>
              <textarea
                id="source-code"
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                placeholder="Paste your solution code here"
                rows={6}
                className="px-3 py-2 rounded-md bg-white/10 border border-white/20 placeholder:text-white/40 resize-y"
              />
            </div>
            <div className="flex items-center justify-between" style={{ gap: 12 }}>
              <div className="flex items-center min-w-0" style={{ gap: 12 }}>
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
                <div className="truncate text-white/70 text-sm">
                  {user.name ?? user.email ?? "Signed in"}
                </div>
              </div>
              <button
                onClick={signOut}
                className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 cursor-pointer"
              >
                Sign out
              </button>
            </div>
          </>
        ) : (
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-white text-black hover:bg-white/90 disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Opening…" : "Continue with Google"}
            </button>
        )}
      </div>
    </div>
  );
}


