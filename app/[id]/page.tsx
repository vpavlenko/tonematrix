"use client";

import { use, useState, useEffect, useRef } from "react";

type PageProps = { params: Promise<{ id: string }> };

// Shared audio helpers
function getAudioContext(): AudioContext {
  const w = window as any;
  if (!w.__audioCtx) {
    const AudioCtx = w.AudioContext || w.webkitAudioContext;
    w.__audioCtx = new AudioCtx();
  }
  return w.__audioCtx as AudioContext;
}

function playBellAt(baseFreq: number, when: number) {
  const ctx = getAudioContext();
  const master = ctx.createGain();
  master.gain.setValueAtTime(1.0, when);
  master.connect(ctx.destination);

  function partial(freq: number, amp: number, duration: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, when);
    gain.gain.setValueAtTime(amp, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    osc.connect(gain).connect(master);
    osc.start(when);
    osc.stop(when + duration);
  }

  partial(baseFreq, 1.0, 1.4);
  partial(baseFreq * 2, 0.4, 1.0);
  partial(baseFreq * 3, 0.25, 0.9);
}

function playBell(baseFreq: number) {
  const ctx = getAudioContext();
  playBellAt(baseFreq, ctx.currentTime);
}

function playBellC5() {
  playBell(523.25);
}

export default function SubPage({ params }: PageProps) {
  const { id } = use(params);

  if (id === "1") {
    return (
      <main className="h-full flex items-center justify-center">
        <div className="w-[60px] h-[60px] bg-[var(--gray)]" />
      </main>
    );
  }

  if (id === "2") {
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

  if (id === "3") {
    return <HoverPersist />;
  }

  if (id === "4") {
    return <HoverRevert />;
  }

  if (id === "5") {
    return <ClickToggle />;
  }

  if (id === "6") {
    return <ClickToggleWithSound />;
  }

  if (id === "7") {
    return <ClickToggleWithSoundAndArrow />;
  }

  if (id === "8") {
    return <MovingArrowOverSquares />;
  }

  if (id === "9") {
    return <SequencerAutoPlay />;
  }

  if (id === "10") {
    return <SequencerTwoRows />;
  }

  if (id === "11") {
    return <SequencerTwoRowsWithClear />;
  }

  if (id === "12") {
    return <SequencerGrid16x16 />;
  }

  return (
    <main className="h-full flex items-center justify-center">
      <p>Page {id}</p>
    </main>
  );
}

function ClickToggleWithSoundAndArrow() {
  const [active, setActive] = useState<boolean[]>(Array(8).fill(false));

  return (
    <main className="h-full flex items-center justify-center">
      <div className="flex flex-col items-start" style={{ gap: 15 }}>
        <div className="relative h-[30px] w-[60px] flex items-center justify-center ml-0">
          <div
            aria-hidden
            className="w-0 h-0 border-l-[10px] border-r-[10px] border-l-transparent border-r-transparent border-t-[14px] border-t-white"
          />
        </div>
        <div className="flex" style={{ gap: 15 }}>
          {active.map((isOn, idx) => (
            <div
              key={idx}
              onClick={() => {
                setActive((prev) => {
                  const next = [...prev];
                  next[idx] = !next[idx];
                  return next;
                });
                playBellC5();
              }}
              className={
                isOn
                  ? "w-[60px] h-[60px] bg-white cursor-pointer"
                  : "w-[60px] h-[60px] bg-[var(--gray)] hover:bg-[var(--lightgray)] cursor-pointer"
              }
              style={isOn ? { boxShadow: "0 0 2px 2px white" } : undefined}
            />
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
  return (
    <main className="h-full flex items-center justify-center">
      <div className="flex gap-[15px]">
        {active.map((isOn, idx) => (
          <div
            key={idx}
            onClick={() =>
              setActive((prev) => {
                const next = [...prev];
                next[idx] = !next[idx];
                return next;
              })
            }
            className={
              isOn
                ? "w-[60px] h-[60px] bg-white cursor-pointer"
                : "w-[60px] h-[60px] bg-[var(--gray)] hover:bg-[var(--lightgray)] cursor-pointer"
            }
            style={isOn ? { boxShadow: "0 0 2px 2px white" } : undefined}
          />
        ))}
      </div>
    </main>
  );
}

function ClickToggleWithSound() {
  const [active, setActive] = useState<boolean[]>(Array(8).fill(false));

  return (
    <main className="h-full flex items-center justify-center">
      <div className="flex gap-[15px]">
        {active.map((isOn, idx) => (
          <div
            key={idx}
            onClick={() => {
              setActive((prev) => {
                const next = [...prev];
                next[idx] = !next[idx];
                return next;
              });
              playBellC5();
            }}
            className={
              isOn
                ? "w-[60px] h-[60px] bg-white cursor-pointer"
                : "w-[60px] h-[60px] bg-[var(--gray)] hover:bg-[var(--lightgray)] cursor-pointer"
            }
            style={isOn ? { boxShadow: "0 0 2px 2px white" } : undefined}
          />
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
            <div
              key={idx}
              onClick={() => {
                setActive((prev) => {
                  const next = [...prev];
                  next[idx] = !next[idx];
                  return next;
                });
                playBellC5();
              }}
              className={
                isOn
                  ? "w-[60px] h-[60px] bg-white cursor-pointer"
                  : "w-[60px] h-[60px] bg-[var(--gray)] hover:bg-[var(--lightgray)] cursor-pointer"
              }
              style={isOn ? { boxShadow: "0 0 2px 2px white" } : undefined}
            />
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
            <div
              key={idx}
              onClick={() => {
                setActive((prev) => {
                  const next = [...prev];
                  next[idx] = !next[idx];
                  return next;
                });
                playBellC5();
              }}
              className={
                isOn
                  ? "w-[60px] h-[60px] bg-white cursor-pointer"
                  : "w-[60px] h-[60px] bg-[var(--gray)] hover:bg-[var(--lightgray)] cursor-pointer"
              }
              style={isOn ? { boxShadow: "0 0 2px 2px white" } : undefined}
            />
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
              <div
                key={idx}
                onClick={() => {
                  setRow1Active((prev) => {
                    const next = [...prev];
                    next[idx] = !next[idx];
                    return next;
                  });
                }}
                className={
                  isOn
                    ? "w-[60px] h-[60px] bg-white cursor-pointer"
                    : "w-[60px] h-[60px] bg-[var(--gray)] hover:bg-[var(--lightgray)] cursor-pointer"
                }
                style={isOn ? { boxShadow: "0 0 2px 2px white" } : undefined}
              />
            ))}
          </div>
          <div className="flex" style={{ gap }}>
            {row2Active.map((isOn, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setRow2Active((prev) => {
                    const next = [...prev];
                    next[idx] = !next[idx];
                    return next;
                  });
                }}
                className={
                  isOn
                    ? "w-[60px] h-[60px] bg-white cursor-pointer"
                    : "w-[60px] h-[60px] bg-[var(--gray)] hover:bg-[var(--lightgray)] cursor-pointer"
                }
                style={isOn ? { boxShadow: "0 0 2px 2px white" } : undefined}
              />
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
              <div
                key={idx}
                onClick={() => {
                  setRow1Active((prev) => {
                    const next = [...prev];
                    next[idx] = !next[idx];
                    return next;
                  });
                }}
                className={
                  isOn
                    ? "w-[60px] h-[60px] bg-white cursor-pointer"
                    : "w-[60px] h-[60px] bg-[var(--gray)] hover:bg-[var(--lightgray)] cursor-pointer"
                }
                style={isOn ? { boxShadow: "0 0 2px 2px white" } : undefined}
              />
            ))}
          </div>
          <div className="flex" style={{ gap }}>
            {row2Active.map((isOn, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setRow2Active((prev) => {
                    const next = [...prev];
                    next[idx] = !next[idx];
                    return next;
                  });
                }}
                className={
                  isOn
                    ? "w-[60px] h-[60px] bg-white cursor-pointer"
                    : "w-[60px] h-[60px] bg-[var(--gray)] hover:bg-[var(--lightgray)] cursor-pointer"
                }
                style={isOn ? { boxShadow: "0 0 2px 2px white" } : undefined}
              />
            ))}
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                setRow1Active(Array(numSquares).fill(false));
                setRow2Active(Array(numSquares).fill(false));
              }}
              className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/20"
            >
              Clear Notes
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}


