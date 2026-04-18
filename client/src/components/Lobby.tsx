import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, DoorOpen } from 'lucide-react';

interface RoomSummary {
  id: number;
  name: string;
  icon: string;
  playerCount: number;
  hasPassword: boolean;
}

const API_BASE = 'http://localhost:3001';
const POLL_INTERVAL = 10_000;

export default function Lobby() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [kicked, setKicked] = useState(false);

  useEffect(() => {
    const flag = sessionStorage.getItem('kicked');
    if (flag) {
      setKicked(true);
      sessionStorage.removeItem('kicked');
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetch_ = () =>
      fetch(`${API_BASE}/api/lobby`)
        .then(r => r.json())
        .then((data: RoomSummary[]) => { if (active) setRooms(data); })
        .catch(() => {});

    fetch_();
    const timer = setInterval(fetch_, POLL_INTERVAL);
    return () => { active = false; clearInterval(timer); };
  }, []);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Buzzer</h1>

      {kicked && (
        <div style={styles.kickedBanner}>
          You were removed from the room by the host.
        </div>
      )}

      <div style={styles.grid}>
        {rooms.map(room => (
          <button
            key={room.id}
            style={styles.card}
            onClick={() => navigate(`/room/${room.id}`)}
          >
            <div style={styles.cardIcon}>
              <DoorOpen size={28} />
            </div>
            <div style={styles.cardBody}>
              <span style={styles.cardName}>{room.name}</span>
              <span style={styles.cardMeta}>
                {room.playerCount} {room.playerCount === 1 ? 'player' : 'players'}
              </span>
            </div>
            {room.hasPassword && (
              <Lock size={16} style={styles.lockIcon} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3rem 1rem',
    minHeight: '100vh',
    gap: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    letterSpacing: '-1px',
  },
  kickedBanner: {
    background: '#3b1a1a',
    border: '1px solid #7f1d1d',
    color: '#fca5a5',
    padding: '0.75rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    maxWidth: '520px',
    width: '100%',
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
    width: '100%',
    maxWidth: '820px',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: '#1a1a2e',
    border: '1px solid #2a2a4a',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'inherit',
    transition: 'border-color 0.15s',
  },
  cardIcon: {
    color: '#6366f1',
    flexShrink: 0,
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    flex: 1,
    minWidth: 0,
  },
  cardName: {
    fontWeight: 600,
    fontSize: '0.95rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardMeta: {
    fontSize: '0.8rem',
    color: '#888',
  },
  lockIcon: {
    color: '#888',
    flexShrink: 0,
  },
};
