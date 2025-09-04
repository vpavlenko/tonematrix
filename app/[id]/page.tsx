"use client";

import { use, useState, useEffect, useRef } from "react";
import { getAudioContext, playBellAt, playBell, playBellC5, midiToFreq } from "@/app/lib/audio";
import { useSequencer16x16 } from "@/app/lib/sequencer";
import { Volume2, VolumeX, Copy as CopyIcon } from "lucide-react";
import { MuteButton, ClearButton } from "@/app/components/Controls";
import SequencerGrid from "@/app/components/SequencerGrid";

type PageProps = { params: Promise<{ id: string }> };

// Audio helpers are centralized in app/lib/audio

export default function SubPage({ params }: PageProps) {
  const { id } = use(params);
  const chapters = [
    Page1,
    Page2,
    HoverPersist,
    HoverRevert,
    ClickToggle,
    ClickToggleWithSound,
    ClickToggleWithSoundAndArrow,
    MovingArrowOverSquares,
    SequencerAutoPlay,
    SequencerTwoRows,
    SequencerTwoRowsWithClear,
    () => <SequencerGrid16x16 />,
    () => <SequencerGrid16x16 animateOnPlay />,
    () => <SequencerGrid16x16WithMute animateOnPlay />,
    () => <SequencerGrid16x16WithShare animateOnPlay />,
  ];
  const index = Number.parseInt(id, 10) - 1;
  const Component = chapters[index];
  if (!Component) {
    return (
      <main className="h-full flex items-center justify-center">
        <p>Page {id}</p>
      </main>
    );
  }
  return <Component />;
}

function Page1() {
  return (
    <main className="h-full flex items-center justify-center">
      <div className="w-[60px] h-[60px] bg-[var(--gray)]" />
    </main>
  );
}

function Page2() {
  return (
    <main className="h-full flex items-center justify-center">
      <div className="flex gap-[15px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-[60px] h-[60px] bg-[var(--gray)]" />
        ))}
      </div>
    </main>
  );
}

