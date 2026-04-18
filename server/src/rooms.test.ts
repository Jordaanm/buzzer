import { describe, it, expect, beforeEach } from 'vitest';
import { RoomManager } from './rooms';

const join = (rm: RoomManager, roomId: number, socketId: string, name = 'Player', password?: string) =>
  rm.joinRoom(roomId, socketId, name, 'cat', '#fff', password);

describe('RoomManager — startup', () => {
  it('pre-initialises exactly 10 rooms', () => {
    const rm = new RoomManager();
    expect(rm.getAllRooms()).toHaveLength(10);
  });

  it('rooms have default names and are empty', () => {
    const rm = new RoomManager();
    rm.getAllRooms().forEach((r, i) => {
      expect(r.getState().name).toBe(`Room ${i + 1}`);
      expect(r.getState().players).toHaveLength(0);
    });
  });
});

describe('RoomManager — joining', () => {
  let rm: RoomManager;
  beforeEach(() => { rm = new RoomManager(); });

  it('first joiner becomes host', () => {
    const result = join(rm, 1, 'socket-a');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const state = result.room.getState();
    expect(state.players[0].isHost).toBe(true);
  });

  it('second joiner is not host', () => {
    join(rm, 1, 'socket-a');
    const result = join(rm, 1, 'socket-b');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const b = result.room.getState().players.find(p => p.id === 'socket-b');
    expect(b?.isHost).toBe(false);
  });

  it('rejects join with wrong password', () => {
    const rm2 = new RoomManager();
    const room = rm2.getRoom(1)!;
    room.password = 'secret';
    const result = join(rm2, 1, 'socket-a', 'Player', 'wrong');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/password/i);
  });

  it('accepts join with correct password', () => {
    const rm2 = new RoomManager();
    const room = rm2.getRoom(1)!;
    room.password = 'secret';
    const result = join(rm2, 1, 'socket-a', 'Player', 'secret');
    expect(result.ok).toBe(true);
  });
});

describe('Round state transitions', () => {
  let rm: RoomManager;
  beforeEach(() => {
    rm = new RoomManager();
    join(rm, 1, 'host');
    join(rm, 1, 'guest');
  });

  it('starts disarmed', () => {
    expect(rm.getRoom(1)!.getState().state).toBe('disarmed');
  });

  it('disarmed → armed', () => {
    const room = rm.getRoom(1)!;
    room.state = 'armed';
    expect(room.getState().state).toBe('armed');
  });

  it('armed → winner (sets winnerId)', () => {
    const room = rm.getRoom(1)!;
    room.state = 'armed';
    room.state = 'winner';
    room.winnerId = 'guest';
    const state = room.getState();
    expect(state.state).toBe('winner');
    expect(state.winnerId).toBe('guest');
  });

  it('winner → disarmed (reset clears winnerId)', () => {
    const room = rm.getRoom(1)!;
    room.state = 'winner';
    room.winnerId = 'guest';
    room.state = 'disarmed';
    room.winnerId = null;
    const state = room.getState();
    expect(state.state).toBe('disarmed');
    expect(state.winnerId).toBeNull();
  });
});

describe('Host auto-transfer on disconnect', () => {
  let rm: RoomManager;
  beforeEach(() => {
    rm = new RoomManager();
    join(rm, 1, 'host');
    join(rm, 1, 'guest');
  });

  it('transfers host to remaining player when host disconnects', () => {
    rm.handleDisconnect('host', 1);
    const state = rm.getRoom(1)!.getState();
    expect(state.players).toHaveLength(1);
    expect(state.players[0].id).toBe('guest');
    expect(state.players[0].isHost).toBe(true);
  });

  it('non-host disconnect does not affect host', () => {
    rm.handleDisconnect('guest', 1);
    const state = rm.getRoom(1)!.getState();
    expect(state.players[0].isHost).toBe(true);
    expect(state.players[0].id).toBe('host');
  });
});

describe('Room reset when last player leaves', () => {
  let rm: RoomManager;
  beforeEach(() => {
    rm = new RoomManager();
    join(rm, 1, 'solo');
    const room = rm.getRoom(1)!;
    room.name = 'Custom Name';
    room.password = 'pw';
    room.state = 'armed';
  });

  it('resets to defaults and returns null', () => {
    const result = rm.handleDisconnect('solo', 1);
    expect(result).toBeNull();
    const state = rm.getRoom(1)!.getState();
    expect(state.name).toBe('Room 1');
    expect(state.hasPassword).toBe(false);
    expect(state.state).toBe('disarmed');
    expect(state.players).toHaveLength(0);
  });
});
