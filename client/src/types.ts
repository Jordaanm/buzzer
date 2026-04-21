export type RoundState = "disarmed" | "armed" | "winner";

export interface Player {
  id: string;
  name: string;
  icon: string;
  color: string;
  isHost: boolean;
}

export interface RoomState {
  id: number;
  name: string;
  icon: string;
  hasPassword: boolean;
  state: RoundState;
  winnerId: string | null;
  message: string | null;
  players: Player[];
}

export interface JoinSession {
  roomId: number;
  playerName: string;
  playerIcon: string;
  playerColor: string;
  password?: string;
}
