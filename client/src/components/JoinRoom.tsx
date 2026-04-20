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
        <div style={formContainerStyle}>
          <div style={labelStyle}>ROOM LOCKED</div>
          <h1 style={titleStyle}>Room {roomId}</h1>
          <p style={passwordHintStyle}>This room requires a password.</p>
          <form onSubmit={handlePasswordSubmit} style={passwordFormStyle}>
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
            {passwordError && <div style={passwordErrorStyle}>Password is required</div>}
            <ChunkyButton color={T.yellow}>Continue →</ChunkyButton>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={formContainerStyle}>
        {hasPassword && (
          <button onClick={() => setStep('password')} style={backBtnStyle}>
            <ArrowLeft /> BACK
          </button>
        )}

        <div style={labelStyle}>ROOM {String(roomId).padStart(2, '0')}</div>
        <h1 style={{ ...titleStyle, marginBottom: 28 }}>Who are you?</h1>

        <form onSubmit={handleIdentitySubmit} style={identityFormStyle}>
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
            <div style={iconGridStyle}>
              {PLAYER_ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  style={{
                    ...iconPickerItemStyle,
                    border: `2px solid ${icon === i ? T.yellow : T.border}`,
                    background: icon === i ? 'rgba(255,210,63,0.12)' : T.bg2,
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
            <div style={colorGridStyle}>
              {PLAYER_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    ...colorSwatchStyle,
                    background: c,
                    border: color === c ? `3px solid ${T.ink}` : `3px solid ${T.bg2}`,
                    boxShadow: color === c ? `0 0 0 2px ${T.yellow}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={previewCardStyle}>
            <PlayerIconRenderer icon={icon} color={color} size={36} />
            <span style={previewNameStyle}>{nickname || 'Your name'}</span>
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

const formContainerStyle: React.CSSProperties = { width: '100%', maxWidth: 360 };

const passwordHintStyle: React.CSSProperties = { color: T.inkDim, marginBottom: 24, fontSize: 14 };

const passwordFormStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16 };

const passwordErrorStyle: React.CSSProperties = {
  color: T.red, fontSize: 13,
  fontFamily: '"JetBrains Mono", monospace', textAlign: 'center',
};

const backBtnStyle: React.CSSProperties = {
  appearance: 'none', border: 'none', background: 'transparent',
  color: T.inkDim, cursor: 'pointer', padding: '0 0 16px',
  display: 'flex', alignItems: 'center', gap: 6,
  fontFamily: '"JetBrains Mono", monospace', fontSize: 12, letterSpacing: 1,
};

const identityFormStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 20 };

const iconGridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4,
};

const iconPickerItemStyle: React.CSSProperties = {
  appearance: 'none',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '7px', borderRadius: 4,
  cursor: 'pointer',
  transition: 'border-color 80ms, background 80ms',
  aspectRatio: '1',
};

const colorGridStyle: React.CSSProperties = { display: 'flex', gap: 8, flexWrap: 'wrap' };

const colorSwatchStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: '50%',
  cursor: 'pointer', transition: 'box-shadow 80ms',
};

const previewCardStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '14px 16px',
  background: T.bg2,
  border: `3px solid ${T.border}`,
  borderRadius: 6,
  boxShadow: `4px 4px 0 0 ${T.shadow}`,
};

const previewNameStyle: React.CSSProperties = {
  fontWeight: 700, fontSize: 18, letterSpacing: -0.3,
};
