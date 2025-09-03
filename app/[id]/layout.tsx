import Link from "next/link";
import { use } from "react";

export default function SubPageLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ id: string }> }>) {
  const { id: currentId } = use(params);
  const links = Array.from({ length: 7 }, (_, i) => i + 1);
  return (
    <div className="min-h-screen">
      <header className="p-6 border-b border-white/10">
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
      <div className="p-6">{children}</div>
    </div>
  );
}


