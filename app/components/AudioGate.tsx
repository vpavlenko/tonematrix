"use client";

import { useEffect, useState } from "react";
import { getAudioContext } from "@/app/lib/audio";

export default function AudioGate() {
  const [needsUnlock, setNeedsUnlock] = useState(false);

  useEffect(() => {
    try {
      const ctx = getAudioContext();
      setNeedsUnlock(ctx.state !== "running");
    } catch {
      // ignore if not in browser
    }
  }, []);

  useEffect(() => {
    if (!needsUnlock) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        void tryResume();
      }
    };
    window.addEventListener("keydown", handleKey, { capture: true });
    return () => window.removeEventListener("keydown", handleKey, { capture: true } as any);
  }, [needsUnlock]);

  async function tryResume() {
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      if (ctx.state === "running") {
        setNeedsUnlock(false);
      }
    } catch {
      // no-op
    }
  }

  if (!needsUnlock) return null;

  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <button
        onClick={tryResume}
        className="px-6 py-3 rounded-md bg-white text-black text-lg font-medium cursor-pointer shadow"
        aria-label="Play"
      >
        Play
      </button>
    </div>
  );
}


