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

// Whether a generated asset exists. We keep a manifest so we don't 404 in dev.
// Populated as real art is dropped into /public/art. Empty for now → emoji.
const ART_MANIFEST = new Set<string>([])

export function artFor(id: string): string | null {
  return ART_MANIFEST.has(id) ? `/art/${id}.png` : null
}
