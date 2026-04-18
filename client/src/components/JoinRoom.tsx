import { useState } from 'react';
import { JoinSession } from '../types';

interface Props {
  onJoin: (session: JoinSession) => void;
}

export default function JoinRoom({ onJoin }: Props) {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isHost, setIsHost] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !roomId.trim()) return;
    onJoin({ playerName: playerName.trim(), roomId: roomId.trim().toUpperCase(), isHost });
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Buzzer App</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Your Name
          <input
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            autoFocus
          />
        </label>
        <label style={styles.label}>
          Room Code
          <input
            value={roomId}
            onChange={e => setRoomId(e.target.value.toUpperCase())}
            placeholder="e.g. QUIZ1"
          />
        </label>
        <label style={styles.checkboxLabel}>
          <input type="checkbox" checked={isHost} onChange={e => setIsHost(e.target.checked)} />
          Join as Host
        </label>
        <button type="submit" style={{ width: '100%', padding: '0.75rem' }}>
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
    gap: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    letterSpacing: '-0.5px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
    maxWidth: '320px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    fontSize: '0.9rem',
    color: '#aaa',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
};
