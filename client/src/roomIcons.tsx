import {
  Home, Building2, Castle, Store, School, Library,
  Music, Trophy, Gamepad2, Coffee, Tent, Globe,
  Flag, Landmark, Compass, LucideProps,
} from 'lucide-react';

export const ROOM_ICONS = [
  'home', 'building', 'castle', 'store', 'school', 'library',
  'music', 'trophy', 'gamepad', 'coffee', 'tent', 'globe',
  'flag', 'landmark', 'compass',
] as const;

export type RoomIcon = typeof ROOM_ICONS[number];

const ROOM_ICON_MAP: Record<RoomIcon, React.FC<LucideProps>> = {
  home: Home, building: Building2, castle: Castle, store: Store,
  school: School, library: Library, music: Music, trophy: Trophy,
  gamepad: Gamepad2, coffee: Coffee, tent: Tent, globe: Globe,
  flag: Flag, landmark: Landmark, compass: Compass,
};

export function RoomIconRenderer({ icon, ...rest }: { icon: string } & LucideProps) {
  const Icon = ROOM_ICON_MAP[icon as RoomIcon] ?? Home;
  return <Icon {...rest} />;
}
