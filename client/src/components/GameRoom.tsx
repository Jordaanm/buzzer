import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { socket } from '../socket';
import { JoinSession, RoomState } from '../types';
import { PlayerIcon } from '../identity';
import PlayerIconRenderer from './PlayerIconRenderer';
import { ROOM_ICONS, RoomIconRenderer } from '../roomIcons.tsx';

interface Props {
  session: JoinSession;
  onLeave: () => void;
}

type BuzzerState = 'disarmed' | 'armed' | 'winner' | 'locked-out';

const PAGE_BG: Record<BuzzerState, string> = {
  disarmed:   '#0f0f1a',
  armed:      '#1a0d0d',
  winner:     '#0a1a0a',
  'locked-out': '#0f0f1a',
};

const BUZZER_BG: Record<BuzzerState, string> = {
  disarmed:    '#2a2a3a',
  armed:       '#e74c3c',
  winner:      '#22c55e',
  'locked-out': '#1e1e2e',
};

const BUZZER_SHADOW: Record<BuzzerState, string> = {
  disarmed:    '0 6px 0 #1a1a2a',
  armed:       '0 10px 0 #9b2525, 0 0 40px #e74c3c88',
  winner:      '0 10px 0 #15803d, 0 0 40px #22c55e88',
  'locked-out': '0 2px 0 #111',
};

const BUZZER_LABEL: Record<BuzzerState, string> = {
  disarmed:    'LOCKED',
  armed:       'BUZZ!',
  winner:      'YOU WIN!',
  'locked-out': 'TOO SLOW',
};

const STATUS_TEXT: Record<BuzzerState, string> = {
  disarmed:    'Waiting for host to arm buzzers…',
  armed:       'Buzzers are live — go!',
  winner:      'You buzzed first!',
  'locked-out': '',   // replaced by winner name below
};

