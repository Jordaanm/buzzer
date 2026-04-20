import { PlayerIcon } from "../identity";
import { T } from "../theme";
import { RoomState } from "../types";
import { BackIcon, SoundIcon } from "./icons";
import PlayerIconRenderer from "./PlayerIconRenderer";
import { SlabBuzzer } from "./SlabBuzzer";
import { iconBtnStyle } from "./styles";

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
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: T.bg, color: T.ink,
      minHeight: '100vh',
      fontFamily: '"Space Grotesk", system-ui',
      maxWidth: 1280, margin: '0 auto', width: '100%',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '16px 16px 14px',
        background: T.bg2,
        borderBottom: `3px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={onLeave} style={iconBtnStyle}>
          <BackIcon />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10, letterSpacing: 2, color: T.cyan,
            textTransform: 'uppercase', marginBottom: 2,
          }}>PLAYER · ROUND {roundLabel}</div>
          <div style={{
            fontSize: 17, fontWeight: 800, letterSpacing: -0.2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{roomState.name}</div>
        </div>
        <button onClick={onToggleSound} style={iconBtnStyle} title={soundOn ? 'Mute' : 'Unmute'}>
          <SoundIcon on={soundOn} />
        </button>
        {me && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', border: `2px solid ${T.border}`,
            background: T.bg, borderRadius: 999,
            minWidth: 0, maxWidth: 130, flexShrink: 0,
            boxShadow: `2px 2px 0 0 ${T.shadow}`,
          }}>
            <PlayerIconRenderer icon={me.icon as PlayerIcon} color={me.color} size={18} />
            <div style={{
              fontSize: 13, fontWeight: 700,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              color: T.ink,
            }}>{me.name}</div>
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
        <div style={{
          padding: '14px 20px 28px',
          borderTop: `3px solid ${T.border}`,
          background: T.bg2,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <PlayerIconRenderer
            icon={winnerPlayer.icon as PlayerIcon}
            color={winnerPlayer.color}
            size={40}
          />
          <div>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10, letterSpacing: 2, color: T.inkDim,
              textTransform: 'uppercase',
            }}>buzzed first</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{winnerPlayer.name}</div>
          </div>
        </div>
      )}
    </div>
  );
}