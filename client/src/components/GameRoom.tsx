import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { JoinSession, RoomState } from '../types';

interface Props {
  session: JoinSession;
  onLeave: () => void;
}

export default function GameRoom({ session, onLeave }: Props) {
  const { roomId, playerName, isHost } = session;
  const [roomState, setRoomState] = useState<RoomState | null>(null);

  useEffect(() => {
    socket.connect();
    socket.emit('join-room', { roomId, playerName, isHost });

    socket.on('room-update', (state: RoomState) => {
      setRoomState(state);
    });

    return () => {
      socket.off('room-update');
      socket.disconnect();
    };
  }, [roomId, playerName, isHost]);

  const handleBuzz = () => {
    socket.emit('buzz', { roomId });
  };

  const handleReset = () => {
    socket.emit('reset', { roomId });
  };

  if (!roomState) {
    return <div style={styles.page}><p>Connecting...</p></div>;
  }

  const buzzedPlayer = roomState.buzzedBy
    ? roomState.players.find(p => p.id === roomState.buzzedBy)
    : null;
  const iMadeTheBuzz = roomState.buzzedBy === socket.id;
  const canBuzz = !roomState.locked;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <span style={styles.roomLabel}>Room</span>
          <span style={styles.roomCode}>{roomId}</span>
        </div>
        <button onClick={onLeave} style={styles.leaveBtn}>Leave</button>
      </header>

      <div style={styles.status}>
        {buzzedPlayer ? (
          <p style={{ ...styles.statusText, color: iMadeTheBuzz ? '#4ade80' : '#f87171' }}>
            {iMadeTheBuzz ? 'You buzzed first!' : `${buzzedPlayer.name} buzzed first!`}
          </p>
        ) : (
          <p style={{ ...styles.statusText, color: '#888' }}>Waiting for a buzz...</p>
        )}
      </div>

      <button
        onClick={handleBuzz}
        disabled={!canBuzz}
        style={{
          ...styles.buzzer,
          background: canBuzz ? '#e74c3c' : '#444',
          boxShadow: canBuzz ? '0 8px 0 #9b2525' : '0 4px 0 #333',
          transform: canBuzz ? 'none' : 'translateY(4px)',
        }}
      >
        BUZZ!
      </button>

      {isHost && (
        <button onClick={handleReset} style={styles.resetBtn}>
          Reset Round
        </button>
      )}

      <div style={styles.playerList}>
        <h3 style={styles.playerListTitle}>Players ({roomState.players.length})</h3>
        <ul style={styles.players}>
          {roomState.players.map(player => (
            <li key={player.id} style={styles.playerItem}>
              <span>{player.name}</span>
              <span style={styles.badges}>
                {player.id === socket.id && <span style={styles.badge}>You</span>}
                {player.isHost && <span style={{ ...styles.badge, background: '#5865f2' }}>Host</span>}
                {roomState.buzzedBy === player.id && <span style={{ ...styles.badge, background: '#e74c3c' }}>Buzzed</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2rem',
    padding: '2rem 1rem',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '400px',
  },
  roomLabel: {
    fontSize: '0.85rem',
    color: '#888',
    marginRight: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  roomCode: {
    fontSize: '1.4rem',
    fontWeight: 700,
    letterSpacing: '2px',
  },
  leaveBtn: {
    background: 'transparent',
    color: '#888',
    border: '1px solid #444',
    padding: '0.4rem 0.8rem',
    fontSize: '0.85rem',
  },
  status: {
    height: '2.5rem',
    display: 'flex',
    alignItems: 'center',
  },
  statusText: {
    fontSize: '1.3rem',
    fontWeight: 600,
  },
  buzzer: {
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    fontSize: '2rem',
    fontWeight: 700,
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: '2px',
    transition: 'transform 0.08s, box-shadow 0.08s',
  },
  resetBtn: {
    background: '#2d2d2d',
    border: '1px solid #555',
    color: '#e8e8f0',
    padding: '0.6rem 1.5rem',
  },
  playerList: {
    width: '100%',
    maxWidth: '400px',
  },
  playerListTitle: {
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: '#888',
    marginBottom: '0.75rem',
  },
  players: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  playerItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.6rem 0.8rem',
    background: '#1a1a2e',
    borderRadius: '6px',
    fontSize: '0.95rem',
  },
  badges: {
    display: 'flex',
    gap: '0.4rem',
  },
  badge: {
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    background: '#333',
    color: '#ccc',
  },
};
