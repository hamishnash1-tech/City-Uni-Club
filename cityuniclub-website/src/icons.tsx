import React from 'react'

const shared = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }

type IconProps = { className?: string }
const cls = (c?: string) => c ?? "w-5 h-5"

export const IconHome = ({ className }: IconProps = {}) => (
  <svg className={cls(className)} {...shared}>
    {/* Pediment */}
    <path d="M2 10 L12 3 L22 10" />
    {/* Entablature - filled band */}
    <rect x="2" y="10" width="20" height="2" fill="currentColor" stroke="none" />
    {/* 3 wide columns */}
    <rect x="2" y="12" width="5.5" height="8" />
    <rect x="9.25" y="12" width="5.5" height="8" />
    <rect x="16.5" y="12" width="5.5" height="8" />
    {/* Base steps */}
    <path d="M1 20h22" />
    <path d="M1 23h22" />
  </svg>
)

export const IconDining = ({ className }: IconProps = {}) => (
  <svg className={cls(className)} {...shared}>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3" />
    <path d="M21 15v7" />
  </svg>
)

export const IconEvents = ({ className }: IconProps = {}) => (
  <svg className={cls(className)} {...shared}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M8 2v4M16 2v4" />
    <path d="M3 9h18" />
    <path d="M3 12h18M3 15h18M3 18h18" strokeWidth={1} />
    <path d="M6.6 9v12M10.2 9v12M13.8 9v12M17.4 9v12" strokeWidth={1} />
  </svg>
)

export const IconNews = ({ className }: IconProps = {}) => (
  <svg className={cls(className)} {...shared}>
    <rect x="3" y="3" width="18" height="18" rx="1.5" />
    <path d="M3 8h18" />
    <path d="M12 8v13" />
    <path d="M5.5 11h5M5.5 14h5M5.5 17h5" />
    <path d="M13.5 11h5M13.5 14h5M13.5 17h3" />
  </svg>
)

export const IconUser = ({ className }: IconProps = {}) => (
  <svg className={cls(className)} {...shared}>
    {/* Head */}
    <circle cx="12" cy="7" r="3.5" />
    {/* Jacket body */}
    <path d="M5 22 C5 16 8 12 12 12 C16 12 19 16 19 22" />
    {/* Collar V — lapels of a formal jacket */}
    <path d="M10 12.5 L12 15.5 L14 12.5" />
    {/* Tie — solid filled, slightly oversized for visibility */}
    <path d="M11.2 15.5 L10 17 L9.5 21 L12 22.5 L14.5 21 L14 17 L12.8 15.5 Z" fill="currentColor" stroke="none" />
  </svg>
)

export const IconClubs = ({ className }: IconProps = {}) => (
  <svg className={cls(className)} {...shared}>
    <circle cx="12" cy="12" r="9" />
    <ellipse cx="12" cy="12" rx="9" ry="3" />
    <ellipse cx="12" cy="12" rx="3.5" ry="9" />
  </svg>
)
