import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../theme';

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

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: T.bg, color: T.ink,
      minHeight: '100vh',
      maxWidth: 1280, margin: '0 auto', width: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '48px 20px 24px',
        borderBottom: `3px solid ${T.border}`,
        background: T.bg2,
        position: 'relative',
      }}>
        <div>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11, letterSpacing: 3,
            color: status === 'ok' ? T.yellow : status === 'error' ? T.redDark : T.inkDim,
            textTransform: 'uppercase', marginBottom: 6,
          }}>
            {status === 'ok' ? '◆ LIVE NOW ◆' : status === 'error' ? '◆ SERVER UNREACHABLE ◆' : '◆ CONNECTING… ◆'}
          </div>
          <h1 style={{
            margin: 0, fontSize: 36, fontWeight: 900, letterSpacing: -1,
            lineHeight: 1, color: T.ink,
          }}>Pick a room</h1>
          <div style={{
            marginTop: 6, fontSize: 14, color: T.inkDim,
            fontFamily: '"JetBrains Mono", monospace',
          }}>
            {occupied.length} active · tap an empty slot to host
          </div>
        </div>
      </div>

      {/* Kicked banner */}
      {kicked && (
        <div style={{
          margin: '16px 16px 0',
          background: '#3b1a1a',
          border: `3px solid ${T.redDark}`,
          borderRadius: 4,
          padding: '12px 16px',
          fontSize: 14, fontWeight: 600,
          color: '#fca5a5',
          boxShadow: `4px 4px 0 0 ${T.shadow}`,
        }}>
          You were removed from the room by the host.
        </div>
      )}

      {/* Room list */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 16px 40px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* Occupied rooms */}
        {occupied.map(room => (
          <RoomCard key={room.id} room={room} onClick={() => navigate(`/room/${room.id}`)} />
        ))}

        {/* Empty slots */}
        {empty.map(room => (
          <EmptySlot key={room.id} onClick={() => navigate(`/room/${room.id}`)} />
        ))}
      </div>
    </div>
  );
}

function RoomCard({ room, onClick }: { room: RoomSummary; onClick: () => void }) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        appearance: 'none',
        border: `3px solid ${T.border}`,
        background: T.ink,
        borderRadius: 6,
        padding: '18px',
        cursor: 'pointer',
        textAlign: 'left',
        color: T.border,
        boxShadow: pressed ? '0 0 0 0 #0a0502' : '5px 5px 0 0 #0a0502',
        transform: pressed ? 'translate(5px, 5px)' : 'translate(0,0)',
        transition: 'transform 60ms, box-shadow 60ms',
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: T.green,
            boxShadow: `0 0 8px ${T.green}`,
            animation: 'bz-live-dot 1.5s ease-in-out infinite',
          }} />
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10, letterSpacing: 2, color: T.redDark,
            textTransform: 'uppercase', fontWeight: 700,
          }}>LIVE</div>
        </div>
        <div style={{
          fontSize: 20, fontWeight: 800, letterSpacing: -0.3,
          lineHeight: 1.1, marginBottom: 8, color: T.border,
        }}>{room.name}</div>
        <div style={{
          display: 'flex', gap: 12, alignItems: 'center',
          fontSize: 14, color: 'rgba(10,5,2,0.55)',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <UsersIcon />
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700 }}>
              {room.playerCount}
            </span>
          </span>
        </div>
      </div>
      {room.hasPassword && (
        <div style={{
          width: 40, height: 40, borderRadius: 4,
          background: T.yellow,
          border: `2px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <LockIcon size={18} color={T.border} />
        </div>
      )}
    </button>
  );
}

function EmptySlot({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        appearance: 'none',
        border: `3px dashed ${T.yellow}`,
        background: hovered ? 'rgba(255,210,63,0.07)' : 'transparent',
        borderRadius: 6,
        padding: '20px 18px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14,
        transition: 'background 120ms',
        color: T.yellow,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 4,
        border: `2px dashed ${T.yellow}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <PlusIcon size={20} color={T.yellow} />
      </div>
      <div style={{ textAlign: 'left', flex: 1 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10, letterSpacing: 2, color: T.yellow,
          textTransform: 'uppercase', fontWeight: 700, marginBottom: 4,
          opacity: 0.7,
        }}>OPEN SLOT</div>
        <div style={{
          fontSize: 18, fontWeight: 800, letterSpacing: -0.3,
          color: T.yellow,
        }}>Start a new room</div>
      </div>
    </button>
  );
}
