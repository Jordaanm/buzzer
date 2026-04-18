import { useState } from 'react';
import { JoinSession } from '../types';
import { PLAYER_ICONS, PLAYER_COLORS, PlayerIcon, loadIdentity, saveIdentity } from '../identity';
import PlayerIconRenderer from './PlayerIconRenderer';

interface Props {
  roomId: number;
  hasPassword: boolean;
  onJoin: (session: JoinSession) => void;
}

export default function JoinRoom({ roomId, hasPassword, onJoin }: Props) {
  const saved = loadIdentity();

  const [step, setStep] = useState<'password' | 'identity'>(hasPassword ? 'password' : 'identity');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nickname, setNickname] = useState(saved.nickname ?? '');
  const [icon, setIcon] = useState<PlayerIcon>(saved.icon ?? 'cat');
  const [color, setColor] = useState(saved.color ?? PLAYER_COLORS[0]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) { setPasswordError('Password is required'); return; }
    setPasswordError('');
    setStep('identity');
  };

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    saveIdentity({ nickname: nickname.trim(), icon, color });
    onJoin({ roomId, playerName: nickname.trim(), playerIcon: icon, playerColor: color, password: hasPassword ? password : undefined });
  };

  if (step === 'password') {
    return (
      <div style={styles.page}>
        <h1 style={styles.title}>Room {roomId}</h1>
        <p style={styles.subtitle}>This room is password protected.</p>
        <form onSubmit={handlePasswordSubmit} style={styles.form}>
          <label style={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter room password"
              autoFocus
            />
          </label>
          {passwordError && <p style={styles.error}>{passwordError}</p>}
          <button type="submit" style={styles.btn}>Continue</button>
        </form>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Join Room {roomId}</h1>
      <form onSubmit={handleIdentitySubmit} style={styles.form}>
        <label style={styles.label}>
          Nickname
          <input
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="Enter your name"
            autoFocus
          />
        </label>

        <div style={styles.section}>
          <span style={styles.sectionLabel}>Icon</span>
          <div style={styles.iconGrid}>
            {PLAYER_ICONS.map(i => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                style={{
                  ...styles.iconBtn,
                  background: icon === i ? '#2a2a4a' : 'transparent',
                  borderColor: icon === i ? '#6366f1' : '#333',
                }}
              >
                <PlayerIconRenderer icon={i} color={color} size={22} />
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <span style={styles.sectionLabel}>Color</span>
          <div style={styles.colorRow}>
            {PLAYER_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  ...styles.colorBtn,
                  background: c,
                  outline: color === c ? `2px solid #fff` : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>
        </div>

        <div style={styles.preview}>
          <PlayerIconRenderer icon={icon} color={color} size={36} />
          <span style={{ fontWeight: 600 }}>{nickname || 'Preview'}</span>
        </div>

        <button type="submit" style={styles.btn} disabled={!nickname.trim()}>
          Join Room
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '1.5rem',
    padding: '2rem 1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    letterSpacing: '-0.5px',
    margin: 0,
  },
  subtitle: {
    color: '#888',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    width: '100%',
    maxWidth: '360px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    fontSize: '0.9rem',
    color: '#aaa',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  sectionLabel: {
    fontSize: '0.85rem',
    color: '#aaa',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gap: '4px',
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    border: '1px solid #333',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'border-color 0.1s, background 0.1s',
  },
  colorRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
  },
  colorBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
  },
  preview: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    background: '#1a1a2e',
    borderRadius: '8px',
    border: '1px solid #2a2a4a',
  },
  btn: {
    padding: '0.75rem',
    fontWeight: 600,
    fontSize: '1rem',
  },
  error: {
    color: '#f87171',
    fontSize: '0.85rem',
    margin: 0,
  },
};
