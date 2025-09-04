"use client";

import { useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function AuthCallbackPage() {
  useEffect(() => {
    let closed = false;
    const handle = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        // Notify the opener (main app window) that auth completed
        if (window.opener) {
          window.opener.postMessage({ type: "supabase-auth-complete", payload: data }, "*");
        }
      } catch {
        // ignore
      } finally {
        if (!closed) {
          closed = true;
          window.close();
          // If the popup couldn't close (e.g., opened in same tab), navigate home
          setTimeout(() => {
            if (!window.closed) {
              window.location.replace("/");
            }
          }, 200);
        }
      }
    };
    handle();
  }, []);

  return (
    <main className="h-screen flex items-center justify-center">
      <div className="text-white/80">Completing sign-in… You can close this window.</div>
    </main>
  );
}


