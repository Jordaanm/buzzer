import { PlayerIcon } from "../identity";
import { T } from "../theme";
import { RoomState } from "../types";
import { BackIcon, SoundIcon } from "./icons";
import PlayerIconRenderer from "./PlayerIconRenderer";
import { SlabBuzzer } from "./SlabBuzzer";
import { iconBtnStyle, roomPageStyle, topBarStyle } from "./styles";

interface PlayerViewProps {
  roomState: RoomState;
  roundLabel: string;
  me: RoomState['players'][0] | null;
  winnerPlayer: RoomState['players'][0] | null;
  iWon: boolean;
  onLeave: () => void;
  onBuzz: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
}

export const RoomPlayerView = ({ roomState, roundLabel, me, winnerPlayer, iWon, onLeave, onBuzz, soundOn, onToggleSound }: PlayerViewProps) => {
  return (
    <div style={roomPageStyle}>
      {/* Top bar */}
      <div style={topBarStyle}>
        <button onClick={onLeave} style={iconBtnStyle}>
          <BackIcon />
        </button>
        <div style={topBarContentStyle}>
          <div style={playerTagStyle}>PLAYER · ROUND {roundLabel}</div>
          <div style={roomNameStyle}>{roomState.name}</div>
        </div>
        <button onClick={onToggleSound} style={iconBtnStyle} title={soundOn ? 'Mute' : 'Unmute'}>
          <SoundIcon on={soundOn} />
        </button>
        {me && (
          <div style={playerBadgeStyle}>
            <PlayerIconRenderer icon={me.icon as PlayerIcon} color={me.color} size={18} />
            <div style={playerBadgeNameStyle}>{me.name}</div>
          </div>
        )}
      </div>

      <SlabBuzzer
        armed={roomState.state === 'armed'}
        won={iWon}
        lockedOut={!iWon && !!winnerPlayer}
        onBuzz={onBuzz}
      />

      {/* Winner bar (shown when someone else won) */}
      {winnerPlayer && !iWon && (
        <div style={winnerBarStyle}>
          <PlayerIconRenderer
            icon={winnerPlayer.icon as PlayerIcon}
            color={winnerPlayer.color}
            size={40}
          />
          <div>
            <div style={winnerBarLabelStyle}>buzzed first</div>
            <div style={winnerBarNameStyle}>{winnerPlayer.name}</div>
          </div>
        </div>
      )}
    </div>
  );
}

const topBarContentStyle: React.CSSProperties = { flex: 1, minWidth: 0 };

const playerTagStyle: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: 10, letterSpacing: 2, color: T.cyan,
  textTransform: 'uppercase', marginBottom: 2,
};

const roomNameStyle: React.CSSProperties = {
  fontSize: 17, fontWeight: 800, letterSpacing: -0.2,
  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
};

const playerBadgeStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '4px 10px', border: `2px solid ${T.border}`,
  background: T.bg, borderRadius: 999,
  minWidth: 0, maxWidth: 130, flexShrink: 0,
  boxShadow: `2px 2px 0 0 ${T.shadow}`,
};

const playerBadgeNameStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 700,
  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  color: T.ink,
};

const winnerBarStyle: React.CSSProperties = {
  padding: '14px 20px 28px',
  borderTop: `3px solid ${T.border}`,
  background: T.bg2,
  display: 'flex', alignItems: 'center', gap: 14,
};

const winnerBarLabelStyle: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: 10, letterSpacing: 2, color: T.inkDim,
  textTransform: 'uppercase',
};

const winnerBarNameStyle: React.CSSProperties = { fontSize: 20, fontWeight: 800 };