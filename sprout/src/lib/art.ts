// Art resolution layer. Real AI-generated illustrations (referencing the actual
// products) live in /public/art/<id>.png. If an asset is missing, we fall back
// to a themed emoji so the build is never blocked on art.
//
// See scripts/art-prompts.md for the per-asset generation prompts.

const THEME_EMOJI: Record<string, string> = {
  Zebra: '🦓', Alligator: '🐊', Giraffe: '🦒', Cheetah: '🐆', Lion: '🦁',
  Horse: '🐴', Pony: '🐴', Whale: '🐳', Fox: '🦊', Dog: '🐶', Cat: '🐱',
  Cow: '🐮', Moose: '🫎', Monkey: '🐵', Mouse: '🐭', Bear: '🧸', Lamb: '🐑',
  Koala: '🐨', Owl: '🦉', Deer: '🦌', Porcupine: '🦔', Hippo: '🦛',
  Flamingo: '🦩', Unicorn: '🦄', Bunny: '🐰', Swan: '🦢', Bird: '🐦',
  Seahorse: '🌊', Pig: '🐷', Lemur: '🐒', Beaver: '🦫', Goat: '🐐',
  Squirrel: '🐿️', Duck: '🦆', Badger: '🦡', Sloth: '🦥', Turtle: '🐢',
  Starfish: '⭐', Shell: '🐚', Flower: '🌸', Cactus: '🌵', Produce: '🥦',
  Avocado: '🥑', Apple: '🍎', Fruit: '🍓', Strawberry: '🍓', Watermelon: '🍉',
  Carrot: '🥕', Egg: '🥚', 'Ice Cream': '🍦', Blocks: '🧱', Music: '🎵',
  Doll: '🧒',
}

export function themeEmoji(theme: string): string {
  return THEME_EMOJI[theme] ?? '🌱'
}

// ---------------------------------------------------------------------------
// Emoji-free art layer (used by the quiz). Every visual is inline SVG tinted by
// theme, so the quiz never renders an emoji. Real AI-generated PNG cutouts can
// be dropped into /public/art/<id>.png and registered in ART_MANIFEST to swap
// in with zero code changes. See scripts/art-prompts.md for the prompts.
// ---------------------------------------------------------------------------

// A warm, on-brand colour per Animal/Theme — drives the SVG character tint.
const THEME_COLOR: Record<string, string> = {
  Zebra: '#b8b3ad', Giraffe: '#e0b062', Cheetah: '#e6a94e', Lion: '#e0a24a',
  Horse: '#c98f6b', Pony: '#c98f6b', Fox: '#e08a4e', Dog: '#c9a074', Cat: '#b79f8c',
  Cow: '#cbb9a6', Moose: '#a9805c', Monkey: '#b98a63', Mouse: '#b7a6a0',
  Bear: '#b98d63', Lamb: '#e7ded2', Koala: '#a9adb2', Owl: '#c7a878',
  Deer: '#cb9a6e', Porcupine: '#9c8f7d', Hippo: '#b0a6b6', Flamingo: '#e7a6b8',
  Unicorn: '#d9b8e0', Bunny: '#e3d6cc', Swan: '#eef0f2', Bird: '#8fb8d6',
  Seahorse: '#7fb8b0', Pig: '#e6b0b6', Lemur: '#a7a29a', Beaver: '#a9805c',
  Goat: '#cfc4b4', Squirrel: '#c98a5a', Duck: '#e6c766', Cactus: '#8fb47f',
  Produce: '#8fb47f', Avocado: '#8fa86a', Apple: '#d16a5a', Doll: '#e8b7a0',
}

export function themeColor(theme: string): string {
  return THEME_COLOR[theme] ?? '#a8c5a8'
}

// Animal themes get ears on the SVG character; dolls get hair.
const DOLL_LIKE = new Set(['Doll'])
export function isDollTheme(theme: string): boolean {
  return DOLL_LIKE.has(theme)
}

// Whether a generated PNG asset exists. Empty for now → inline SVG renders.
const ART_MANIFEST = new Set<string>([])

export function artFor(id: string): string | null {
  return ART_MANIFEST.has(id) ? `/art/${id}.png` : null
}
