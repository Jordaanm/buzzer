
// ─── Host View ────────────────────────────────────────────────────────────────

import { PlayerIcon } from "../identity";
import { T } from "../theme";
import { RoomState } from "../types";
import { BackIcon, CrownIcon, SoundIcon } from "./icons";
import PlayerIconRenderer from "./PlayerIconRenderer";
import { SettingsSheet } from "./RoomSettingsSheet";
import { ChunkyButton } from "./ui";
import './RoomHostView.css';

interface HostViewProps {
  roomState: RoomState;
  roundLabel: string;
  winnerPlayer: RoomState['players'][0] | null;
  editingName: boolean;
  nameInput: string;
  nameInputRef: React.RefObject<HTMLInputElement>;
  showSettings: boolean;
  onLeave: () => void;
  onStartEditName: () => void;
  onCommitName: () => void;
  onNameKey: (e: React.KeyboardEvent) => void;
  onNameInput: (v: string) => void;
  onArm: () => void;
  onReset: () => void;
  onKick: (id: string) => void;
  onOpenSettings: () => void;
  onCloseSettings: () => void;
  roomId: number;
  soundOn: boolean;
  onToggleSound: () => void;
}

export const RoomHostView = ({
  roomState, roundLabel, winnerPlayer, editingName, nameInput, nameInputRef,
  showSettings, onLeave, onStartEditName, onCommitName, onNameKey, onNameInput,
  onArm, onReset, onKick, onOpenSettings, onCloseSettings, roomId, soundOn, onToggleSound,
}: HostViewProps) => {
  const armed = roomState.state === 'armed';
  const hasWinner = !!winnerPlayer;
  const statusState = hasWinner ? 'winner' : armed ? 'armed' : 'idle';

  const statusText = hasWinner
    ? `${winnerPlayer!.name} buzzed in!`
    : armed ? 'Buzzers armed' : 'Buzzers off';

  return (
    <div className="page-layout">
      <div className="top-bar">
        <button onClick={onLeave} className="icon-btn">
          <BackIcon />
        </button>
        <div className="room-host-view__top-bar-content">
          <div className="room-host-view__host-tag">
            <CrownIcon size={12} /> HOST · ROUND {roundLabel}
          </div>
          {editingName ? (
            <input
              ref={nameInputRef}
              value={nameInput}
              onChange={e => onNameInput(e.target.value)}
              onBlur={onCommitName}
              onKeyDown={onNameKey}
              maxLength={32}
              autoFocus
              className="room-host-view__name-edit-input"
            />
          ) : (
            <div onClick={onStartEditName} title="Click to rename" className="room-host-view__name-display">
              {roomState.name}
            </div>
          )}
        </div>
        <button onClick={onToggleSound} className="icon-btn" title={soundOn ? 'Mute' : 'Unmute'}>
          <SoundIcon on={soundOn} />
        </button>
        <button onClick={onOpenSettings} className="icon-btn room-host-view__settings-btn">⚙</button>
      </div>

      <div className={`room-host-view__status-banner room-host-view__status-banner--${statusState}`}>
        {(armed || hasWinner) && (
          <div className={`room-host-view__status-dot room-host-view__status-dot--${hasWinner ? 'winner' : 'armed'}`} />
        )}
        <div className={`room-host-view__status-text room-host-view__status-text--${statusState}`}>{statusText}</div>
      </div>

      <div className="room-host-view__content-area">
        {hasWinner ? (
          <div className="room-host-view__winner-spotlight">
            <div className="room-host-view__winner-label">★ First to buzz ★</div>
            <div className="room-host-view__winner-icon-wrap">
              <PlayerIconRenderer
                icon={winnerPlayer!.icon as PlayerIcon}
                color={winnerPlayer!.color}
                size={80}
              />
            </div>
            <div className="room-host-view__winner-name">{winnerPlayer!.name}</div>
          </div>
        ) : (
          <div>
            <div className="room-host-view__player-section-label">Players · {roomState.players.length}</div>
            <div className="room-host-view__player-grid">
              {roomState.players.map(p => (
                <div key={p.id} className={`room-host-view__player-card${p.isHost ? ' room-host-view__player-card--host' : ''}`}>
                  {p.isHost && (
                    <div className="room-host-view__crown-badge">
                      <CrownIcon size={18} />
                    </div>
                  )}
                  <PlayerIconRenderer icon={p.icon as PlayerIcon} color={p.color} size={28} />
                  <div className={`room-host-view__player-name${p.isHost ? ' room-host-view__player-name--host' : ''}`}>{p.name}</div>
                  {!p.isHost && (
                    <button onClick={() => onKick(p.id)} className="room-host-view__kick-btn">kick</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="room-host-view__action-footer">
        {hasWinner ? (
          <ChunkyButton color={T.yellow} big onClick={onReset}>
            Next Round →
          </ChunkyButton>
        ) : armed ? (
          <ChunkyButton color={T.red} textColor={T.ink} big onClick={onReset}>
            Disarm Buzzers
          </ChunkyButton>
        ) : (
          <ChunkyButton color={T.green} textColor={T.border} big onClick={onArm}>
            Arm Buzzers
          </ChunkyButton>
        )}
      </div>

      {showSettings && (
        <SettingsSheet roomState={roomState} roomId={roomId} onClose={onCloseSettings} />
      )}
    </div>
  );
}
