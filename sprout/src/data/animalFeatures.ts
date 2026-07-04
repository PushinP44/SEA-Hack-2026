// Per-animal feature configs. A shared plush base (in BuddyCharacter) assembles
// these flags so each Farm Buddy reads as its own animal — a cow looks like a
// cow, a mouse like a mouse — while keeping one consistent illustrated format.

export type Ear = 'round' | 'roundBig' | 'pointy' | 'floppy' | 'tiny' | 'none'
export type Horn = 'cow' | 'goat' | 'giraffe' | 'antler' | 'none'
export type Muzzle = 'wide' | 'pig' | 'long' | 'beak' | 'small' | 'none'
export type Pattern = 'stripes' | 'spots' | 'patches' | 'none'

export type AnimalFeature = {
  color: string
  belly?: string // face patch / muzzle cream
  ear: Ear
  earInner?: string
  horn?: Horn
  muzzle?: Muzzle
  muzzleColor?: string
  nose?: string
  pattern?: Pattern
  patternColor?: string
  neck?: boolean
  mane?: boolean
  maneColor?: string
  unicornHorn?: boolean
  whiskers?: boolean
  teeth?: boolean
  beard?: boolean
  bigEyes?: boolean
  eyePatch?: string
  leaf?: boolean
  cheek?: string
}

const CREAM = '#f6efe4'
const INKNOSE = '#4a4640'

export const animalFeatures: Record<string, AnimalFeature> = {
  Cow: { color: '#cdbcab', belly: CREAM, ear: 'floppy', horn: 'cow', muzzle: 'wide', muzzleColor: '#e7b8bc', nose: '#c98f97', pattern: 'patches', patternColor: '#6f6257' },
  Mouse: { color: '#bcaeb2', belly: '#efe6e6', ear: 'roundBig', earInner: '#e7b8bc', muzzle: 'small', nose: '#d98a97', whiskers: true },
  Zebra: { color: '#eef0f2', ear: 'pointy', mane: true, maneColor: '#4a4640', muzzle: 'long', muzzleColor: '#6f6257', pattern: 'stripes', patternColor: '#4a4640', nose: INKNOSE },
  Giraffe: { color: '#e2b566', belly: '#f0d9a6', ear: 'pointy', horn: 'giraffe', neck: true, muzzle: 'long', muzzleColor: '#e6c88a', pattern: 'patches', patternColor: '#b9863c', nose: '#8a6a3c' },
  Fox: { color: '#e18a4e', belly: CREAM, ear: 'pointy', earInner: '#4a4640', muzzle: 'long', muzzleColor: CREAM, nose: INKNOSE, cheek: 'rgba(255,255,255,0.5)' },
  Cheetah: { color: '#e6ab52', belly: CREAM, ear: 'round', muzzle: 'small', muzzleColor: CREAM, nose: INKNOSE, pattern: 'spots', patternColor: '#6f5232' },
  Hippo: { color: '#b3a8bb', belly: '#c7bccb', ear: 'tiny', muzzle: 'wide', muzzleColor: '#c7bccb', nose: '#7d7386' },
  Monkey: { color: '#b98a63', belly: '#e8cfa8', ear: 'roundBig', earInner: '#e8cfa8', muzzle: 'wide', muzzleColor: '#e8cfa8', nose: '#8a5f3c' },
  Moose: { color: '#a9805c', belly: '#c79a70', ear: 'floppy', horn: 'antler', muzzle: 'long', muzzleColor: '#8a6448', nose: INKNOSE },
  Koala: { color: '#aab0b6', belly: '#cfd3d7', ear: 'roundBig', earInner: '#e7b8bc', muzzle: 'small', nose: '#4a4640' },
  Pig: { color: '#e8b1b7', belly: '#f2cdd1', ear: 'floppy', muzzle: 'pig', muzzleColor: '#dd9aa1', nose: '#c07f88' },
  Pony: { color: '#c98f6b', belly: '#e0b48f', ear: 'pointy', mane: true, maneColor: '#7a5236', muzzle: 'long', muzzleColor: '#b07a54', nose: '#6f4a30' },
  Unicorn: { color: '#dcbfe4', belly: '#efe1f4', ear: 'pointy', mane: true, maneColor: '#e7a6c4', unicornHorn: true, muzzle: 'long', muzzleColor: '#efe1f4', nose: '#b98ac4' },
  Flamingo: { color: '#ea9fb6', belly: '#f4c6d4', ear: 'none', neck: true, muzzle: 'beak', muzzleColor: '#3b3a36' },
  Cat: { color: '#b79f8c', belly: CREAM, ear: 'pointy', earInner: '#e7b8bc', muzzle: 'small', nose: '#d98a97', whiskers: true },
  Dog: { color: '#caa276', belly: '#e3cba6', ear: 'floppy', muzzle: 'long', muzzleColor: '#e3cba6', nose: INKNOSE },
  Beaver: { color: '#a9805c', belly: '#c79a70', ear: 'tiny', muzzle: 'wide', muzzleColor: '#c79a70', nose: INKNOSE, teeth: true },
  Goat: { color: '#d2c7b7', belly: '#e7ded2', ear: 'floppy', horn: 'goat', muzzle: 'long', muzzleColor: '#e7ded2', nose: '#8a7f6f', beard: true },
  Lemur: { color: '#a9a49c', belly: CREAM, ear: 'round', muzzle: 'small', nose: '#4a4640', bigEyes: true, eyePatch: '#4a4640' },
  Produce: { color: '#8fb47f', belly: '#b6d0a6', ear: 'none', muzzle: 'none', nose: '#4a4640', leaf: true },
}

export function featureFor(theme: string): AnimalFeature {
  return animalFeatures[theme] ?? { color: '#a8c5a8', ear: 'round', muzzle: 'small', nose: INKNOSE }
}
