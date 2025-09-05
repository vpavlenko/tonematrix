"use client";

import { useEffect, useRef } from "react";
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";

hljs.registerLanguage("typescript", typescript);

type CodeBlockProps = {
  language?: "typescript";
  code: string;
  className?: string;
  maxHeightClassName?: string;
};

export default function CodeBlock({ code, language = "typescript", className = "", maxHeightClassName = "max-h-64" }: CodeBlockProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      try {
        hljs.highlightElement(ref.current);
      } catch {}
    }
  }, [code]);

  return (
    <pre className={`overflow-auto ${maxHeightClassName} text-xs bg-black/60 p-3 rounded-md border border-white/10 ${className}`}>
      <code ref={ref as any} className={`language-${language} font-mono text-white/90`}>{code}</code>
    </pre>
  );
}


