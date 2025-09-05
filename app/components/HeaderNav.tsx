"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CHAPTERS_COUNT } from "@/app/lib/chapters";
import { useProgressAll } from "@/app/lib/progress";

type ProgressRow = {
  page: number;
};

export default function HeaderNav() {
  const params = useParams<{ id: string }>();
  const currentId = params?.id ?? "1";
  const current = useMemo(() => {
    const n = Number.parseInt(String(currentId), 10);
    return Number.isFinite(n) ? n : 1;
  }, [currentId]);

  const { data: allProgress } = useProgressAll();
  const pagesWithProgress = useMemo(() => new Set((allProgress ?? []).map((p) => p.page)), [allProgress]);

  const links = Array.from({ length: CHAPTERS_COUNT }, (_, i) => i + 1);

  // When progress is submitted for the current page, briefly highlight the next page link
  const [highlightNextUntil, setHighlightNextUntil] = useState<number>(0);
  useEffect(() => {
    const onSubmitted = (e: Event) => {
      const detail = (e as CustomEvent<{ page: number }>).detail;
      if (!detail) return;
      if (detail.page === current && current < CHAPTERS_COUNT) {
        setHighlightNextUntil(Date.now() + 2200);
      }
    };
    window.addEventListener("progress-submitted", onSubmitted as EventListener);
    return () => window.removeEventListener("progress-submitted", onSubmitted as EventListener);
  }, [current]);

  const now = Date.now();

  return (
    <nav className="flex flex-wrap gap-6 text-lg w-full">
      {links.map((n) => {
        const isActive = n === current;
        const hasProgress = pagesWithProgress.has(n);
        const shouldRadiate = n === current + 1 && now < highlightNextUntil;
        return (
          <Link
            key={n}
            href={`/${n}`}
            aria-current={isActive ? "page" : undefined}
            className="no-underline block h-[80px] -mx-2 px-2 flex items-center"
            prefetch
          >
            <span
              className={
                (
                  isActive
                    ? hasProgress
                      ? "relative rounded-full w-8 h-8 flex items-center justify-center bg-green-500 text-black ring-5 ring-white"
                      : "relative rounded-full w-8 h-8 flex items-center justify-center bg-black text-white ring-5 ring-white"
                    : hasProgress
                    ? "relative rounded-full w-8 h-8 flex items-center justify-center bg-green-500 text-black"
                    : "relative rounded-full w-8 h-8 flex items-center justify-center bg-black text-white"
                ) + (shouldRadiate ? " radiance-pulse" : "")
              }
            >
              {n}
            </span>
          </Link>
        );
      })}
      <a
        href="https://github.com/vpavlenko/tonematrix"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub repository"
        className="no-underline hidden md:flex h-[80px] -mx-2 px-2 items-center ml-auto shrink-0"
      >
        <span className="relative rounded-full w-8 h-8 flex items-center justify-center bg-black text-white">
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="w-5 h-5"
            fill="currentColor"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.06-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
        </span>
      </a>
    </nav>
  );
}