export default function GameRoom({ session, onLeave }: Props) {
  const { roomId, playerName } = session;
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const navigate = useNavigate();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
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
    socket.on('room-state', (state: RoomState) => setRoomState(state));
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
      <div style={{ ...styles.page, background: '#0f0f1a', justifyContent: 'center' }}>
        <p style={{ color: '#555' }}>Connecting…</p>
      </div>
    );
  }

  const me = roomState.players.find(p => p.id === socket.id);
  const isHost = me?.isHost ?? false;
  const iWon = roomState.state === 'winner' && roomState.winnerId === socket.id;
  const winnerPlayer = roomState.winnerId
    ? roomState.players.find(p => p.id === roomState.winnerId)
    : null;

  const buzzerState: BuzzerState =
    roomState.state === 'disarmed' ? 'disarmed'
    : roomState.state === 'armed'  ? 'armed'
    : iWon                         ? 'winner'
    :                                'locked-out';

  const canBuzz = buzzerState === 'armed';

  console.log("Debug GameRoom", {roomState, me, isHost, iWon, winnerPlayer})

  const handleBuzz = () => socket.emit('buzz', { roomId });
  const handleResetRound = () => socket.emit('reset-round', { roomId });
  const handleArmBuzzers = () => socket.emit('arm-buzzers', { roomId });
  const handleKick = (targetPlayerId: string) => socket.emit('kick-player', { roomId, targetPlayerId });

  const startEditName = () => {
    setNameInput(roomState?.name ?? '');
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  };
  const commitName = () => {
    const name = nameInput.trim();
    if (name && name !== roomState?.name) {
      socket.emit('update-room-meta', { roomId, name });
    }
    setEditingName(false);
  };
  const handleNameKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitName();
    if (e.key === 'Escape') setEditingName(false);
  };
  const handleIconPick = (icon: string) => {
    socket.emit('update-room-meta', { roomId, icon });
    setShowIconPicker(false);
  };
  const handlePasswordSave = () => {
    socket.emit('update-password', { roomId, password: passwordInput.trim() || null });
    setShowPasswordModal(false);
    setPasswordInput('');
  };

  return (
    <div style={{ ...styles.page, background: PAGE_BG[buzzerState] }}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          {/* Room icon */}
          <button
            onClick={isHost ? () => setShowIconPicker(v => !v) : undefined}
            style={{ ...styles.iconBtn, cursor: isHost ? 'pointer' : 'default' }}
            title={isHost ? 'Change room icon' : undefined}
          >
            <RoomIconRenderer icon={roomState.icon} size={22} color="#6366f1" />
          </button>

          {/* Room name — inline edit for host */}
          {isHost && editingName ? (
            <input
              ref={nameInputRef}
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={commitName}
              onKeyDown={handleNameKey}
              style={styles.nameInput}
              maxLength={32}
              autoFocus
            />
          ) : (
            <span
              style={{ ...styles.roomName, cursor: isHost ? 'text' : 'default' }}
              onClick={isHost ? startEditName : undefined}
              title={isHost ? 'Click to rename' : undefined}
            >
              {roomState.name}
            </span>
          )}

          {/* Padlock — host only */}
          {isHost && (
            <button
              onClick={() => { setPasswordInput(''); setShowPasswordModal(true); }}
              style={styles.lockBtn}
              title={roomState.hasPassword ? 'Change/remove password' : 'Set password'}
            >
              <Lock size={15} color={roomState.hasPassword ? '#facc15' : '#555'} />
            </button>
          )}
        </div>
        <button onClick={onLeave} style={styles.leaveBtn}>Leave</button>
      </header>

      {/* Room icon picker overlay */}
      {isHost && showIconPicker && (
        <div style={styles.overlay} onClick={() => setShowIconPicker(false)}>
          <div style={styles.pickerPanel} onClick={e => e.stopPropagation()}>
            <p style={styles.pickerTitle}>Room Icon</p>
            <div style={styles.iconGrid}>
              {ROOM_ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => handleIconPick(icon)}
                  style={{
                    ...styles.iconGridBtn,
                    background: roomState.icon === icon ? '#2a2a4a' : 'transparent',
                    borderColor: roomState.icon === icon ? '#6366f1' : '#333',
                  }}
                >
                  <RoomIconRenderer icon={icon} size={20} color="#aaa" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Password modal */}
      {isHost && showPasswordModal && (
        <div style={styles.overlay} onClick={() => setShowPasswordModal(false)}>
          <div style={styles.pickerPanel} onClick={e => e.stopPropagation()}>
            <p style={styles.pickerTitle}>Room Password</p>
            <input
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePasswordSave()}
              placeholder="Leave empty to remove password"
              style={styles.passwordInput}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button onClick={handlePasswordSave} style={styles.modalSaveBtn}>Save</button>
              <button onClick={() => setShowPasswordModal(false)} style={styles.modalCancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      <div style={styles.statusRow}>
        <p style={{ ...styles.statusText, color: buzzerState === 'armed' ? '#facc15' : buzzerState === 'winner' ? '#4ade80' : '#555' }}>
          {buzzerState === 'locked-out' && winnerPlayer
            ? `${winnerPlayer.name} buzzed first!`
            : STATUS_TEXT[buzzerState]}
        </p>
      </div>

      {/* Buzzer */}
      <div style={styles.buzzerWrap}>
        <button
          onClick={handleBuzz}
          disabled={!canBuzz}
          style={{
            ...styles.buzzer,
            background: BUZZER_BG[buzzerState],
            boxShadow: BUZZER_SHADOW[buzzerState],
            transform: canBuzz ? 'none' : 'translateY(4px)',
            cursor: canBuzz ? 'pointer' : 'default',
            color: buzzerState === 'disarmed' || buzzerState === 'locked-out' ? '#444' : '#fff',
          }}
        >
          {BUZZER_LABEL[buzzerState]}
        </button>
      </div>

      {/* Host controls */}
      {isHost && (
        <div style={styles.hostControls}>
          {roomState.state === 'disarmed' && (
            <button onClick={handleArmBuzzers} style={styles.armBtn}>Arm Buzzers</button>
          )}
          {(roomState.state === 'armed' || roomState.state === 'winner') && (
            <button onClick={handleResetRound} style={styles.resetBtn}>Reset Round</button>
          )}
        </div>
      )}

      {/* Winner display (host only, winner state) */}
      {isHost && roomState.state === 'winner' && winnerPlayer ? (
        <div style={styles.winnerCard}>
          <PlayerIconRenderer
            icon={winnerPlayer.icon as PlayerIcon}
            color={winnerPlayer.color}
            size={56}
          />
          <span style={styles.winnerName}>{winnerPlayer.name}</span>
          <span style={styles.winnerLabel}>buzzed first!</span>
        </div>
      ) : (
        /* Player panel — visible during disarmed and armed (and for non-hosts always) */
        <div style={styles.playerList}>
          <h3 style={styles.playerListTitle}>Players ({roomState.players.length})</h3>
          <ul style={styles.players}>
            {roomState.players.map(player => {
              const isWinner = roomState.winnerId === player.id;
              return (
                <li
                  key={player.id}
                  style={{
                    ...styles.playerItem,
                    borderColor: isWinner ? '#22c55e' : 'transparent',
                  }}
                >
                  <div style={styles.playerLeft}>
                    <PlayerIconRenderer
                      icon={player.icon as PlayerIcon}
                      color={player.color}
                      size={20}
                    />
                    <span style={styles.playerName}>{player.name}</span>
                  </div>
                  <div style={styles.badges}>
                    {player.id === socket.id && <span style={styles.badge}>You</span>}
                    {player.isHost && <span style={{ ...styles.badge, background: '#5865f2' }}>Host</span>}
                    {isWinner && <span style={{ ...styles.badge, background: '#22c55e', color: '#fff' }}>Buzzed!</span>}
                    {isHost && player.id !== socket.id && (
                      <button
                        onClick={() => handleKick(player.id)}
                        style={styles.kickBtn}
                      >
                        Kick
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '1.5rem 1rem',
    gap: '1.5rem',
    transition: 'background 0.4s',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '480px',
    position: 'relative' as const,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
  },
  roomName: {
    fontSize: '1.1rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  nameInput: {
    fontSize: '1.1rem',
    fontWeight: 700,
    background: '#1a1a2e',
    border: '1px solid #6366f1',
    borderRadius: '6px',
    color: '#e8e8f0',
    padding: '0.1rem 0.4rem',
    width: '160px',
    outline: 'none',
  },
  lockBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  leaveBtn: {
    background: 'transparent',
    color: '#555',
    border: '1px solid #333',
    padding: '0.35rem 0.75rem',
    fontSize: '0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: '#00000088',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  pickerPanel: {
    background: '#1a1a2e',
    border: '1px solid #2a2a4a',
    borderRadius: '12px',
    padding: '1.25rem',
    minWidth: '260px',
  },
  pickerTitle: {
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    color: '#555',
    marginBottom: '0.75rem',
  },
  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '6px',
  },
  iconGridBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    border: '1px solid #333',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'border-color 0.1s, background 0.1s',
  },
  passwordInput: {
    width: '100%',
    background: '#0f0f1a',
    border: '1px solid #333',
    borderRadius: '6px',
    color: '#e8e8f0',
    padding: '0.5rem 0.75rem',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  modalSaveBtn: {
    flex: 1,
    padding: '0.5rem',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  modalCancelBtn: {
    flex: 1,
    padding: '0.5rem',
    background: 'transparent',
    color: '#888',
    border: '1px solid #333',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  statusRow: {
    height: '2rem',
    display: 'flex',
    alignItems: 'center',
  },
  statusText: {
    fontSize: '1rem',
    fontWeight: 500,
    transition: 'color 0.3s',
  },
  buzzerWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1 0 auto',
  },
  buzzer: {
    width: 'min(60vw, 260px)',
    height: 'min(60vw, 260px)',
    borderRadius: '50%',
    fontSize: 'clamp(1.4rem, 5vw, 2.2rem)',
    fontWeight: 800,
    border: 'none',
    letterSpacing: '2px',
    transition: 'background 0.25s, box-shadow 0.25s, transform 0.08s, color 0.25s',
  },
  hostControls: {
    display: 'flex',
    gap: '0.75rem',
  },
  armBtn: {
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '0.65rem 1.75rem',
    fontWeight: 700,
    fontSize: '0.95rem',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  resetBtn: {
    background: '#2d2d2d',
    border: '1px solid #555',
    color: '#e8e8f0',
    padding: '0.65rem 1.75rem',
    fontWeight: 600,
    fontSize: '0.95rem',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  winnerCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '2rem',
    background: '#0d1f0d',
    border: '1px solid #22c55e44',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '480px',
  },
  winnerName: {
    fontSize: '1.8rem',
    fontWeight: 800,
    color: '#22c55e',
  },
  winnerLabel: {
    fontSize: '0.9rem',
    color: '#555',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  playerList: {
    width: '100%',
    maxWidth: '480px',
  },
  playerListTitle: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: '#444',
    marginBottom: '0.6rem',
    fontWeight: 600,
  },
  players: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  playerItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.55rem 0.8rem',
    background: '#15152a',
    borderRadius: '8px',
    border: '1px solid transparent',
    transition: 'border-color 0.2s',
  },
  playerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  playerName: {
    fontSize: '0.9rem',
  },
  badges: {
    display: 'flex',
    gap: '0.35rem',
  },
  badge: {
    fontSize: '0.7rem',
    padding: '0.1rem 0.45rem',
    borderRadius: '4px',
    background: '#2a2a3a',
    color: '#aaa',
  },
  kickBtn: {
    fontSize: '0.7rem',
    padding: '0.1rem 0.45rem',
    borderRadius: '4px',
    background: 'transparent',
    border: '1px solid #7f1d1d',
    color: '#f87171',
    cursor: 'pointer',
  },
};
