"use client";

import type { ImgHTMLAttributes } from "react";

type HintGifProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  src: string;
  alt: string;
};

export default function HintGif({ src, alt, className, ...rest }: HintGifProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`${className ?? ""}`}
      {...rest}
    />
  );
}


