"use client";

export default function ImageWithFallback({
  src,
  alt,
  className,
  fallbackSvg
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackSvg: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.src = fallbackSvg;
      }}
    />
  );
}
