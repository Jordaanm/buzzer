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

io.on('connection', (socket) => {
  socket.on('join-room', ({ roomId, playerName, isHost }: { roomId: string; playerName: string; isHost: boolean }) => {
    const room = rooms.joinRoom(roomId, socket.id, playerName, isHost);
    socket.join(roomId);
    io.to(roomId).emit('room-update', room.getState());
  });

  socket.on('buzz', ({ roomId }: { roomId: string }) => {
    const room = rooms.getRoom(roomId);
    if (!room || room.locked) return;
    room.buzz(socket.id);
    io.to(roomId).emit('room-update', room.getState());
  });

  socket.on('reset', ({ roomId }: { roomId: string }) => {
    const room = rooms.getRoom(roomId);
    if (!room) return;
    const player = room.getPlayer(socket.id);
    if (!player?.isHost) return;
    room.reset();
    io.to(roomId).emit('room-update', room.getState());
  });

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomId === socket.id) continue;
      const room = rooms.getRoom(roomId);
      if (!room) continue;
      room.removePlayer(socket.id);
      if (room.isEmpty) {
        rooms.deleteRoom(roomId);
      } else {
        io.to(roomId).emit('room-update', room.getState());
      }
    }
  });
});

const PORT = process.env.PORT ?? 3001;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
