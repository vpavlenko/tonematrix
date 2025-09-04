"use client";

import { useEffect, useRef, useState } from "react";
import { getAudioContext, playBellAt, midiToFreq as midiToFreqUtil } from "@/app/lib/audio";

export type SequencerGridOptions = {
  numRows?: number;
  numCols?: number;
  stepSeconds?: number;
  animateOnPlay?: boolean;
  isMuted?: boolean;
};

export type SequencerGridReturn = {
  numRows: number;
  numCols: number;
  position: number;
  active: boolean[][];
  setActive: React.Dispatch<React.SetStateAction<boolean[][]>>;
  flash: boolean[][];
  setFlash: React.Dispatch<React.SetStateAction<boolean[][]>>;
  frequencyForRow: (rowIndexFromBottom: number) => number;
};

export function useSequencer16x16(options: SequencerGridOptions = {}): SequencerGridReturn {
  const numCols = options.numCols ?? 16;
  const numRows = options.numRows ?? 16;
  const stepSec = options.stepSeconds ?? 0.25;
  const animateOnPlay = options.animateOnPlay ?? false;
  const isMuted = options.isMuted ?? false;

  const [position, setPosition] = useState(0);
  const [active, setActive] = useState<boolean[][]>(
    Array.from({ length: numRows }, () => Array<boolean>(numCols).fill(false))
  );
  const [flash, setFlash] = useState<boolean[][]>(
    Array.from({ length: numRows }, () => Array<boolean>(numCols).fill(false))
  );

  const activeRef = useRef(active);
  const positionRef = useRef(0);
  const nextStepTimeRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  function frequencyForRow(rowIndexFromBottom: number): number {
    const pentatonicOffsets = [0, 3, 5, 7, 10];
    const octave = Math.floor(rowIndexFromBottom / pentatonicOffsets.length);
    const degreeIndex = rowIndexFromBottom % pentatonicOffsets.length;
    const baseMidiC3 = 48; // C3
    const midi = baseMidiC3 + octave * 12 + pentatonicOffsets[degreeIndex];
    return midiToFreqUtil(midi);
  }

  useEffect(() => {
    const ctx = getAudioContext();
    nextStepTimeRef.current = ctx.currentTime + 0.05;
    const lookahead = 0.1; // seconds
    const schedulerIntervalMs = 25;

    const tick = () => {
      const now = ctx.currentTime;
      while (nextStepTimeRef.current <= now + lookahead) {
        const nextIndex = (positionRef.current + 1) % numCols;
        for (let r = 0; r < numRows; r++) {
          if (activeRef.current[r][nextIndex]) {
            const freq = frequencyForRow(r);
            if (!isMuted) {
              playBellAt(freq, nextStepTimeRef.current);
            }
            if (animateOnPlay) {
              const msUntil = Math.max(0, (nextStepTimeRef.current - now) * 1000);
              window.setTimeout(() => {
                setFlash((prev) => {
                  const next = prev.map((row) => row.slice());
                  next[r][nextIndex] = true;
                  return next;
                });
                window.setTimeout(() => {
                  setFlash((prev) => {
                    const next = prev.map((row) => row.slice());
                    next[r][nextIndex] = false;
                    return next;
                  });
                }, 150);
              }, msUntil);
            }
          }
        }
        positionRef.current = nextIndex;
        nextStepTimeRef.current += stepSec;
        setPosition(positionRef.current);
      }
    };

    intervalRef.current = window.setInterval(tick, schedulerIntervalMs);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [numCols, numRows, stepSec, isMuted, animateOnPlay]);

  return {
    numRows,
    numCols,
    position,
    active,
    setActive,
    flash,
    setFlash,
    frequencyForRow,
  };
}


