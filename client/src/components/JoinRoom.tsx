import { useState } from 'react';
import { JoinSession } from '../types';
import { PLAYER_ICONS, PLAYER_COLORS, PlayerIcon, loadIdentity, saveIdentity } from '../identity';
import PlayerIconRenderer from './PlayerIconRenderer';
import { T } from '../theme';
import { ChunkyButton } from './ui';
import './JoinRoom.css';

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
      <div className="join-room">
        <div className="join-room__form-container">
          <div className="join-room__label">ROOM LOCKED</div>
          <h1 className="join-room__title">Room {roomId}</h1>
          <p className="join-room__password-hint">This room requires a password.</p>
          <form onSubmit={handlePasswordSubmit} className="join-room__password-form">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter password"
              value={password}
              onChange={e => { setPassword(e.target.value); setPasswordError(false); }}
              autoFocus
              className={`join-room__input join-room__input--password${passwordError ? ' join-room__input--error' : ''}`}
            />
            {passwordError && <div className="join-room__password-error">Password is required</div>}
            <ChunkyButton color={T.yellow}>Continue →</ChunkyButton>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="join-room">
      <div className="join-room__form-container">
        {hasPassword && (
          <button onClick={() => setStep('password')} className="join-room__back-btn">
            <ArrowLeft /> BACK
          </button>
        )}

        <div className="join-room__label">ROOM {String(roomId).padStart(2, '0')}</div>
        <h1 className="join-room__title join-room__title--spaced">Who are you?</h1>

        <form onSubmit={handleIdentitySubmit} className="join-room__identity-form">
          <div>
            <div className="join-room__field-label">Nickname</div>
            <input
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Enter your name"
              autoFocus={!hasPassword}
              maxLength={20}
              className="join-room__input"
            />
          </div>

          <div>
            <div className="join-room__field-label">Icon</div>
            <div className="join-room__icon-grid">
              {PLAYER_ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`join-room__icon-picker-item${icon === i ? ' join-room__icon-picker-item--selected' : ''}`}
                >
                  <PlayerIconRenderer icon={i} color={color} size={18} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="join-room__field-label">Color</div>
            <div className="join-room__color-grid">
              {PLAYER_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`join-room__color-swatch${color === c ? ' join-room__color-swatch--selected' : ''}`}
                  style={{ '--bz-player-color': c } as React.CSSProperties}
                />
              ))}
            </div>
          </div>

          <div className="join-room__preview-card">
            <PlayerIconRenderer icon={icon} color={color} size={36} />
            <span className="join-room__preview-name">{nickname || 'Your name'}</span>
          </div>

          <ChunkyButton color={T.yellow} big disabled={!nickname.trim()}>
            Join Room
          </ChunkyButton>
        </form>
      </div>
    </div>
  );
}
