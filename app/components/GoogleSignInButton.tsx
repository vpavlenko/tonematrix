"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

type GoogleSignInButtonProps = {
  label?: string;
  className?: string;
};

export default function GoogleSignInButton({ label = "Continue with Google", className = "inline-flex items-center justify-center px-4 py-2 rounded-md bg-white text-black hover:bg-white/90 disabled:opacity-70 cursor-pointer" }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

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

  return (
    <button onClick={signInWithGoogle} disabled={loading} className={className}>
      {loading ? "Opening…" : label}
    </button>
  );
}


