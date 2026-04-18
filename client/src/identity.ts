export const PLAYER_ICONS = [
  'cat', 'dog', 'rabbit', 'bird', 'fish',
  'turtle', 'squirrel', 'bug', 'flame', 'zap',
  'star', 'heart', 'crown', 'rocket', 'ghost',
  'skull', 'alien', 'robot', 'sun', 'moon',
] as const;

export type PlayerIcon = typeof PLAYER_ICONS[number];

export const PLAYER_COLORS = [
  '#f87171', // red
  '#fb923c', // orange
  '#facc15', // yellow
  '#4ade80', // green
  '#34d399', // emerald
  '#22d3ee', // cyan
  '#60a5fa', // blue
  '#a78bfa', // violet
  '#f472b6', // pink
  '#e2e8f0', // white
] as const;

const STORAGE_KEY = 'buzzer-identity';

interface Identity {
  nickname: string;
  icon: PlayerIcon;
  color: string;
}

export function loadIdentity(): Partial<Identity> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveIdentity(identity: Identity) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
}
