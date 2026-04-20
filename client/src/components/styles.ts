import { T } from "../theme";

export const iconBtnStyle: React.CSSProperties = {
  appearance: 'none',
  border: `2px solid ${T.border}`,
  background: T.bg,
  width: 44, height: 44, borderRadius: 4,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
  boxShadow: `3px 3px 0 0 ${T.shadow}`,
};

export const roomPageStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column',
  background: T.bg, color: T.ink,
  minHeight: '100vh',
  fontFamily: '"Space Grotesk", system-ui',
  maxWidth: 1280, margin: '0 auto', width: '100%',
};

export const topBarStyle: React.CSSProperties = {
  padding: '16px 16px 14px',
  background: T.bg2,
  borderBottom: `3px solid ${T.border}`,
  display: 'flex', alignItems: 'center', gap: 10,
};

export const connectingScreenStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  minHeight: '100vh', background: T.bg,
  color: T.inkDim, fontFamily: '"JetBrains Mono", monospace',
  fontSize: 13, letterSpacing: 2,
};
