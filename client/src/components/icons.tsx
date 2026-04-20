import { T } from "../theme";

export function SoundIcon({ on }: { on: boolean }) {
  return on ? (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <path d="M11 5L6 9H2v6h4l5 4V5z" fill={T.ink} />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" stroke={T.ink} strokeWidth="2" strokeLinecap="round" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" stroke={T.ink} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <path d="M11 5L6 9H2v6h4l5 4V5z" fill={T.inkDim} />
      <path d="M17 9l-6 6M11 9l6 6" stroke={T.inkDim} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function BackIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <path d="M14 6l-6 6 6 6" stroke={T.ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CrownIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 7l4 4 5-6 5 6 4-4-2 12H5L3 7z" fill={T.yellow} stroke="#0a0502" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}