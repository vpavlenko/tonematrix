"use client";

import { use, useState } from "react";

type PageProps = { params: Promise<{ id: string }> };

export default function SubPage({ params }: PageProps) {
  const { id } = use(params);

  if (id === "1") {
    return (
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="w-[60px] h-[60px] bg-[#7a7a7a]" />
      </main>
    );
  }

  if (id === "2") {
    return (
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="flex gap-[15px]">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-[60px] h-[60px] bg-[#7a7a7a]" />
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

  return (
    <main className="p-6">
      <p>Page {id}</p>
    </main>
  );
}

function ClickToggleWithSoundAndArrow() {
  const [active, setActive] = useState<boolean[]>(Array(10).fill(false));

  function playBellC5() {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(1.0, now);
    master.connect(ctx.destination);

    const base = 523.25;

    function partial(freq: number, amp: number, duration: number) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain).connect(master);
      osc.start(now);
      osc.stop(now + duration);
    }

    partial(base, 1.0, 1.4);
    partial(base * 2, 0.4, 1.0);
    partial(base * 3, 0.25, 0.9);
  }

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center">
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
                  : "w-[60px] h-[60px] bg-[#7a7a7a] hover:bg-[#bfbfbf] cursor-pointer"
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
  const [active, setActive] = useState<boolean[]>(Array(10).fill(false));
  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center">
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
            className={isOn ? "w-[60px] h-[60px] bg-[#bfbfbf]" : "w-[60px] h-[60px] bg-[#7a7a7a]"}
          />
        ))}
      </div>
    </main>
  );
}

function HoverRevert() {
  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="flex gap-[15px]">
        {Array.from({ length: 10 }).map((_, idx) => (
          <div
            key={idx}
            className="w-[60px] h-[60px] bg-[#7a7a7a] hover:bg-[#bfbfbf]"
          />
        ))}
      </div>
    </main>
  );
}

function ClickToggle() {
  const [active, setActive] = useState<boolean[]>(Array(10).fill(false));
  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center">
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
                : "w-[60px] h-[60px] bg-[#7a7a7a] hover:bg-[#bfbfbf] cursor-pointer"
            }
            style={isOn ? { boxShadow: "0 0 2px 2px white" } : undefined}
          />
        ))}
      </div>
    </main>
  );
}

function ClickToggleWithSound() {
  const [active, setActive] = useState<boolean[]>(Array(10).fill(false));

  function playBellC5() {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(1.0, now); // 100% volume
    master.connect(ctx.destination);

    const base = 523.25; // C5

    function partial(freq: number, amp: number, duration: number) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain).connect(master);
      osc.start(now);
      osc.stop(now + duration);
    }

    // Fundamental with longer sustain, plus a couple overtones for bell-like timbre
    partial(base, 1.0, 1.4);
    partial(base * 2, 0.4, 1.0);
    partial(base * 3, 0.25, 0.9);
  }

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center">
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
                : "w-[60px] h-[60px] bg-[#7a7a7a] hover:bg-[#bfbfbf] cursor-pointer"
            }
            style={isOn ? { boxShadow: "0 0 2px 2px white" } : undefined}
          />
        ))}
      </div>
    </main>
  );
}


