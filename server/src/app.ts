import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './rooms';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const rooms = new RoomManager();

// --- HTTP ---

app.get('/api/lobby', (_req, res) => {
  res.json(rooms.getAllRooms().map(r => r.getLobbySummary()));
});

// --- Helpers ---

function toId(roomId: string | number): number {
  return Number(roomId);
}

// --- Socket events ---

io.on('connection', (socket) => {
  socket.on('join-room', ({
    roomId,
    playerName,
    playerIcon = 'user',
    playerColor = '#ffffff',
    password,
  }: {
    roomId: string | number;
    playerName: string;
    playerIcon?: string;
    playerColor?: string;
    password?: string;
  }) => {
    const id = toId(roomId);
    const result = rooms.joinRoom(id, socket.id, playerName, playerIcon, playerColor, password);
    if (!result.ok) {
      socket.emit('error', { message: result.error });
      return;
    }
    socket.join(String(id));
    io.to(String(id)).emit('room-state', result.room.getState());
  });

  socket.on('arm-buzzers', ({ roomId }: { roomId: string | number }) => {
    const id = toId(roomId);
    const room = rooms.getRoom(id);
    if (!room) return;
    const player = room.getPlayer(socket.id);
    if (!player?.isHost) {
      socket.emit('error', { message: 'Only the host can arm buzzers' });
      return;
    }
    if (room.state !== 'disarmed') return;
    room.state = 'armed';
    io.to(String(id)).emit('room-state', room.getState());
  });

  socket.on('buzz', ({ roomId }: { roomId: string | number }) => {
    const id = toId(roomId);
    const room = rooms.getRoom(id);
    if (!room || room.state !== 'armed') return;
    room.state = 'winner';
    room.winnerId = socket.id;
    io.to(String(id)).emit('room-state', room.getState());
  });

  socket.on('reset-round', ({ roomId }: { roomId: string | number }) => {
    const id = toId(roomId);
    const room = rooms.getRoom(id);
    if (!room) return;
    const player = room.getPlayer(socket.id);
    if (!player?.isHost) {
      socket.emit('error', { message: 'Only the host can reset the round' });
      return;
    }
    room.state = 'disarmed';
    room.winnerId = null;
    io.to(String(id)).emit('room-state', room.getState());
  });

  socket.on('kick-player', ({ roomId, targetPlayerId }: { roomId: string | number; targetPlayerId: string }) => {
    const id = toId(roomId);
    const room = rooms.getRoom(id);
    if (!room) return;
    const player = room.getPlayer(socket.id);
    if (!player?.isHost) {
      socket.emit('error', { message: 'Only the host can kick players' });
      return;
    }
    const targetSocket = io.sockets.sockets.get(targetPlayerId);
    if (targetSocket) {
      targetSocket.emit('kicked');
      targetSocket.disconnect(true);
    }
  });

  socket.on('update-room-meta', ({ roomId, name, icon }: { roomId: string | number; name?: string; icon?: string }) => {
    const id = toId(roomId);
    const room = rooms.getRoom(id);
    if (!room) return;
    const player = room.getPlayer(socket.id);
    if (!player?.isHost) {
      socket.emit('error', { message: 'Only the host can update room settings' });
      return;
    }
    if (name !== undefined) room.name = name;
    if (icon !== undefined) room.icon = icon;
    io.to(String(id)).emit('room-state', room.getState());
  });

  socket.on('update-password', ({ roomId, password }: { roomId: string | number; password: string | null }) => {
    const id = toId(roomId);
    const room = rooms.getRoom(id);
    if (!room) return;
    const player = room.getPlayer(socket.id);
    if (!player?.isHost) {
      socket.emit('error', { message: 'Only the host can change the password' });
      return;
    }
    room.password = password;
    io.to(String(id)).emit('room-state', room.getState());
  });

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomId === socket.id) continue;
      const room = rooms.handleDisconnect(socket.id, Number(roomId));
      if (room) {
        io.to(roomId).emit('room-state', room.getState());
      }
    }
  });
});

export { app, httpServer, io, rooms };
