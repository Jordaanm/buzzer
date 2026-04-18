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

class Room {
  id: string;
  private players: Map<string, Player> = new Map();
  buzzedBy: string | null = null;
  locked = false;

  constructor(id: string) {
    this.id = id;
  }

  addPlayer(player: Player) {
    this.players.set(player.id, player);
  }

  removePlayer(id: string) {
    this.players.delete(id);
    if (this.buzzedBy === id) {
      this.buzzedBy = null;
      this.locked = false;
    }
  }

  getPlayer(id: string): Player | undefined {
    return this.players.get(id);
  }

  buzz(playerId: string) {
    if (this.locked) return;
    this.buzzedBy = playerId;
    this.locked = true;
  }

  reset() {
    this.buzzedBy = null;
    this.locked = false;
  }

  getState(): RoomState {
    return {
      id: this.id,
      players: Array.from(this.players.values()),
      buzzedBy: this.buzzedBy,
      locked: this.locked,
    };
  }

  get isEmpty() {
    return this.players.size === 0;
  }
}

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  joinRoom(roomId: string, socketId: string, playerName: string, isHost: boolean): Room {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Room(roomId));
    }
    const room = this.rooms.get(roomId)!;
    room.addPlayer({ id: socketId, name: playerName, isHost });
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId: string) {
    this.rooms.delete(roomId);
  }
}
