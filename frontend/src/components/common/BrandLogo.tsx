import React from "react";

interface BrandLogoProps {
  className?: string;
}

export default function BrandLogo({ className }: BrandLogoProps) {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      viewBox="0 0 80 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="brandLogoGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      
      {/* Sleek, clean columns (rounded bars representing growth) */}
      <rect x="24" y="20" width="6" height="10" rx="3" fill="url(#brandLogoGrad)" />
      <rect x="36" y="13" width="6" height="17" rx="3" fill="url(#brandLogoGrad)" />
      <rect x="48" y="6" width="6" height="24" rx="3" fill="url(#brandLogoGrad)" />
      
      {/* A clean, sharp trend line representing analytics */}
      <path
        d="M 16 26 L 30 18 L 42 12 L 56 6"
        stroke="#FAFAFA"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 48 6 H 56 V 14"
        stroke="#FAFAFA"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
