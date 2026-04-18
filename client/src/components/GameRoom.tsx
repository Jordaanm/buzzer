import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { JoinSession, RoomState } from '../types';
import { PlayerIcon } from '../identity';
import PlayerIconRenderer from './PlayerIconRenderer';
import { ROOM_ICONS, RoomIconRenderer } from '../roomIcons.tsx';
import { T } from '../theme';
import { ChunkyButton } from './ui';

interface Props {
  session: JoinSession;
  onLeave: () => void;
}

// ─── Socket ──────────────────────────────────────────────────────────────────

export default function GameRoom({ session, onLeave }: Props) {
  const { roomId, playerName } = session;
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [round, setRound] = useState(1);
  const prevRoundState = useRef<string | null>(null);
  const navigate = useNavigate();

  // Host editing state
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleConnect = () => {
      socket.emit('join-room', {
        roomId,
        playerName,
        playerIcon: session.playerIcon,
        playerColor: session.playerColor,
        password: session.password,
      });
    };

    socket.on('connect', handleConnect);
    socket.on('room-state', (state: RoomState) => {
      if (prevRoundState.current === 'winner' && state.state === 'disarmed') {
        setRound(r => r + 1);
      }
      prevRoundState.current = state.state;
      setRoomState(state);
    });
    socket.on('kicked', () => {
      sessionStorage.setItem('kicked', '1');
      socket.disconnect();
      navigate('/');
    });
    socket.on('error', ({ message }: { message: string }) => {
      console.error('Room error:', message);
    });

    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('room-state');
      socket.off('kicked');
      socket.off('error');
      socket.disconnect();
    };
  }, [roomId, playerName, session, navigate]);

  if (!roomState) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: T.bg,
        color: T.inkDim, fontFamily: '"JetBrains Mono", monospace',
        fontSize: 13, letterSpacing: 2,
      }}>
        CONNECTING…
      </div>
    );
  }

  const me = roomState.players.find(p => p.id === socket.id);
  const isHost = me?.isHost ?? false;
  const iWon = roomState.state === 'winner' && roomState.winnerId === socket.id;
  const winnerPlayer = roomState.winnerId
    ? roomState.players.find(p => p.id === roomState.winnerId)
    : null;

  const handleBuzz = () => socket.emit('buzz', { roomId });
  const handleReset = () => socket.emit('reset-round', { roomId });
  const handleArm = () => socket.emit('arm-buzzers', { roomId });
  const handleKick = (id: string) => socket.emit('kick-player', { roomId, targetPlayerId: id });

  const startEditName = () => {
    setNameInput(roomState.name);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  };
  const commitName = () => {
    const name = nameInput.trim();
    if (name && name !== roomState.name) socket.emit('update-room-meta', { roomId, name });
    setEditingName(false);
  };
  const handleNameKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitName();
    if (e.key === 'Escape') setEditingName(false);
  };

  const roundLabel = String(round).padStart(2, '0');

  if (isHost) {
    return (
      <HostView
        roomState={roomState}
        roundLabel={roundLabel}
        winnerPlayer={winnerPlayer ?? null}
        editingName={editingName}
        nameInput={nameInput}
        nameInputRef={nameInputRef}
        showSettings={showSettings}
        onLeave={onLeave}
        onStartEditName={startEditName}
        onCommitName={commitName}
        onNameKey={handleNameKey}
        onNameInput={setNameInput}
        onArm={handleArm}
        onReset={handleReset}
        onKick={handleKick}
        onOpenSettings={() => setShowSettings(true)}
        onCloseSettings={() => setShowSettings(false)}
        roomId={roomId}
      />
    );
  }

  return (
    <PlayerView
      roomState={roomState}
      roundLabel={roundLabel}
      me={me ?? null}
      winnerPlayer={winnerPlayer ?? null}
      iWon={iWon}
      onLeave={onLeave}
      onBuzz={handleBuzz}
    />
  );
}

// ─── Host View ────────────────────────────────────────────────────────────────

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
}