function SequencerGrid16x16() {
  const numCols = 16;
  const numRows = 16;
  const squareSize = 20; // px
  const gap = 5; // px
  const totalWidth = numCols * squareSize + (numCols - 1) * gap;
  const [position, setPosition] = useState(0);
  const [active, setActive] = useState<boolean[][]>(
    Array.from({ length: numRows }, () => Array<boolean>(numCols).fill(false))
  );
  const activeRef = useRef(active);
  const positionRef = useRef(0);
  const nextStepTimeRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const stepSec = 0.25;

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  function midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // Bottom row (row 0) is C3, then Eb3, F3, G3, Bb3, C4, ...
  function frequencyForRow(rowIndexFromBottom: number): number {
    const pentatonicOffsets = [0, 3, 5, 7, 10];
    const octave = Math.floor(rowIndexFromBottom / pentatonicOffsets.length);
    const degreeIndex = rowIndexFromBottom % pentatonicOffsets.length;
    const baseMidiC3 = 48; // C3
    const midi = baseMidiC3 + octave * 12 + pentatonicOffsets[degreeIndex];
    return midiToFreq(midi);
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
            playBellAt(freq, nextStepTimeRef.current);
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
  }, []);

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
          {Array.from({ length: numRows }).map((_, rTop) => {
            const r = numRows - 1 - rTop; // display top-to-bottom, bottom row is r=0
            return (
              <div key={rTop} className="flex" style={{ gap }}>
                {Array.from({ length: numCols }).map((_, c) => {
                  const isOn = active[r][c];
                  return (
                    <div
                      key={c}
                      onClick={() => {
                        setActive((prev) => {
                          const next = prev.map((row) => row.slice());
                          next[r][c] = !next[r][c];
                          return next;
                        });
                      }}
                      className={
                        isOn
                          ? "w-[20px] h-[20px] bg-white cursor-pointer"
                          : "w-[20px] h-[20px] bg-[var(--gray)] hover:bg-[var(--lightgray)] cursor-pointer"
                      }
                      style={isOn ? { boxShadow: "0 0 1px 1px white" } : undefined}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

