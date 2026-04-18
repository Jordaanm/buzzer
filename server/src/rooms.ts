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
  players: Player[];
}

export interface LobbySummary {
  id: number;
  name: string;
  icon: string;
  playerCount: number;
  hasPassword: boolean;
}

const DEFAULT_ICON = "door-open";
const ROOM_COUNT = 10;

class Room {
  readonly id: number;
  name: string;
  icon: string;
  password: string | null = null;
  state: RoundState = "disarmed";
  winnerId: string | null = null;
  private players: Map<string, Player> = new Map();

  constructor(id: number) {
    this.id = id;
    this.name = `Room ${id}`;
    this.icon = DEFAULT_ICON;
  }

  addPlayer(player: Player) {
    this.players.set(player.id, player);
  }

  removePlayer(id: string) {
    this.players.delete(id);
    if (this.winnerId === id) {
      this.winnerId = null;
      this.state = "disarmed";
    }
  }

  getPlayer(id: string): Player | undefined {
    return this.players.get(id);
  }

  transferHostToRandom() {
    const candidates = Array.from(this.players.values()).filter(p => !p.isHost);
    if (candidates.length === 0) return;
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    next.isHost = true;
  }

  resetToDefaults() {
    this.name = `Room ${this.id}`;
    this.icon = DEFAULT_ICON;
    this.password = null;
    this.state = "disarmed";
    this.winnerId = null;
    this.players.clear();
  }

  getState(): RoomState {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      hasPassword: this.password !== null,
      state: this.state,
      winnerId: this.winnerId,
      players: Array.from(this.players.values()),
    };
  }

  getLobbySummary(): LobbySummary {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      playerCount: this.players.size,
      hasPassword: this.password !== null,
    };
  }

  get isEmpty(): boolean {
    return this.players.size === 0;
  }
}

export class RoomManager {
  private rooms: Map<number, Room> = new Map();

  constructor() {
    for (let i = 1; i <= ROOM_COUNT; i++) {
      this.rooms.set(i, new Room(i));
    }
  }

  joinRoom(
    roomId: number,
    socketId: string,
    playerName: string,
    playerIcon: string,
    playerColor: string,
    password?: string,
  ): { ok: true; room: Room } | { ok: false; error: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { ok: false, error: "Room not found" };
    if (room.password !== null && room.password !== password) {
      return { ok: false, error: "Incorrect password" };
    }
    const isHost = room.isEmpty;
    room.addPlayer({ id: socketId, name: playerName, icon: playerIcon, color: playerColor, isHost });
    return { ok: true, room };
  }

  getRoom(roomId: number): Room | undefined {
    return this.rooms.get(roomId);
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  // Returns the room to broadcast to, or null if the room is now empty/reset.
  handleDisconnect(socketId: string, roomId: number): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.getPlayer(socketId);
    const wasHost = player?.isHost ?? false;

    room.removePlayer(socketId);

    if (room.isEmpty) {
      room.resetToDefaults();
      return null;
    }

    if (wasHost) {
      room.transferHostToRandom();
    }

    return room;
  }
}