function HostView({
  roomState, roundLabel, winnerPlayer, editingName, nameInput, nameInputRef,
  showSettings, onLeave, onStartEditName, onCommitName, onNameKey, onNameInput,
  onArm, onReset, onKick, onOpenSettings, onCloseSettings, roomId,
}: HostViewProps) {
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

// ─── Settings Sheet ───────────────────────────────────────────────────────────

function SettingsSheet({ roomState, roomId, onClose }: {
  roomState: RoomState;
  roomId: number;
  onClose: () => void;
}) {
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

  const handleToggleLock = () => {
    if (roomState.hasPassword) {
      socket.emit('update-password', { roomId, password: null });
    } else {
      setShowIconPicker(false);
    }
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

          {/* Lock room */}
          <div>
            <label style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: 12, cursor: 'pointer',
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>Lock room</div>
                <div style={{ fontSize: 13, color: T.inkDim }}>Require password to join</div>
              </div>
              <Toggle value={roomState.hasPassword} onChange={handleToggleLock} />
            </label>
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

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={e => { e.preventDefault(); onChange(); }}
      style={{
        appearance: 'none',
        border: `2px solid ${T.border}`,
        background: value ? T.green : '#444',
        width: 56, height: 32, borderRadius: 18,
        position: 'relative', cursor: 'pointer', padding: 0,
        transition: 'background 150ms',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 2, left: value ? 26 : 2,
        width: 24, height: 24, borderRadius: '50%',
        background: T.ink, border: `2px solid ${T.border}`,
        boxSizing: 'border-box',
        transition: 'left 150ms',
      }} />
    </button>
  );
}

// ─── Player View ──────────────────────────────────────────────────────────────

interface PlayerViewProps {
  roomState: RoomState;
  roundLabel: string;
  me: RoomState['players'][0] | null;
  winnerPlayer: RoomState['players'][0] | null;
  iWon: boolean;
  onLeave: () => void;
  onBuzz: () => void;
}

function PlayerView({ roomState, roundLabel, me, winnerPlayer, iWon, onLeave, onBuzz }: PlayerViewProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: T.bg, color: T.ink,
      minHeight: '100vh',
      fontFamily: '"Space Grotesk", system-ui',
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
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10, letterSpacing: 2, color: T.cyan,
            textTransform: 'uppercase', marginBottom: 2,
          }}>PLAYER · ROUND {roundLabel}</div>
          <div style={{
            fontSize: 17, fontWeight: 800, letterSpacing: -0.2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{roomState.name}</div>
        </div>
        {me && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', border: `2px solid ${T.border}`,
            background: T.bg, borderRadius: 999,
            minWidth: 0, maxWidth: 130, flexShrink: 0,
            boxShadow: `2px 2px 0 0 ${T.shadow}`,
          }}>
            <PlayerIconRenderer icon={me.icon as PlayerIcon} color={me.color} size={18} />
            <div style={{
              fontSize: 13, fontWeight: 700,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              color: T.ink,
            }}>{me.name}</div>
          </div>
        )}
      </div>

      <SlabBuzzer
        armed={roomState.state === 'armed'}
        won={iWon}
        lockedOut={!iWon && !!winnerPlayer}
        onBuzz={onBuzz}
      />

      {/* Winner bar (shown when someone else won) */}
      {winnerPlayer && !iWon && (
        <div style={{
          padding: '14px 20px 28px',
          borderTop: `3px solid ${T.border}`,
          background: T.bg2,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <PlayerIconRenderer
            icon={winnerPlayer.icon as PlayerIcon}
            color={winnerPlayer.color}
            size={40}
          />
          <div>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10, letterSpacing: 2, color: T.inkDim,
              textTransform: 'uppercase',
            }}>buzzed first</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{winnerPlayer.name}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Slab Buzzer ─────────────────────────────────────────────────────────────

function SlabBuzzer({ armed, won, lockedOut, onBuzz }: {
  armed: boolean;
  won: boolean;
  lockedOut: boolean;
  onBuzz: () => void;
}) {
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

// ─── Shared Icons ─────────────────────────────────────────────────────────────

function BackIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <path d="M14 6l-6 6 6 6" stroke={T.ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrownIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 7l4 4 5-6 5 6 4-4-2 12H5L3 7z" fill={T.yellow} stroke="#0a0502" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const iconBtnStyle: React.CSSProperties = {
  appearance: 'none',
  border: `2px solid ${T.border}`,
  background: T.bg,
  width: 44, height: 44, borderRadius: 4,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
  boxShadow: `3px 3px 0 0 ${T.shadow}`,
};

const sheetLabelStyle: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: 10, letterSpacing: 2, color: T.inkDim,
  textTransform: 'uppercase', marginBottom: 8, fontWeight: 700,
};
