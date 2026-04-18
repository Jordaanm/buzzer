import { useState } from 'react';
import JoinRoom from './components/JoinRoom';
import GameRoom from './components/GameRoom';
import { JoinSession } from './types';

export default function App() {
  const [session, setSession] = useState<JoinSession | null>(null);

  if (!session) {
    return <JoinRoom onJoin={setSession} />;
  }

  return <GameRoom session={session} onLeave={() => setSession(null)} />;
}
