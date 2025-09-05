"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import AudioGate from "@/app/components/AudioGate";
import Sidebar from "@/app/components/Sidebar";
import HeaderNav from "@/app/components/HeaderNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChapterRoute = useMemo(() => {
    if (!pathname) return false;
    return /^\/(\d+)(?:[\/?#]|$)/.test(pathname);
  }, [pathname]);

  if (!isChapterRoute) return <>{children}</>;

  return (
    <div className="h-screen flex flex-col">
      <header className="h-[80px] px-6 border-b border-white/10 flex items-center">
        <HeaderNav />
      </header>
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row">
          <aside className="w-full lg:w-[27em] shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 p-6 overflow-auto">
            <Sidebar />
          </aside>
          <section className="flex-1 min-w-0 min-h-0 overflow-hidden" data-right-pane>
            {children}
          </section>
        </div>
      </main>
      <AudioGate />
    </div>
  );
}


