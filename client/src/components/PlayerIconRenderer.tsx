import {
  Cat, Dog, Rabbit, Bird, Fish, Turtle, Squirrel, Bug,
  Flame, Zap, Star, Heart, Crown, Rocket, Ghost,
  Skull, Orbit, Bot, Sun, Moon,
  LucideProps,
} from 'lucide-react';
import { PlayerIcon } from '../identity';

const ICON_MAP: Record<PlayerIcon, React.FC<LucideProps>> = {
  cat: Cat, dog: Dog, rabbit: Rabbit, bird: Bird, fish: Fish,
  turtle: Turtle, squirrel: Squirrel, bug: Bug, flame: Flame, zap: Zap,
  star: Star, heart: Heart, crown: Crown, rocket: Rocket, ghost: Ghost,
  skull: Skull, alien: Orbit, robot: Bot, sun: Sun, moon: Moon,
};

interface Props extends LucideProps {
  icon: PlayerIcon;
  color?: string;
}

export default function PlayerIconRenderer({ icon, color, ...rest }: Props) {
  const Icon = ICON_MAP[icon] ?? Cat;
  return <Icon color={color} {...rest} />;
}
