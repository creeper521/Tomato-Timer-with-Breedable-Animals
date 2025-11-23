
export enum TimerMode {
  FOCUS = 'FOCUS',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
}

export interface Pet {
  id: string;
  name: string;
  emoji: string;
  price: number;
  description: string;
  color: string;
  unlocked: boolean;
}

export interface UserState {
  coins: number;
  unlockedPets: string[]; // array of pet IDs
  activePetId: string;
  petFullness: number; // 0-100 (100 is fully fed)
  totalFocusMinutes: number;
}

export const INITIAL_PETS: Pet[] = [
  { id: 'cat', name: 'Mochi', emoji: '🐱', price: 0, description: 'A loyal study companion.', color: 'bg-orange-200', unlocked: true },
  { id: 'dog', name: 'Buster', emoji: '🐶', price: 100, description: 'Always happy to see you focus.', color: 'bg-amber-200', unlocked: false },
  { id: 'bunny', name: 'Snowball', emoji: '🐰', price: 250, description: 'Fast worker, loves carrots.', color: 'bg-pink-200', unlocked: false },
  { id: 'frog', name: 'Pepe', emoji: '🐸', price: 500, description: 'Zen master of focus.', color: 'bg-green-200', unlocked: false },
  { id: 'robot', name: 'Unit-01', emoji: '🤖', price: 1000, description: 'Optimized for maximum efficiency.', color: 'bg-blue-200', unlocked: false },
  { id: 'unicorn', name: 'Sparkles', emoji: '🦄', price: 2500, description: 'Legendary focus creature.', color: 'bg-purple-200', unlocked: false },
];
