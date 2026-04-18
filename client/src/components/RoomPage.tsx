import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import JoinRoom from './JoinRoom';
import GameRoom from './GameRoom';
import { JoinSession } from '../types';

const API_BASE = 'http://localhost:3001';

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<JoinSession | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  const roomId = Number(id);

  useEffect(() => {
    if (!id || isNaN(roomId) || roomId < 1 || roomId > 10) return;
    fetch(`${API_BASE}/api/lobby`)
      .then(r => r.json())
      .then((rooms: { id: number; hasPassword: boolean }[]) => {
        const room = rooms.find(r => r.id === roomId);
        setHasPassword(room?.hasPassword ?? false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roomId]);

  if (!id || isNaN(roomId) || roomId < 1 || roomId > 10) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><p>Loading...</p></div>;
  }

  if (!session) {
    return <JoinRoom roomId={roomId} hasPassword={hasPassword} onJoin={setSession} />;
  }

  return <GameRoom session={session} onLeave={() => setSession(null)} />;
}
