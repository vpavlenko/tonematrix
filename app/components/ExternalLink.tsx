"use client";

import { ExternalLink as ExternalLinkIcon } from "lucide-react";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  showIcon?: boolean;
};

export function ExternalLink({ href, children, className, showIcon = true, ...rest }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 font-bold text-white ${className ?? ""}`}
      {...rest}
    >
      <span>{children}</span>
      {showIcon ? <ExternalLinkIcon size={20} /> : null}
    </a>
  );
}


