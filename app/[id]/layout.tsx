import Link from "next/link";
import { use } from "react";
import AudioGate from "@/app/components/AudioGate";
import { CHAPTERS_COUNT } from "@/app/lib/chapters";
import Sidebar from "@/app/components/Sidebar";

export default function SubPageLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ id: string }> }>) {
  const { id: currentId } = use(params);
  const links = Array.from({ length: CHAPTERS_COUNT }, (_, i) => i + 1);
  return (
    <div className="h-screen flex flex-col">
      <header className="h-[80px] px-6 border-b border-white/10 flex items-center">
        <nav className="flex gap-6 text-lg">
          {links.map((n) => {
            const isActive = String(n) === currentId;
            return (
              <Link
                key={n}
                href={`/${n}`}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "no-underline rounded-full w-8 h-8 flex items-center justify-center bg-white text-black"
                    : "no-underline rounded-full w-8 h-8 flex items-center justify-center bg-black text-white"
                }
              >
                {n}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row">
          <aside className="w-full lg:w-[20em] shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 p-6 overflow-auto">
            <Sidebar />
          </aside>
          <section className="flex-1 min-w-0 min-h-0 overflow-hidden">
            {children}
          </section>
        </div>
      </main>
      <AudioGate />
    </div>
  );
}


