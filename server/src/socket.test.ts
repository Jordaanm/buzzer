import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import { io as ioClient, Socket } from 'socket.io-client';
import { httpServer, rooms } from './app';

let port: number;

// Start server on a random port once before all tests in this file.
beforeEach(async () => {
  if (!port) {
    await new Promise<void>(resolve => {
      httpServer.listen(0, () => {
        port = (httpServer.address() as { port: number }).port;
        resolve();
      });
    });
  }
});

afterAll(() => { httpServer.close(); });

function connect(): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const s = ioClient(`http://localhost:${port}`, { forceNew: true });
    s.once('connect', () => resolve(s));
    s.once('connect_error', reject);
  });
}

function joinRoom(socket: Socket, roomId: number, name = 'Player', password?: string): Promise<unknown> {
  return new Promise(resolve => {
    socket.once('room-state', resolve);
    socket.emit('join-room', { roomId, playerName: name, playerIcon: 'cat', playerColor: '#fff', password });
  });
}

function nextError(socket: Socket): Promise<{ message: string }> {
  return new Promise(resolve => socket.once('error', resolve));
}

function nextEvent<T>(socket: Socket, event: string): Promise<T> {
  return new Promise(resolve => socket.once(event, resolve));
}

describe('join-room — password validation', () => {
  let s: Socket;
  beforeEach(async () => { s = await connect(); });
  afterEach(() => s.disconnect());

  it('rejects wrong password with error event', async () => {
    const room = rooms.getRoom(3)!;
    room.password = 'secret';
    try {
      const [err] = await Promise.all([
        nextError(s),
        new Promise<void>(r => { s.emit('join-room', { roomId: 3, playerName: 'X', password: 'wrong' }); r(); }),
      ]);
      expect(err.message).toMatch(/password/i);
    } finally {
      rooms.handleDisconnect(s.id!, 3);
      room.password = null;
    }
  });

  it('accepts correct password', async () => {
    const room = rooms.getRoom(4)!;
    room.password = 'open';
    try {
      const state = await joinRoom(s, 4, 'Player', 'open') as { players: { id: string }[] };
      expect(state.players).toHaveLength(1);
    } finally {
      rooms.handleDisconnect(s.id!, 4);
      room.password = null;
    }
  });
});

describe('buzz — ignored when not armed', () => {
  let s: Socket;
  beforeEach(async () => { s = await connect(); });
  afterEach(() => s.disconnect());

  it('emitting buzz in disarmed state produces no room-state update', async () => {
    await joinRoom(s, 5, 'Host');
    const room = rooms.getRoom(5)!;
    expect(room.state).toBe('disarmed');

    const gotUpdate = await Promise.race([
      new Promise<boolean>(resolve => { s.once('room-state', () => resolve(true)); }),
      new Promise<boolean>(resolve => { s.emit('buzz', { roomId: 5 }); setTimeout(() => resolve(false), 150); }),
    ]);
    expect(gotUpdate).toBe(false);
    expect(room.state).toBe('disarmed');

    rooms.handleDisconnect(s.id!, 5);
  });
});

describe('arm-buzzers — host only', () => {
  let host: Socket;
  let guest: Socket;
  beforeEach(async () => {
    host = await connect();
    guest = await connect();
  });
  afterEach(() => { host.disconnect(); guest.disconnect(); });

  it('host can arm buzzers', async () => {
    await joinRoom(host, 6, 'Host');
    await joinRoom(guest, 6, 'Guest');
    const state = await Promise.all([
      nextEvent<{ state: string }>(host, 'room-state'),
      new Promise<void>(r => { host.emit('arm-buzzers', { roomId: 6 }); r(); }),
    ]);
    expect(state[0].state).toBe('armed');
    rooms.handleDisconnect(host.id!, 6);
    rooms.handleDisconnect(guest.id!, 6);
  });

  it('non-host gets error when trying to arm', async () => {
    await joinRoom(host, 7, 'Host');
    await joinRoom(guest, 7, 'Guest');
    const [err] = await Promise.all([
      nextError(guest),
      new Promise<void>(r => { guest.emit('arm-buzzers', { roomId: 7 }); r(); }),
    ]);
    expect(err.message).toMatch(/host/i);
    rooms.handleDisconnect(host.id!, 7);
    rooms.handleDisconnect(guest.id!, 7);
  });
});

describe('reset-round — host only', () => {
  let host: Socket;
  let guest: Socket;
  beforeEach(async () => {
    host = await connect();
    guest = await connect();
  });
  afterEach(() => { host.disconnect(); guest.disconnect(); });

  it('non-host gets error when trying to reset', async () => {
    await joinRoom(host, 8, 'Host');
    await joinRoom(guest, 8, 'Guest');
    const [err] = await Promise.all([
      nextError(guest),
      new Promise<void>(r => { guest.emit('reset-round', { roomId: 8 }); r(); }),
    ]);
    expect(err.message).toMatch(/host/i);
    rooms.handleDisconnect(host.id!, 8);
    rooms.handleDisconnect(guest.id!, 8);
  });
});

describe('kick-player — host only', () => {
  let host: Socket;
  let guest: Socket;
  beforeEach(async () => {
    host = await connect();
    guest = await connect();
  });
  afterEach(() => { host.disconnect(); guest.disconnect(); });

  it('non-host gets error when trying to kick', async () => {
    await joinRoom(host, 9, 'Host');
    await joinRoom(guest, 9, 'Guest');
    const [err] = await Promise.all([
      nextError(guest),
      new Promise<void>(r => { guest.emit('kick-player', { roomId: 9, targetPlayerId: host.id }); r(); }),
    ]);
    expect(err.message).toMatch(/host/i);
    rooms.handleDisconnect(host.id!, 9);
    rooms.handleDisconnect(guest.id!, 9);
  });

  it('host can kick a player', async () => {
    await joinRoom(host, 10, 'Host');
    await joinRoom(guest, 10, 'Guest');
    const [kicked] = await Promise.all([
      nextEvent<void>(guest, 'kicked'),
      new Promise<void>(r => { host.emit('kick-player', { roomId: 10, targetPlayerId: guest.id }); r(); }),
    ]);
    expect(kicked).toBeUndefined(); // kicked event has no payload
  });
});
