import { useState } from 'react';
import { T } from '../theme';

interface ChunkyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
  textColor?: string;
  disabled?: boolean;
  big?: boolean;
  style?: React.CSSProperties;
}

export function ChunkyButton({
  children, onClick, color = T.yellow, textColor = T.border,
  disabled = false, big = false, style = {},
}: ChunkyButtonProps) {
  const [pressed, setPressed] = useState(false);
  const offset = big ? 6 : 4;
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      disabled={disabled}
      style={{
        border: `3px solid ${T.border}`,
        background: disabled ? '#555' : color,
        color: disabled ? 'rgba(255,255,255,0.3)' : textColor,
        fontFamily: '"Space Grotesk", system-ui',
        fontWeight: 700,
        fontSize: big ? 20 : 16,
        letterSpacing: big ? '0.5px' : '0.3px',
        textTransform: 'uppercase' as const,
        padding: big ? '18px 28px' : '14px 20px',
        width: '100%',
        borderRadius: 4,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: pressed || disabled ? '0 0 0 0 #0a0502' : `${offset}px ${offset}px 0 0 #0a0502`,
        transform: pressed && !disabled ? `translate(${offset}px, ${offset}px)` : 'translate(0,0)',
        transition: 'transform 60ms, box-shadow 60ms',
        minHeight: 56,
        ...style,
      }}
    >{children}</button>
  );
}
