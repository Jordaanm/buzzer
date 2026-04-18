# Buzzer App — V1 Requirements

## Overview

A real-time buzzer application for remote teams. Players join rooms and compete to buzz in first. No in-app audio, video, or question delivery — the app is purely the buzzer mechanism.

---

## Room Model

- **10 fixed room slots** — no dynamic room creation
- **Default state:** "Room N" name, open-door icon, no password
- **Host assignment:** First player to join an empty room becomes the host
- **Host transfer:** When the host disconnects, a random remaining player becomes host
- **Room reset:** When the last player leaves, the room's name, icon, and password are cleared — the slot becomes available for a new session
- **Passwords:** Optional, host-only. Changing mid-session does not affect already-connected players
- **Kicking players:** Host can eject individual players. Recommended pattern: change password first, then kick (prevents immediate rejoin)

---

## Lobby

- Displays all 10 room slots with: name, icon, player count, padlock icon (if password-protected)
- Polls on interval for updates — no WebSocket connection in the lobby (keeps socket connections scoped to active room participants only)
- Clicking a room navigates to that room's join flow
- Rooms show open-door icon and default name when vacant

---

## Join Flow

- **Direct link:** `app.com/room/<n>` deep-links to a specific room, bypassing the lobby
- **Steps on join:** Password entry (if set) → name + icon picker → enter room
- **Identity persistence:** Nickname and icon/color preference saved to localStorage and auto-filled on return
- **Server identity:** Players identified by socket ID — no accounts or auth

---

## Player Identity

- **Icon:** Chosen from a preset list of icons/avatars
- **Color:** Foreground color tint applied to the chosen icon
- **Storage:** Persisted in localStorage

---

## Game Room — Player View

- The majority of the screen is a single large interactive buzzer element
- Background color and status text reflect the current state:
  - **Disarmed** — buzzers not yet open
  - **Armed** — buzzers open, player can buzz in
  - **Winner** — this player buzzed in first
- Exact visual design to be provided separately

---

## Game Room — Host View

- **Armed/Disarmed state:** Shows a panel of all players in the room
- **Winner state:** Animated transition from player panel to a single winning player display
- **Room name + icon:** Shown at the top; clicking either opens an inline editing interface
- **Password:** Padlock icon in the top right; clicking opens an edit modal
- **Host controls:**
  - Arm buzzers (open the round)
  - Reset round (return to Disarmed)
  - Kick individual player
- Exact visual design to be provided separately

---

## Round Flow

1. Host arms buzzers → all players enter **Armed** state
2. First player to buzz → that player enters **Winner** state; all others enter **Disarmed**
3. Host resets → all players return to **Disarmed**

---

## Out of Scope (V1)

- Accounts or authentication
- Scoring, round counting, or session history
- In-app audio, video, or question delivery
