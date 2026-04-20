import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { isSoundOn, play, setSoundOn } from '../sounds';
import { JoinSession, RoomState } from '../types';
import { RoomHostView } from './RoomHostView.tsx';
import { RoomPlayerView } from './RoomPlayerView.tsx';
import { connectingScreenStyle } from './styles';

interface Props {
  session: JoinSession;
  onLeave: () => void;
}

export default function GameRoom({ session, onLeave }: Props) {
  const { roomId, playerName } = session;
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [round, setRound] = useState(1);
  const prevRoomState = useRef<string | null>(null);
  const navigate = useNavigate();
  const [soundOn, setSoundOnState] = useState(isSoundOn);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundOnState(next);
  };

  // Host editing state
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleConnect = () => {
      socket.emit('join-room', {
        roomId,
        playerName,
        playerIcon: session.playerIcon,
        playerColor: session.playerColor,
        password: session.password,
      });
    };

    socket.on('connect', handleConnect);
    socket.on('room-state', (state: RoomState) => {
      const prev = prevRoomState.current;
      if (prev === 'winner' && state.state === 'disarmed') setRound(r => r + 1);
      if (prev !== state.state) {
        if (state.state === 'armed')    play('arm');
        if (state.state === 'winner')   play('winner');
        if (state.state === 'disarmed' && prev !== null) play('disarm');
      }
      prevRoomState.current = state.state;
      setRoomState(state);
    });
    socket.on('kicked', () => {
      play('kick');
      sessionStorage.setItem('kicked', '1');
      socket.disconnect();
      navigate('/');
    });
    socket.on('error', ({ message }: { message: string }) => {
      console.error('Room error:', message);
    });

    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('room-state');
      socket.off('kicked');
      socket.off('error');
      socket.disconnect();
    };
  }, [roomId, playerName, session, navigate]);

  if (!roomState) {
    return <div style={connectingScreenStyle}>CONNECTING…</div>;
  }

  const me = roomState.players.find(p => p.id === socket.id);
  const isHost = me?.isHost ?? false;
  const iWon = roomState.state === 'winner' && roomState.winnerId === socket.id;
  const winnerPlayer = roomState.winnerId
    ? roomState.players.find(p => p.id === roomState.winnerId)
    : null;

  const handleBuzz = () => { play('buzz'); socket.emit('buzz', { roomId }); };
  const handleReset = () => socket.emit('reset-round', { roomId });
  const handleArm = () => socket.emit('arm-buzzers', { roomId });
  const handleKick = (id: string) => socket.emit('kick-player', { roomId, targetPlayerId: id });

  const startEditName = () => {
    setNameInput(roomState.name);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.select(), 0);
  };
  const commitName = () => {
    const name = nameInput.trim();
    if (name && name !== roomState.name) socket.emit('update-room-meta', { roomId, name });
    setEditingName(false);
  };
  const handleNameKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitName();
    if (e.key === 'Escape') setEditingName(false);
  };

  const roundLabel = String(round).padStart(2, '0');

  if (isHost) {
    return (
      <RoomHostView
        roomState={roomState}
        roundLabel={roundLabel}
        winnerPlayer={winnerPlayer ?? null}
        editingName={editingName}
        nameInput={nameInput}
        nameInputRef={nameInputRef}
        showSettings={showSettings}
        onLeave={onLeave}
        onStartEditName={startEditName}
        onCommitName={commitName}
        onNameKey={handleNameKey}
        onNameInput={setNameInput}
        onArm={handleArm}
        onReset={handleReset}
        onKick={handleKick}
        onOpenSettings={() => setShowSettings(true)}
        onCloseSettings={() => setShowSettings(false)}
        roomId={roomId}
        soundOn={soundOn}
        onToggleSound={toggleSound}
      />
    );
  }

  return (
    <RoomPlayerView
      roomState={roomState}
      roundLabel={roundLabel}
      me={me ?? null}
      winnerPlayer={winnerPlayer ?? null}
      iWon={iWon}
      onLeave={onLeave}
      onBuzz={handleBuzz}
      soundOn={soundOn}
      onToggleSound={toggleSound}
    />
  );
}