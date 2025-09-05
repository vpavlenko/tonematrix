"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { CHAPTERS_COUNT } from "@/app/lib/chapters";
import { ExternalLink as ExternalLinkIcon, Copy, Upload } from "lucide-react";
import { ExternalLink } from "@/app/components/ExternalLink";
import HintGif from "@/app/components/HintGif";
import { useProgress, useUpsertProgress } from "@/app/lib/progress";

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
  const [shareLinkFocused, setShareLinkFocused] = useState(false);
  const isShareLinkValidPrefix =
    shareLink.startsWith("https://chatgpt.com/share/") ||
    shareLink.startsWith("https://claude.ai/share/");
  const shouldShowShareHint = (shareLinkFocused && !isShareLinkValidPrefix) || (shareLink && !isShareLinkValidPrefix);
  const sourceCodeRef = useRef<HTMLTextAreaElement | null>(null);
  const prevValidityRef = useRef<boolean>(false);
  const [showCodeHint, setShowCodeHint] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [chatLinkForPage, setChatLinkForPage] = useState<string>("");
  const { data: progress } = useProgress(currentIndex + 1);
  const upsertProgress = useUpsertProgress();

  // Fixed overlay offsets relative to right pane
  const [isClient, setIsClient] = useState(false);
  const [paneOffsets, setPaneOffsets] = useState<{ left: number; bottom: number }>({ left: 16, bottom: 16 });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const pane = document.querySelector('[data-right-pane]') as HTMLElement | null;
    if (!pane) return;

    const compute = () => {
      const rect = pane.getBoundingClientRect();
      const left = Math.max(0, rect.left) + 16;
      const bottom = Math.max(0, window.innerHeight - rect.bottom) + 16;
      setPaneOffsets({ left, bottom });
    };

    compute();
    const onResize = () => compute();
    const onScroll = () => compute();
    window.addEventListener("resize", onResize);
    // Capture scroll to catch nested scrollables
    window.addEventListener("scroll", onScroll, true);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => compute());
      ro.observe(pane);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
      ro?.disconnect();
    };
  }, [isClient]);

  useEffect(() => {
    const wasValid = prevValidityRef.current;
    const isValid = isShareLinkValidPrefix;
    if (!wasValid && isValid && shareLink) {
      // Transition invalid -> valid after paste or edit: focus source code field
      sourceCodeRef.current?.focus();
      setShareLinkFocused(false);
    }
    prevValidityRef.current = isValid;
  }, [isShareLinkValidPrefix, shareLink]);

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

  // Hydrate inputs from cached progress
  useEffect(() => {
    if (progress) {
      if (progress.chat_link) setShareLink(progress.chat_link);
      if (progress.source_code) setSourceCode(progress.source_code);
      setChatLinkForPage(progress.chat_link ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress?.chat_link, progress?.source_code]);

  // Show hint for source code when input focused and lacking key markers
  useEffect(() => {
    const lower = sourceCode.toLowerCase();
    const hasMarkers = lower.includes("import") || lower.includes("<html>");
    setShowCodeHint(!hasMarkers && (!!sourceCode || document.activeElement === sourceCodeRef.current));
  }, [sourceCode]);

  // Auto-save when contains import or <html>
  useEffect(() => {
    const lower = sourceCode.toLowerCase();
    const hasMarkers = lower.includes("import") || lower.includes("<html>");
    if (!hasMarkers) return;
    const handle = window.setTimeout(async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) return;
      upsertProgress.mutate({
        user_id: userId,
        page: currentIndex + 1,
        chat_link: shareLink || null,
        source_code: sourceCode,
      });
      setChatLinkForPage(shareLink);
    }, 500);
    return () => window.clearTimeout(handle);
  }, [sourceCode, shareLink, currentIndex]);

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
    <>
    <div className="h-full flex flex-col justify-between" style={{ gap: 16 }}>
      <div className="flex flex-col" style={{ gap: 16 }}>
        <div className="flex flex-col" style={{ gap: 6 }}>
          {currentIndex === 0 ? <><p className="text-white/80 mb-6">This is a step-by-step vibe-coding exercise. We replicate the <ExternalLink href="https://tonematrix.maxlaumeister.com/">ToneMatrix</ExternalLink> behavior.</p>
          <p>Open{" "}
            <ExternalLink href="https://chatgpt.com/">ChatGPT</ExternalLink>
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
              <div className="flex items-start" style={{ gap: 8 }}>
                <input
                  id="share-link"
                  value={shareLink}
                  onChange={(e) => setShareLink(e.target.value)}
                  onFocus={() => setShareLinkFocused(true)}
                  onBlur={() => setShareLinkFocused(false)}
                  placeholder="https://chatgpt.com/share/..."
                  aria-invalid={!!shareLink && !isShareLinkValidPrefix}
                  className={`flex-1 px-3 py-2 rounded-md bg-white/10 border placeholder:text-white/40 ${
                    shareLink
                      ? isShareLinkValidPrefix
                        ? "border-green-500"
                        : "border-red-500"
                      : "border-white/20"
                  }`}
                  autoComplete="off"
                />
                {/* Hint moved to right-pane fixed overlay */}
              </div>
            </div>
            <div className="flex flex-col" style={{ gap: 8 }}>
              <label className="text-sm text-white/80" htmlFor="source-code">Source code</label>
              <textarea
                id="source-code"
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                onFocus={() => {
                  const lower = sourceCode.toLowerCase();
                  const hasMarkers = lower.includes("import") || lower.includes("<html>");
                  setShowCodeHint(!hasMarkers);
                }}
                onBlur={() => setShowCodeHint(false)}
                placeholder="Paste your solution code here"
                rows={6}
                ref={sourceCodeRef}
                className="px-3 py-2 rounded-md bg-white/10 border border-white/20 placeholder:text-white/40 resize-y font-mono"
              />
              {/* Hint moved to right-pane fixed overlay */}
            </div>
            {chatLinkForPage || sourceCode ? (
              <div className="flex flex-col gap-2 p-2 rounded-md bg-white/5 border border-white/10">
                {chatLinkForPage ? (
                  <div className="text-sm text-white/80">
                    Chat: <ExternalLink href={chatLinkForPage}>{chatLinkForPage}</ExternalLink>
                  </div>
                ) : null}
                {sourceCode ? (
                  <div className="relative">
                    <pre className="overflow-auto max-h-48 text-xs bg-black/40 p-3 rounded-md border border-white/10">
                      {sourceCode}
                    </pre>
                    <button
                      type="button"
                      aria-label="Copy code"
                      onClick={async () => {
                        try {
                          await navigator.clipboard?.writeText(sourceCode);
                          setCopiedCode(true);
                          window.setTimeout(() => setCopiedCode(false), 1000);
                        } catch {}
                      }}
                      className="absolute top-2 right-2 inline-flex items-center justify-center px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 cursor-pointer"
                    >
                      {copiedCode ? "Copied!" : <Copy size={14} className="text-white/80" />}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
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
    {isClient && (shouldShowShareHint || showCodeHint)
      ? createPortal(
          <div
            style={{
              position: "fixed",
              left: paneOffsets.left,
              bottom: paneOffsets.bottom,
              zIndex: 50,
              pointerEvents: "none",
            }}
          >
            {shouldShowShareHint ? (
              <HintGif src="/share_button_hint.gif" alt="Share button hint" />
            ) : null}
            {showCodeHint ? (
              <div className="mt-2">
                <HintGif src="/share_code_button.gif" alt="Source code hint" />
              </div>
            ) : null}
          </div>,
          document.body
        )
      : null}
    </>
  );
}


