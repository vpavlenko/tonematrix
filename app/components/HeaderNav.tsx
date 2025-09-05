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

  return (
    <nav className="flex gap-6 text-lg">
      {links.map((n) => {
        const isActive = n === current;
        const hasProgress = pagesWithProgress.has(n);
        return (
          <Link
            key={n}
            href={`/${n}`}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "no-underline rounded-full w-8 h-8 flex items-center justify-center bg-white text-black"
                : hasProgress
                ? "no-underline rounded-full w-8 h-8 flex items-center justify-center bg-green-500 text-black"
                : "no-underline rounded-full w-8 h-8 flex items-center justify-center bg-black text-white"
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


