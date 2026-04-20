import { T } from '../theme';
import './ui.css';

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
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`chunky-btn${big ? ' chunky-btn--big' : ''}`}
      style={{ '--bz-btn-bg': color, '--bz-btn-color': textColor, ...style } as React.CSSProperties}
    >{children}</button>
  );
}
