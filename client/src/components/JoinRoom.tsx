import { useState } from 'react';
import { JoinSession } from '../types';
import { PLAYER_ICONS, PLAYER_COLORS, PlayerIcon, loadIdentity, saveIdentity } from '../identity';
import PlayerIconRenderer from './PlayerIconRenderer';
import { T } from '../theme';
import { ChunkyButton } from './ui';

interface Props {
  roomId: number;
  hasPassword: boolean;
  onJoin: (session: JoinSession) => void;
}

function ArrowLeft() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <path d="M14 6l-6 6 6 6" stroke={T.ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function JoinRoom({ roomId, hasPassword, onJoin }: Props) {
  const saved = loadIdentity();

  const [step, setStep] = useState<'password' | 'identity'>(hasPassword ? 'password' : 'identity');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [nickname, setNickname] = useState(saved.nickname ?? '');
  const [icon, setIcon] = useState<PlayerIcon>(saved.icon ?? 'cat');
  const [color, setColor] = useState(saved.color ?? PLAYER_COLORS[0]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) { setPasswordError(true); return; }
    setPasswordError(false);
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
      <div style={pageStyle}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={labelStyle}>ROOM LOCKED</div>
          <h1 style={titleStyle}>Room {roomId}</h1>
          <p style={{ color: T.inkDim, marginBottom: 24, fontSize: 14 }}>
            This room requires a password.
          </p>
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter password"
              value={password}
              onChange={e => { setPassword(e.target.value); setPasswordError(false); }}
              autoFocus
              style={{
                ...inputStyle,
                borderColor: passwordError ? T.red : T.border,
                animation: passwordError ? 'bz-shake 0.3s' : 'none',
                textAlign: 'center',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 22, fontWeight: 700, letterSpacing: 6,
              }}
            />
            {passwordError && (
              <div style={{ color: T.red, fontSize: 13, fontFamily: '"JetBrains Mono", monospace', textAlign: 'center' }}>
                Password is required
              </div>
            )}
            <ChunkyButton color={T.yellow}>Continue →</ChunkyButton>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        {hasPassword && (
          <button
            onClick={() => setStep('password')}
            style={{
              appearance: 'none', border: 'none', background: 'transparent',
              color: T.inkDim, cursor: 'pointer', padding: '0 0 16px',
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: '"JetBrains Mono", monospace', fontSize: 12, letterSpacing: 1,
            }}
          >
            <ArrowLeft /> BACK
          </button>
        )}

        <div style={labelStyle}>ROOM {String(roomId).padStart(2, '0')}</div>
        <h1 style={{ ...titleStyle, marginBottom: 28 }}>Who are you?</h1>

        <form onSubmit={handleIdentitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Nickname */}
          <div>
            <div style={fieldLabelStyle}>Nickname</div>
            <input
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Enter your name"
              autoFocus={!hasPassword}
              maxLength={20}
              style={inputStyle}
            />
          </div>

          {/* Icon picker */}
          <div>
            <div style={fieldLabelStyle}>Icon</div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4,
            }}>
              {PLAYER_ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  style={{
                    appearance: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '7px', borderRadius: 4,
                    border: `2px solid ${icon === i ? T.yellow : T.border}`,
                    background: icon === i ? 'rgba(255,210,63,0.12)' : T.bg2,
                    cursor: 'pointer',
                    transition: 'border-color 80ms, background 80ms',
                    aspectRatio: '1',
                  }}
                >
                  <PlayerIconRenderer icon={i} color={color} size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <div style={fieldLabelStyle}>Color</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PLAYER_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: c,
                    border: color === c ? `3px solid ${T.ink}` : `3px solid ${T.bg2}`,
                    boxShadow: color === c ? `0 0 0 2px ${T.yellow}` : 'none',
                    cursor: 'pointer',
                    transition: 'box-shadow 80ms',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px',
            background: T.bg2,
            border: `3px solid ${T.border}`,
            borderRadius: 6,
            boxShadow: `4px 4px 0 0 ${T.shadow}`,
          }}>
            <PlayerIconRenderer icon={icon} color={color} size={36} />
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.3 }}>
              {nickname || 'Your name'}
            </span>
          </div>

          <ChunkyButton color={T.yellow} big disabled={!nickname.trim()}>
            Join Room
          </ChunkyButton>
        </form>
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: '32px 16px',
  background: T.bg,
  color: T.ink,
};

const titleStyle: React.CSSProperties = {
  fontSize: 32, fontWeight: 900, letterSpacing: -0.5,
  lineHeight: 1.1, marginBottom: 8,
};

const labelStyle: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: 11, letterSpacing: 3, color: T.yellow,
  textTransform: 'uppercase', marginBottom: 4,
};

const fieldLabelStyle: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: 10, letterSpacing: 2, color: T.inkDim,
  textTransform: 'uppercase', marginBottom: 8, fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  border: `3px solid ${T.border}`,
  borderRadius: 4,
  background: T.bg2,
  color: T.ink,
  fontSize: 18,
  fontWeight: 700,
  outline: 'none',
  boxShadow: `4px 4px 0 0 ${T.shadow}`,
};
