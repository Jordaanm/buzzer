
// ─── Host View ────────────────────────────────────────────────────────────────

import { PlayerIcon } from "../identity";
import { T } from "../theme";
import { RoomState } from "../types";
import { BackIcon, CrownIcon, SoundIcon } from "./icons";
import PlayerIconRenderer from "./PlayerIconRenderer";
import { SettingsSheet } from "./RoomSettingsSheet";
import { iconBtnStyle } from "./styles";
import { ChunkyButton } from "./ui";

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

  const statusBg = hasWinner ? T.yellow : armed ? T.red : T.bg2;
  const statusText = hasWinner
    ? `${winnerPlayer!.name} buzzed in!`
    : armed ? 'Buzzers armed' : 'Buzzers off';
  const statusColor = hasWinner ? T.border : armed ? T.ink : T.inkDim;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: T.bg, color: T.ink,
      minHeight: '100vh',
      fontFamily: '"Space Grotesk", system-ui',
      maxWidth: 1280, margin: '0 auto', width: '100%',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '16px 16px 14px',
        background: T.bg2,
        borderBottom: `3px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={onLeave} style={iconBtnStyle}>
          <BackIcon />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10, letterSpacing: 2, color: T.yellow,
            textTransform: 'uppercase', marginBottom: 2,
          }}>
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
              style={{
                fontSize: 17, fontWeight: 800, letterSpacing: -0.2,
                background: 'rgba(255,255,255,0.08)', border: `2px solid ${T.yellow}`,
                borderRadius: 4, color: T.ink, padding: '2px 6px',
                outline: 'none', width: '100%',
              }}
            />
          ) : (
            <div
              onClick={onStartEditName}
              title="Click to rename"
              style={{
                fontSize: 17, fontWeight: 800, letterSpacing: -0.2,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                cursor: 'text',
              }}
            >{roomState.name}</div>
          )}
        </div>
        <button onClick={onToggleSound} style={iconBtnStyle} title={soundOn ? 'Mute' : 'Unmute'}>
          <SoundIcon on={soundOn} />
        </button>
        <button
          onClick={onOpenSettings}
          style={{
            ...iconBtnStyle,
            background: T.yellow, color: T.border, fontSize: 18,
          }}
        >⚙</button>
      </div>

      {/* Status banner */}
      <div style={{
        padding: '12px 20px',
        background: statusBg,
        borderBottom: `3px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 10,
        transition: 'background 200ms',
        minHeight: 48,
      }}>
        {(armed || hasWinner) && (
          <div style={{
            width: 11, height: 11, borderRadius: '50%',
            background: hasWinner ? T.border : T.ink,
            animation: armed && !hasWinner ? 'bz-pulse 1s ease-in-out infinite' : 'none',
            flexShrink: 0,
          }} />
        )}
        <div style={{
          fontSize: 15, fontWeight: 800, letterSpacing: 0.5,
          color: statusColor, textTransform: 'uppercase',
          transition: 'color 200ms',
        }}>{statusText}</div>
      </div>

      {/* Content: winner spotlight or player grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {hasWinner ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '24px 8px 32px', gap: 16,
            animation: 'bz-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 11, letterSpacing: 3, color: T.yellow,
              textTransform: 'uppercase',
            }}>★ First to buzz ★</div>
            <div style={{
              animation: 'bz-bob 1.4s ease-in-out infinite',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PlayerIconRenderer
                icon={winnerPlayer!.icon as PlayerIcon}
                color={winnerPlayer!.color}
                size={80}
              />
            </div>
            <div style={{
              fontSize: 44, fontWeight: 900, letterSpacing: -1,
              textAlign: 'center', lineHeight: 1,
            }}>{winnerPlayer!.name}</div>
          </div>
        ) : (
          <div>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10, letterSpacing: 2, color: T.inkDim,
              textTransform: 'uppercase', marginBottom: 10, paddingLeft: 2,
            }}>Players · {roomState.players.length}</div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
            }}>
              {roomState.players.map(p => (
                <div key={p.id} style={{
                  border: `2px solid ${T.border}`,
                  background: p.isHost ? T.yellow : T.bg2,
                  borderRadius: 6,
                  padding: '12px 8px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 6,
                  position: 'relative',
                  boxShadow: `3px 3px 0 0 ${T.shadow}`,
                }}>
                  {p.isHost && (
                    <div style={{ position: 'absolute', top: -9, right: -9 }}>
                      <CrownIcon size={18} />
                    </div>
                  )}
                  <PlayerIconRenderer
                    icon={p.icon as PlayerIcon}
                    color={p.color}
                    size={28}
                  />
                  <div style={{
                    fontSize: 12, fontWeight: 700, letterSpacing: -0.2,
                    color: p.isHost ? T.border : T.ink,
                    maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', textAlign: 'center',
                  }}>{p.name}</div>
                  {!p.isHost && (
                    <button
                      onClick={() => onKick(p.id)}
                      style={{
                        fontSize: 10, padding: '2px 6px',
                        border: `1px solid ${T.redDark}`, borderRadius: 3,
                        background: 'transparent', color: '#f87171',
                        cursor: 'pointer', fontFamily: '"JetBrains Mono", monospace',
                        letterSpacing: 0.5, textTransform: 'uppercase',
                      }}
                    >kick</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Primary action */}
      <div style={{
        padding: '14px 16px 28px',
        background: T.bg2,
        borderTop: `3px solid ${T.border}`,
      }}>
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

      {/* Settings sheet */}
      {showSettings && (
        <SettingsSheet
          roomState={roomState}
          roomId={roomId}
          onClose={onCloseSettings}
        />
      )}
    </div>
  );
}