function ClickToggleWithSoundAndArrow() {
  const [active, setActive] = useState<boolean[]>(Array(8).fill(false));
  const squareSize = 60; // px
  const gap = 15; // px

  return (
    <main className="h-full flex items-center justify-center">
      <div className="flex flex-col items-start" style={{ gap }}>
        <div className="relative h-[30px] w-[60px] flex items-center justify-center ml-0">
          <div
            aria-hidden
            className="w-0 h-0 border-l-[10px] border-r-[10px] border-l-transparent border-r-transparent border-t-[14px] border-t-white"
          />
        </div>
        <div className="flex" style={{ gap }}>
          {active.map((isOn, idx) => (
            <div key={idx} className="relative group" style={{ width: squareSize, height: squareSize }}>
              <div
                className={isOn ? "bg-white" : "bg-[var(--gray)] group-hover:bg-[var(--lightgray)]"}
                style={
                  isOn
                    ? { width: "100%", height: "100%", boxShadow: "0 0 2px 2px white" }
                    : { width: "100%", height: "100%" }
                }
              />
              <div
                aria-hidden
                onClick={() => {
                  setActive((prev) => {
                    const next = [...prev];
                    next[idx] = !next[idx];
                    return next;
                  });
                  playBellC5();
                }}
                className="absolute cursor-pointer"
                style={{ top: -(gap / 2), left: -(gap / 2), right: -(gap / 2), bottom: -(gap / 2) }}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function HoverPersist() {
  const [active, setActive] = useState<boolean[]>(Array(8).fill(false));
  return (
    <main className="h-full flex items-center justify-center">
      <div className="flex gap-[15px]">
        {active.map((isOn, idx) => (
          <div
            key={idx}
            onMouseEnter={() => {
              if (!isOn) {
                setActive((prev) => {
                  const next = [...prev];
                  next[idx] = true;
                  return next;
                });
              }
            }}
            className={isOn ? "w-[60px] h-[60px] bg-[var(--lightgray)]" : "w-[60px] h-[60px] bg-[var(--gray)]"}
          />
        ))}
      </div>
    </main>
  );
}

function HoverRevert() {
  return (
    <main className="h-full flex items-center justify-center">
      <div className="flex gap-[15px]">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="w-[60px] h-[60px] bg-[var(--gray)] hover:bg-[var(--lightgray)]"
          />
        ))}
      </div>
    </main>
  );
}

function ClickToggle() {
  const [active, setActive] = useState<boolean[]>(Array(8).fill(false));
  const squareSize = 60; // px
  const gap = 15; // px
  return (
    <main className="h-full flex items-center justify-center">
      <div className="flex" style={{ gap }}>
        {active.map((isOn, idx) => (
          <div key={idx} className="relative group" style={{ width: squareSize, height: squareSize }}>
            <div
              className={isOn ? "bg-white" : "bg-[var(--gray)] group-hover:bg-[var(--lightgray)]"}
              style={
                isOn
                  ? { width: "100%", height: "100%", boxShadow: "0 0 2px 2px white" }
                  : { width: "100%", height: "100%" }
              }
            />
            <div
              aria-hidden
              onClick={() =>
                setActive((prev) => {
                  const next = [...prev];
                  next[idx] = !next[idx];
                  return next;
                })
              }
              className="absolute cursor-pointer"
              style={{ top: -(gap / 2), left: -(gap / 2), right: -(gap / 2), bottom: -(gap / 2) }}
            />
          </div>
        ))}
      </div>
    </main>
  );
}

function ClickToggleWithSound() {
  const [active, setActive] = useState<boolean[]>(Array(8).fill(false));
  const squareSize = 60; // px
  const gap = 15; // px

  return (
    <main className="h-full flex items-center justify-center">
      <div className="flex" style={{ gap }}>
        {active.map((isOn, idx) => (
          <div key={idx} className="relative group" style={{ width: squareSize, height: squareSize }}>
            <div
              className={isOn ? "bg-white" : "bg-[var(--gray)] group-hover:bg-[var(--lightgray)]"}
              style={
                isOn
                  ? { width: "100%", height: "100%", boxShadow: "0 0 2px 2px white" }
                  : { width: "100%", height: "100%" }
              }
            />
            <div
              aria-hidden
              onClick={() => {
                setActive((prev) => {
                  const next = [...prev];
                  next[idx] = !next[idx];
                  return next;
                });
                playBellC5();
              }}
              className="absolute cursor-pointer"
              style={{ top: -(gap / 2), left: -(gap / 2), right: -(gap / 2), bottom: -(gap / 2) }}
            />
          </div>
        ))}
      </div>
    </main>
  );
}

function MovingArrowOverSquares() {
  const numSquares = 8;
  const squareSize = 60; // px
  const gap = 15; // px
  const totalWidth = numSquares * squareSize + (numSquares - 1) * gap;
  const [position, setPosition] = useState(0);
  const [active, setActive] = useState<boolean[]>(Array(numSquares).fill(false));

  useEffect(() => {
    const id = setInterval(() => {
      setPosition((prev) => (prev + 1) % numSquares);
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="h-full flex items-center justify-center">
      <div className="flex flex-col items-start" style={{ gap: 15 }}>
        <div className="relative h-[30px]" style={{ width: totalWidth }}>
          <div
            aria-hidden
            className="w-0 h-0 border-l-[10px] border-r-[10px] border-l-transparent border-r-transparent border-t-[14px] border-t-white absolute top-1/2 -translate-y-1/2"
            style={{ left: position * (squareSize + gap) + squareSize / 2 - 10 }}
          />
        </div>
        <div className="flex" style={{ gap }}>
          {active.map((isOn, idx) => (
            <div key={idx} className="relative group" style={{ width: squareSize, height: squareSize }}>
              <div
                className={isOn ? "bg-white" : "bg-[var(--gray)] group-hover:bg-[var(--lightgray)]"}
                style={
                  isOn
                    ? { width: "100%", height: "100%", boxShadow: "0 0 2px 2px white" }
                    : { width: "100%", height: "100%" }
                }
              />
              <div
                aria-hidden
                onClick={() => {
                  setActive((prev) => {
                    const next = [...prev];
                    next[idx] = !next[idx];
                    return next;
                  });
                  playBellC5();
                }}
                className="absolute cursor-pointer"
                style={{ top: -(gap / 2), left: -(gap / 2), right: -(gap / 2), bottom: -(gap / 2) }}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function SequencerAutoPlay() {
  const numSquares = 8;
  const squareSize = 60; // px
  const gap = 15; // px
  const totalWidth = numSquares * squareSize + (numSquares - 1) * gap;
  const [position, setPosition] = useState(0);
  const [active, setActive] = useState<boolean[]>(Array(numSquares).fill(false));
  const activeRef = useRef(active);
  const positionRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const nextStepTimeRef = useRef<number>(0);
  const stepSec = 0.5;

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const ctx = getAudioContext();
    nextStepTimeRef.current = ctx.currentTime + 0.05;
    const lookahead = 0.1; // seconds
    const schedulerIntervalMs = 25;

    const tick = () => {
      const now = ctx.currentTime;
      while (nextStepTimeRef.current <= now + lookahead) {
        const nextIndex = (positionRef.current + 1) % numSquares;
        if (activeRef.current[nextIndex]) {
          playBellAt(523.25, nextStepTimeRef.current);
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
  }, []);

  return (
    <main className="h-full flex items-center justify-center">
      <div className="flex flex-col items-start" style={{ gap: 15 }}>
        <div className="relative h-[30px]" style={{ width: totalWidth }}>
          <div
            aria-hidden
            className="w-0 h-0 border-l-[10px] border-r-[10px] border-l-transparent border-r-transparent border-t-[14px] border-t-white absolute top-1/2 -translate-y-1/2"
            style={{ left: position * (squareSize + gap) + squareSize / 2 - 10 }}
          />
        </div>
        <div className="flex" style={{ gap }}>
          {active.map((isOn, idx) => (
            <div key={idx} className="relative group" style={{ width: squareSize, height: squareSize }}>
              <div
                className={isOn ? "bg-white" : "bg-[var(--gray)] group-hover:bg-[var(--lightgray)]"}
                style={
                  isOn
                    ? { width: "100%", height: "100%", boxShadow: "0 0 2px 2px white" }
                    : { width: "100%", height: "100%" }
                }
              />
              <div
                aria-hidden
                onClick={() => {
                  setActive((prev) => {
                    const next = [...prev];
                    next[idx] = !next[idx];
                    return next;
                  });
                }}
                className="absolute cursor-pointer"
                style={{ top: -(gap / 2), left: -(gap / 2), right: -(gap / 2), bottom: -(gap / 2) }}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function SequencerTwoRows() {
  const numSquares = 8;
  const squareSize = 60; // px
  const gap = 15; // px
  const totalWidth = numSquares * squareSize + (numSquares - 1) * gap;
  const [position, setPosition] = useState(0);
  const [row1Active, setRow1Active] = useState<boolean[]>(Array(numSquares).fill(false));
  const [row2Active, setRow2Active] = useState<boolean[]>(Array(numSquares).fill(false));
  const row1Ref = useRef(row1Active);
  const row2Ref = useRef(row2Active);
  const positionRef = useRef(0);
  const nextStepTimeRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const stepSec = 0.5;

  useEffect(() => {
    row1Ref.current = row1Active;
  }, [row1Active]);
  useEffect(() => {
    row2Ref.current = row2Active;
  }, [row2Active]);

  useEffect(() => {
    const ctx = getAudioContext();
    nextStepTimeRef.current = ctx.currentTime + 0.05;
    const lookahead = 0.1; // seconds
    const schedulerIntervalMs = 25;

    const tick = () => {
      const now = ctx.currentTime;
      while (nextStepTimeRef.current <= now + lookahead) {
        const nextIndex = (positionRef.current + 1) % numSquares;
        if (row1Ref.current[nextIndex]) {
          playBellAt(523.25, nextStepTimeRef.current);
        }
        if (row2Ref.current[nextIndex]) {
          playBellAt(196.0, nextStepTimeRef.current);
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
  }, []);

  return (
    <main className="h-full flex items-center justify-center">
      <div className="flex flex-col items-start" style={{ gap: 15 }}>
        <div className="relative h-[30px]" style={{ width: totalWidth }}>
          <div
            aria-hidden
            className="w-0 h-0 border-l-[10px] border-r-[10px] border-l-transparent border-r-transparent border-t-[14px] border-t-white absolute top-1/2 -translate-y-1/2"
            style={{ left: position * (squareSize + gap) + squareSize / 2 - 10 }}
          />
        </div>
        <div className="flex flex-col" style={{ gap }}>
          <div className="flex" style={{ gap }}>
            {row1Active.map((isOn, idx) => (
              <div key={idx} className="relative group" style={{ width: squareSize, height: squareSize }}>
                <div
                  className={isOn ? "bg-white" : "bg-[var(--gray)] group-hover:bg-[var(--lightgray)]"}
                  style={
                    isOn
                      ? { width: "100%", height: "100%", boxShadow: "0 0 2px 2px white" }
                      : { width: "100%", height: "100%" }
                  }
                />
                <div
                  aria-hidden
                  onClick={() => {
                    setRow1Active((prev) => {
                      const next = [...prev];
                      next[idx] = !next[idx];
                      return next;
                    });
                  }}
                  className="absolute cursor-pointer"
                  style={{ top: -(gap / 2), left: -(gap / 2), right: -(gap / 2), bottom: -(gap / 2) }}
                />
              </div>
            ))}
          </div>
          <div className="flex" style={{ gap }}>
            {row2Active.map((isOn, idx) => (
              <div key={idx} className="relative group" style={{ width: squareSize, height: squareSize }}>
                <div
                  className={isOn ? "bg-white" : "bg-[var(--gray)] group-hover:bg-[var(--lightgray)]"}
                  style={
                    isOn
                      ? { width: "100%", height: "100%", boxShadow: "0 0 2px 2px white" }
                      : { width: "100%", height: "100%" }
                  }
                />
                <div
                  aria-hidden
                  onClick={() => {
                    setRow2Active((prev) => {
                      const next = [...prev];
                      next[idx] = !next[idx];
                      return next;
                    });
                  }}
                  className="absolute cursor-pointer"
                  style={{ top: -(gap / 2), left: -(gap / 2), right: -(gap / 2), bottom: -(gap / 2) }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function SequencerTwoRowsWithClear() {
  const numSquares = 8;
  const squareSize = 60; // px
  const gap = 15; // px
  const totalWidth = numSquares * squareSize + (numSquares - 1) * gap;
  const [position, setPosition] = useState(0);
  const [row1Active, setRow1Active] = useState<boolean[]>(Array(numSquares).fill(false));
  const [row2Active, setRow2Active] = useState<boolean[]>(Array(numSquares).fill(false));
  const row1Ref = useRef(row1Active);
  const row2Ref = useRef(row2Active);
  const positionRef = useRef(0);
  const nextStepTimeRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const stepSec = 0.5;

  useEffect(() => {
    row1Ref.current = row1Active;
  }, [row1Active]);
  useEffect(() => {
    row2Ref.current = row2Active;
  }, [row2Active]);

  useEffect(() => {
    const ctx = getAudioContext();
    nextStepTimeRef.current = ctx.currentTime + 0.05;
    const lookahead = 0.1; // seconds
    const schedulerIntervalMs = 25;

    const tick = () => {
      const now = ctx.currentTime;
      while (nextStepTimeRef.current <= now + lookahead) {
        const nextIndex = (positionRef.current + 1) % numSquares;
        if (row1Ref.current[nextIndex]) {
          playBellAt(523.25, nextStepTimeRef.current);
        }
        if (row2Ref.current[nextIndex]) {
          playBellAt(196.0, nextStepTimeRef.current);
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
  }, []);

  return (
    <main className="h-full flex items-center justify-center">
      <div className="flex flex-col items-start" style={{ gap: 15 }}>
        <div className="relative h-[30px]" style={{ width: totalWidth }}>
          <div
            aria-hidden
            className="w-0 h-0 border-l-[10px] border-r-[10px] border-l-transparent border-r-transparent border-t-[14px] border-t-white absolute top-1/2 -translate-y-1/2"
            style={{ left: position * (squareSize + gap) + squareSize / 2 - 10 }}
          />
        </div>
        <div className="flex flex-col" style={{ gap }}>
          <div className="flex" style={{ gap }}>
            {row1Active.map((isOn, idx) => (
              <div key={idx} className="relative group" style={{ width: squareSize, height: squareSize }}>
                <div
                  className={isOn ? "bg-white" : "bg-[var(--gray)] group-hover:bg-[var(--lightgray)]"}
                  style={
                    isOn
                      ? { width: "100%", height: "100%", boxShadow: "0 0 2px 2px white" }
                      : { width: "100%", height: "100%" }
                  }
                />
                <div
                  aria-hidden
                  onClick={() => {
                    setRow1Active((prev) => {
                      const next = [...prev];
                      next[idx] = !next[idx];
                      return next;
                    });
                  }}
                  className="absolute cursor-pointer"
                  style={{ top: -(gap / 2), left: -(gap / 2), right: -(gap / 2), bottom: -(gap / 2) }}
                />
              </div>
            ))}
          </div>
          <div className="flex" style={{ gap }}>
            {row2Active.map((isOn, idx) => (
              <div key={idx} className="relative group" style={{ width: squareSize, height: squareSize }}>
                <div
                  className={isOn ? "bg-white" : "bg-[var(--gray)] group-hover:bg-[var(--lightgray)]"}
                  style={
                    isOn
                      ? { width: "100%", height: "100%", boxShadow: "0 0 2px 2px white" }
                      : { width: "100%", height: "100%" }
                  }
                />
                <div
                  aria-hidden
                  onClick={() => {
                    setRow2Active((prev) => {
                      const next = [...prev];
                      next[idx] = !next[idx];
                      return next;
                    });
                  }}
                  className="absolute cursor-pointer"
                  style={{ top: -(gap / 2), left: -(gap / 2), right: -(gap / 2), bottom: -(gap / 2) }}
                />
              </div>
            ))}
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                setRow1Active(Array(numSquares).fill(false));
                setRow2Active(Array(numSquares).fill(false));
              }}
              className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 cursor-pointer"
            >
              Clear Notes
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}


function SequencerGrid16x16({ animateOnPlay = false }: { animateOnPlay?: boolean }) {
  const squareSize = 20; // px
  const gap = 7; // px
  const { numCols, numRows, position, active, setActive, flash } = useSequencer16x16({
    animateOnPlay,
  });
  const totalWidth = numCols * squareSize + (numCols - 1) * gap;

  return (
    <main className="h-full flex items-center justify-center">
      <div className="flex flex-col items-start" style={{ gap: 10 }}>
        <div className="relative h-[30px]" style={{ width: totalWidth }}>
          <div
            aria-hidden
            className="w-0 h-0 border-l-[10px] border-r-[10px] border-l-transparent border-r-transparent border-t-[14px] border-t-white absolute top-1/2 -translate-y-1/2"
            style={{ left: position * (squareSize + gap) + squareSize / 2 - 10 }}
          />
        </div>
        <div className="flex flex-col" style={{ gap }}>
          <SequencerGrid
            numRows={numRows}
            numCols={numCols}
            gap={gap}
            squareSize={20}
            active={active}
            flash={flash}
            onToggle={(r, c) =>
              setActive((prev) => {
                const next = prev.map((row) => row.slice());
                next[r][c] = !next[r][c];
                return next;
              })
            }
          />
          <div className="pt-2">
            <ClearButton
              onClear={() =>
                setActive(
                  Array.from({ length: numRows }, () => Array<boolean>(numCols).fill(false))
                )
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function SequencerGrid16x16WithMute({ animateOnPlay = false }: { animateOnPlay?: boolean }) {
  const squareSize = 20; // px
  const gap = 7; // px
  const [muted, setMuted] = useState(false);
  const { numCols, numRows, position, active, setActive, flash } = useSequencer16x16({
    animateOnPlay,
    isMuted: muted,
  });
  const totalWidth = numCols * squareSize + (numCols - 1) * gap;

  return (
    <main className="h-full flex items-center justify-center">
      <div className="flex flex-col items-start" style={{ gap: 10 }}>
        <div className="relative h-[30px]" style={{ width: totalWidth }}>
          <div
            aria-hidden
            className="w-0 h-0 border-l-[10px] border-r-[10px] border-l-transparent border-r-transparent border-t-[14px] border-t-white absolute top-1/2 -translate-y-1/2"
            style={{ left: position * (squareSize + gap) + squareSize / 2 - 10 }}
          />
        </div>
        <div className="flex flex-col" style={{ gap }}>
          <SequencerGrid
            numRows={numRows}
            numCols={numCols}
            gap={gap}
            squareSize={20}
            active={active}
            flash={flash}
            onToggle={(r, c) =>
              setActive((prev) => {
                const next = prev.map((row) => row.slice());
                next[r][c] = !next[r][c];
                return next;
              })
            }
          />
          <div className="pt-2 flex items-center" style={{ gap: 24 }}>
            <MuteButton muted={muted} onToggle={() => setMuted((m) => !m)} />
            <ClearButton
              onClear={() =>
                setActive(
                  Array.from({ length: numRows }, () => Array<boolean>(numCols).fill(false))
                )
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}


function SequencerGrid16x16WithShare({ animateOnPlay = false }: { animateOnPlay?: boolean }) {
  const squareSize = 20; // px
  const gap = 7; // px
  const [muted, setMuted] = useState(false);
  const { numCols, numRows, position, active, setActive, flash } = useSequencer16x16({
    animateOnPlay,
    isMuted: muted,
  });
  const totalWidth = numCols * squareSize + (numCols - 1) * gap;
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Encode/decode helpers for compact 256-bit representation
  function bytesToBase64Url(bytes: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    return base64;
  }
  function base64UrlToBytes(b64url: string): Uint8Array {
    let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
    const padLen = b64.length % 4;
    if (padLen === 2) b64 += "==";
    else if (padLen === 3) b64 += "=";
    else if (padLen !== 0) b64 += ""; // no-op for other cases
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function gridToBytes(grid: boolean[][]): Uint8Array {
    const bytes = new Uint8Array(32);
    let bitIndex = 0;
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        if (grid[r][c]) {
          const byteIndex = bitIndex >> 3;
          const bitOffset = bitIndex & 7; // LSB-first in each byte
          bytes[byteIndex] |= 1 << bitOffset;
        }
        bitIndex++;
      }
    }
    return bytes;
  }
  function bytesToGrid(bytes: Uint8Array): boolean[][] {
    const grid = Array.from({ length: numRows }, () => Array<boolean>(numCols).fill(false));
    let bitIndex = 0;
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const byteIndex = bitIndex >> 3;
        const bitOffset = bitIndex & 7;
        const on = byteIndex < bytes.length ? ((bytes[byteIndex] >> bitOffset) & 1) === 1 : false;
        grid[r][c] = on;
        bitIndex++;
      }
    }
    return grid;
  }

  // Build share URL from current grid
  useEffect(() => {
    if (typeof window === "undefined") return;
    const bytes = gridToBytes(active);
    const d = bytesToBase64Url(bytes);
    const url = `${window.location.origin}${window.location.pathname}?d=${d}`;
    setShareUrl(url);
  }, [active]);

  // Rehydrate from ?d= on first mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const d = params.get("d");
      if (d) {
        const bytes = base64UrlToBytes(d);
        if (bytes.length >= 32) {
          const grid = bytesToGrid(bytes.subarray(0, 32));
          setActive(grid);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="h-full flex items-center justify-center">
      <div className="flex flex-col items-start" style={{ gap: 10 }}>
        <div className="w-full flex items-center" style={{ gap: 8 }}>
          <span>Share the song:</span>
          <input
            value={shareUrl}
            readOnly
            className="flex-1 min-w-[320px] px-2 py-1 rounded-md bg-white/10 border border-white/20"
          />
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1000);
              } catch {}
            }}
            aria-label="Copy link"
            className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 cursor-pointer"
          >
            {copied ? "Copied!" : <CopyIcon size={16} />}
          </button>
        </div>
        <div className="relative h-[30px]" style={{ width: totalWidth }}>
          <div
            aria-hidden
            className="w-0 h-0 border-l-[10px] border-r-[10px] border-l-transparent border-r-transparent border-t-[14px] border-t-white absolute top-1/2 -translate-y-1/2"
            style={{ left: position * (squareSize + gap) + squareSize / 2 - 10 }}
          />
        </div>
        <div className="flex flex-col" style={{ gap }}>
          <SequencerGrid
            numRows={numRows}
            numCols={numCols}
            gap={gap}
            squareSize={20}
            active={active}
            flash={flash}
            onToggle={(r, c) =>
              setActive((prev) => {
                const next = prev.map((row) => row.slice());
                next[r][c] = !next[r][c];
                return next;
              })
            }
          />
          <div className="pt-2 flex items-center" style={{ gap: 24 }}>
            <MuteButton muted={muted} onToggle={() => setMuted((m) => !m)} />
            <ClearButton
              onClear={() =>
                setActive(
                  Array.from({ length: numRows }, () => Array<boolean>(numCols).fill(false))
                )
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}
