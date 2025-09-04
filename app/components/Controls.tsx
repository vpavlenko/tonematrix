"use client";

import { Volume2, VolumeX } from "lucide-react";

export function MuteButton({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={muted ? "Unmute" : "Mute"}
      className="p-0 bg-transparent hover:opacity-80"
    >
      {muted ? <VolumeX size={36} /> : <Volume2 size={36} />}
    </button>
  );
}

export function ClearButton({ onClear, label = "Clear Notes" }: { onClear: () => void; label?: string }) {
  return (
    <button
      onClick={onClear}
      className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/20"
    >
      {label}
    </button>
  );
}


