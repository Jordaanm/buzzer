# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run both client and server in parallel (development)
npm run dev

# Run individually
npm run dev --workspace=server   # Express server on :3001, uses tsx watch
npm run dev --workspace=client   # Vite dev server on :5173

# Build
npm run build                    # builds both
npm run build --workspace=server # tsc → dist/
npm run build --workspace=client # tsc + vite build
```

## Architecture

npm workspaces monorepo with two packages:

- **`server/`** — Express + Socket.io, TypeScript compiled via `tsx` in dev
- **`client/`** — React + Vite + TypeScript

### Server (`server/src/`)

- `index.ts` — Express/Socket.io setup and all socket event handlers
- `rooms.ts` — In-memory room state (`RoomManager` → `Room` → `Player`)

All game state lives in the `RoomManager` singleton. Rooms are created on first `join-room` and deleted when empty. No database — restarting the server wipes all rooms.

**Socket events (client → server):**
| Event | Payload | Effect |
|---|---|---|
| `join-room` | `{ roomId, playerName, isHost }` | Adds player to room, broadcasts `room-update` |
| `buzz` | `{ roomId }` | Locks room if not already locked, broadcasts `room-update` |
| `reset` | `{ roomId }` | Clears lock (host only), broadcasts `room-update` |

**Socket events (server → client):**
| Event | Payload |
|---|---|
| `room-update` | Full `RoomState` (`{ id, players, buzzedBy, locked }`) |

### Client (`client/src/`)

- `socket.ts` — Singleton Socket.io client (`autoConnect: false`, connects in `GameRoom`)
- `types.ts` — Shared interfaces (`Player`, `RoomState`, `JoinSession`)
- `App.tsx` — Switches between `JoinRoom` and `GameRoom` based on session state
- `components/JoinRoom.tsx` — Name + room code form
- `components/GameRoom.tsx` — Buzzer button, player list, host reset; manages socket lifecycle

`GameRoom` connects the socket on mount and disconnects on unmount.
