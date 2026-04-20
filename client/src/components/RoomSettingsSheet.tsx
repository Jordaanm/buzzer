import { useState } from "react";
import { RoomState } from "../types";
import { socket } from '../socket';
import { T } from '../theme';
import { ROOM_ICONS, RoomIconRenderer } from "../roomIcons";
import { ChunkyButton } from "./ui";
import './RoomSettingsSheet.css';

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
    <div className="settings-sheet__overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="settings-sheet__container">
        <div className="settings-sheet__header">
          <div className="settings-sheet__title">Room settings</div>
          <button onClick={onClose} className="settings-sheet__close-btn">×</button>
        </div>

        <div className="settings-sheet__body">
          <div>
            <div className="settings-sheet__label">Room Icon</div>
            <button onClick={() => setShowIconPicker(v => !v)} className="settings-sheet__icon-picker-trigger">
              <RoomIconRenderer icon={roomState.icon} size={24} color={T.yellow} />
              <span className="settings-sheet__icon-picker-trigger-text">
                {showIconPicker ? 'Close picker' : 'Change icon'}
              </span>
            </button>
            {showIconPicker && (
              <div className="settings-sheet__icon-picker-grid">
                {ROOM_ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => handleIconPick(icon)}
                    className={`settings-sheet__icon-picker-item${roomState.icon === icon ? ' settings-sheet__icon-picker-item--selected' : ''}`}
                  >
                    <RoomIconRenderer icon={icon} size={20} color={T.inkDim} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="settings-sheet__label">Password</div>
            <div className="settings-sheet__password-row">
              <input
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePasswordSave()}
                placeholder={roomState.hasPassword ? '(change password)' : 'Set a password'}
                className="settings-sheet__password-input"
              />
              <ChunkyButton color={T.yellow} onClick={handlePasswordSave} style={{ width: 'auto', padding: '12px 20px' }}>
                Save
              </ChunkyButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
