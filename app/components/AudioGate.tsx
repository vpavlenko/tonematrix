"use client";

import { useEffect, useState } from "react";
import { getAudioContext } from "@/app/lib/audio";
import { Play } from "lucide-react";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"
    >
      <button
        type="button"
        onClick={tryResume}
        className="w-[120px] h-[120px] rounded-full bg-white text-black flex items-center justify-center cursor-pointer shadow"
        aria-label="Play"
      >
        <Play size={48} aria-hidden />
      </button>
    </div>
  );
}


