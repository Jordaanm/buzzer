import { useState } from "react";
import { T } from "../theme";

export const SlabBuzzer = ({ armed, won, lockedOut, onBuzz }: {
  armed: boolean;
  won: boolean;
  lockedOut: boolean;
  onBuzz: () => void;
}) => {
  const [pressed, setPressed] = useState(false);
  const disabled = !armed || lockedOut || won;
  const offset = 10;

  let bg: string, label: string, sub: string;
  if (won)            { bg = T.yellow;  label = 'BUZZED IN'; sub = 'you were first'; }
  else if (lockedOut) { bg = '#3a1010'; label = 'LOCKED';    sub = 'too late'; }
  else if (armed)     { bg = T.red;     label = 'BUZZ';      sub = 'tap to lock in'; }
  else                { bg = '#2a1a12'; label = 'DISARMED';  sub = 'waiting on host'; }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      padding: 24, userSelect: 'none',
    }}>
      <button
        disabled={disabled}
        onPointerDown={() => { if (!disabled) { setPressed(true); onBuzz(); } }}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        style={{
          appearance: 'none', flex: 1, width: '100%',
          border: `4px solid ${T.border}`, background: bg,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
          borderRadius: 12,
          boxShadow: pressed || disabled
            ? `0 0 0 0 ${T.shadow}`
            : `${offset}px ${offset}px 0 0 ${T.shadow}`,
          transform: pressed ? `translate(${offset}px, ${offset}px)` : 'translate(0,0)',
          transition: 'transform 60ms, box-shadow 60ms, background 150ms',
          animation: armed && !won && !lockedOut ? 'bz-slab-pulse 1s ease-in-out infinite' : 'none',
        }}
      >
        <div style={{
          fontFamily: '"Space Grotesk", system-ui', fontWeight: 900,
          fontSize: 72, lineHeight: 1, letterSpacing: -1,
          color: won ? T.border : T.ink,
          textShadow: won ? 'none' : `3px 3px 0 ${T.border}`,
        }}>{label}</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 13,
          color: won ? T.border : T.ink, opacity: 0.8, letterSpacing: 2,
          textTransform: 'uppercase',
        }}>{sub}</div>
      </button>
    </div>
  );
}