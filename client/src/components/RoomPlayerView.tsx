import { PlayerIcon } from "../identity";
import { RoomState } from "../types";
import { BackIcon, SoundIcon } from "./icons";
import PlayerIconRenderer from "./PlayerIconRenderer";
import { SlabBuzzer } from "./SlabBuzzer";
import './RoomPlayerView.css';

interface PlayerViewProps {
  roomState: RoomState;
  me: RoomState['players'][0] | null;
  winnerPlayer: RoomState['players'][0] | null;
  iWon: boolean;
  onLeave: () => void;
  onBuzz: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
}

export const RoomPlayerView = ({ roomState, me, winnerPlayer, iWon, onLeave, onBuzz, soundOn, onToggleSound }: PlayerViewProps) => {
  return (
    <div className="page-layout">
      <div className="top-bar">
        <button onClick={onLeave} className="icon-btn">
          <BackIcon />
        </button>
        <div className="room-player-view__top-bar-content">
          <div className="room-player-view__player-tag">PLAYER</div>
          <div className="room-player-view__room-name">{roomState.name}</div>
        </div>
        <button onClick={onToggleSound} className="icon-btn" title={soundOn ? 'Mute' : 'Unmute'}>
          <SoundIcon on={soundOn} />
        </button>
        {me && (
          <div className="room-player-view__player-badge">
            <PlayerIconRenderer icon={me.icon as PlayerIcon} color={me.color} size={18} />
            <div className="room-player-view__player-badge-name">{me.name}</div>
          </div>
        )}
      </div>

      {roomState.message && (
        <div className="room-player-view__message-strip">{roomState.message}</div>
      )}

      <SlabBuzzer
        armed={roomState.state === 'armed'}
        won={iWon}
        lockedOut={!iWon && !!winnerPlayer}
        onBuzz={onBuzz}
      />

      {winnerPlayer && !iWon && (
        <div className="room-player-view__winner-bar">
          <PlayerIconRenderer
            icon={winnerPlayer.icon as PlayerIcon}
            color={winnerPlayer.color}
            size={40}
          />
          <div>
            <div className="room-player-view__winner-bar-label">buzzed first</div>
            <div className="room-player-view__winner-bar-name">{winnerPlayer.name}</div>
          </div>
        </div>
      )}
    </div>
  );
}
