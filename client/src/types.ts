export interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

export interface RoomState {
  id: string;
  players: Player[];
  buzzedBy: string | null;
  locked: boolean;
}

export interface JoinSession {
  roomId: string;
  playerName: string;
  isHost: boolean;
}
