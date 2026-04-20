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
