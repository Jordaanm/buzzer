import { useState } from "react";
import { RoomState } from "../types";
import { socket } from '../socket';
import { T } from '../theme';
import { ROOM_ICONS, RoomIconRenderer } from "../roomIcons";
import { ChunkyButton } from "./ui";

const sheetLabelStyle: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: 10, letterSpacing: 2, color: T.inkDim,
  textTransform: 'uppercase', marginBottom: 8, fontWeight: 700,
};

export const SettingsSheet = ({ roomState, roomId, onClose }: {
  roomState: RoomState;
  roomId: number;
  onClose: () => void;
}) => {
  const [passwordInput, setPasswordInput] = useState(roomState.hasPassword ? '' : '');
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleIconPick = (icon: string) => {
    socket.emit('update-room-meta', { roomId, icon });
    setShowIconPicker(false);
  };

  const handlePasswordSave = () => {
    socket.emit('update-password', { roomId, password: passwordInput.trim() || null });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)', zIndex: 200,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.bg2, borderTop: `4px solid ${T.border}`,
          borderTopLeftRadius: 16, borderTopRightRadius: 16,
          maxHeight: '80vh', overflowY: 'auto',
          animation: 'bz-slide-up 0.25s ease-out',
        }}
      >
        {/* Sheet header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: `2px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ flex: 1, fontSize: 20, fontWeight: 800, letterSpacing: -0.3 }}>
            Room settings
          </div>
          <button
            onClick={onClose}
            style={{
              appearance: 'none', border: 'none', background: 'transparent',
              color: T.inkDim, fontSize: 28, cursor: 'pointer', lineHeight: 1,
              width: 32, height: 32,
            }}
          >×</button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Room icon */}
          <div>
            <div style={sheetLabelStyle}>Room Icon</div>
            <button
              onClick={() => setShowIconPicker(v => !v)}
              style={{
                appearance: 'none',
                display: 'flex', alignItems: 'center', gap: 12,
                border: `3px solid ${T.border}`,
                background: T.bg, borderRadius: 6,
                padding: '12px 16px', cursor: 'pointer', width: '100%',
                boxShadow: `4px 4px 0 0 ${T.shadow}`,
              }}
            >
              <RoomIconRenderer icon={roomState.icon} size={24} color={T.yellow} />
              <span style={{ color: T.inkDim, fontSize: 14, fontFamily: '"JetBrains Mono", monospace' }}>
                {showIconPicker ? 'Close picker' : 'Change icon'}
              </span>
            </button>
            {showIconPicker && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6,
                marginTop: 10,
              }}>
                {ROOM_ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => handleIconPick(icon)}
                    style={{
                      appearance: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 10, borderRadius: 6,
                      border: `2px solid ${roomState.icon === icon ? T.yellow : T.border}`,
                      background: roomState.icon === icon ? 'rgba(255,210,63,0.1)' : T.bg,
                      cursor: 'pointer',
                      transition: 'border-color 80ms',
                    }}
                  >
                    <RoomIconRenderer icon={icon} size={20} color={T.inkDim} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Password input */}
          <div>
            <div style={sheetLabelStyle}>Password</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePasswordSave()}
                placeholder={roomState.hasPassword ? '(change password)' : 'Set a password'}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  border: `3px solid ${T.border}`,
                  background: T.bg, color: T.ink,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 16, fontWeight: 700, letterSpacing: 3,
                  borderRadius: 4, outline: 'none',
                  boxShadow: `3px 3px 0 0 ${T.shadow}`,
                }}
              />
              <ChunkyButton
                color={T.yellow}
                onClick={handlePasswordSave}
                style={{ width: 'auto', padding: '12px 20px' }}
              >Save</ChunkyButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
