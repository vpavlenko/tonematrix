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
    <nav className="flex gap-6 text-lg">
      {links.map((n) => {
        const isActive = n === current;
        const hasProgress = pagesWithProgress.has(n);
        const shouldRadiate = n === current + 1 && now < highlightNextUntil;
        return (
          <Link
            key={n}
            href={`/${n}`}
            aria-current={isActive ? "page" : undefined}
            className={
              (isActive
                ? "no-underline rounded-full w-8 h-8 flex items-center justify-center bg-white text-black"
                : hasProgress
                ? "no-underline rounded-full w-8 h-8 flex items-center justify-center bg-green-500 text-black"
                : "no-underline rounded-full w-8 h-8 flex items-center justify-center bg-black text-white") +
              (shouldRadiate ? " radiance-pulse" : "")
            }
            prefetch
          >
            {n}
          </Link>
        );
      })}
    </nav>
  );
}


