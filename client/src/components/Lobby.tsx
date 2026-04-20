import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../theme';
import './Lobby.css';

interface RoomSummary {
  id: number;
  name: string;
  icon: string;
  playerCount: number;
  hasPassword: boolean;
}

const API_BASE = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';
const POLL_INTERVAL = 10_000;

function UsersIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3.5" fill="currentColor" />
      <circle cx="17" cy="9" r="2.8" fill="currentColor" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M14 20c0-2.3 1.8-4.5 4-4.5s4 2 4 4.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="10" width="16" height="11" rx="2" fill={color} />
      <path d="M7 10V7a5 5 0 0 1 10 0v3" stroke={color} strokeWidth="2.5" fill="none" />
    </svg>
  );
}

function PlusIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

type FetchStatus = 'pending' | 'ok' | 'error';

export default function Lobby() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [kicked, setKicked] = useState(false);
  const [status, setStatus] = useState<FetchStatus>('pending');

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
        .then((data: RoomSummary[]) => {
          if (active) { setRooms(data); setStatus('ok'); }
        })
        .catch(() => { if (active) setStatus('error'); });

    fetch_();
    const timer = setInterval(fetch_, POLL_INTERVAL);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const occupied = rooms.filter(r => r.playerCount > 0);
  const empty = rooms.filter(r => r.playerCount === 0);

  const statusText = status === 'ok' ? '◆ PLAY NOW ◆' : status === 'error' ? '◆ SERVER UNREACHABLE ◆' : '◆ CONNECTING… ◆';

  return (
    <div className="lobby">
      <div className="lobby__header">
        <div className={`lobby__status-label lobby__status-label--${status}`}>{statusText}</div>
        <h1 className="lobby__title">Buzzr</h1>
        <div className="lobby__subtitle">
          {occupied.length} active {occupied.length === 1 ? 'room' : 'rooms'} · tap an open slot to host
        </div>
      </div>

      {kicked && (
        <div className="lobby__kicked-banner">
          You were removed from the room by the host.
        </div>
      )}

      <div className="lobby__room-list">
        {occupied.map(room => (
          <RoomCard key={room.id} room={room} onClick={() => navigate(`/room/${room.id}`)} />
        ))}
        {empty.map(room => (
          <EmptySlot key={room.id} onClick={() => navigate(`/room/${room.id}`)} />
        ))}
      </div>
    </div>
  );
}

function RoomCard({ room, onClick }: { room: RoomSummary; onClick: () => void }) {
  return (
    <button onClick={onClick} className="lobby__room-card">
      <div className="lobby__room-card-body">
        <div className="lobby__room-card-header-row">
          <div className="lobby__live-dot" />
          <div className="lobby__live-label">LIVE</div>
        </div>
        <div className="lobby__room-card-name">{room.name}</div>
        <div className="lobby__room-card-meta">
          <span className="lobby__room-card-count">
            <UsersIcon />
            <span className="lobby__room-card-count-num">{room.playerCount}</span>
          </span>
        </div>
      </div>
      {room.hasPassword && (
        <div className="lobby__password-badge">
          <LockIcon size={18} color={T.border} />
        </div>
      )}
    </button>
  );
}

function EmptySlot({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="lobby__empty-slot">
      <div className="lobby__empty-slot-icon">
        <PlusIcon size={20} color={T.yellow} />
      </div>
      <div className="lobby__empty-slot-text">
        <div className="lobby__empty-slot-label">OPEN SLOT</div>
        <div className="lobby__empty-slot-name">Start a new room</div>
      </div>
    </button>
  );
}
