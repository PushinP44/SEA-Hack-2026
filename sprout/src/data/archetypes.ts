// The fixed, rule-based personality layer. Four archetypes; every quiz answer
// maps to exactly one. This layer NEVER improvises — it decides the outcome.
export type ArchetypeId = 'adventurer' | 'dreamer' | 'nurturer' | 'maker'

export type Archetype = {
  id: ArchetypeId
  title: string
  flower: string
  emoji: string
  blurb: string
  // Matching rules used by lib/match.ts to pick a real product.
  themes: string[] // Animal/Theme values that fit this archetype
  types: string[] // Product Type values, in priority order
}

export const archetypes: Record<ArchetypeId, Archetype> = {
  adventurer: {
    id: 'adventurer',
    title: 'The Little Adventurer',
    flower: 'Sunflower',
    emoji: '🌻',
    blurb:
      'Bold, curious, always first out the door. Loves wild places, new paths, and big open skies.',
    themes: ['Zebra', 'Alligator', 'Giraffe', 'Cheetah', 'Lion', 'Horse', 'Whale', 'Fox', 'Dog'],
    types: ['Overalls', 'Romper', 'Coverall', 'Stroller Toy', 'Plush', 'Backpack'],
  },
  dreamer: {
    id: 'dreamer',
    title: 'The Gentle Dreamer',
    flower: 'Wild Rose',
    emoji: '🌹',
    blurb:
      'Imaginative and soft-hearted, happiest in a world of make-believe, flowers, and quiet magic.',
    themes: ['Unicorn', 'Bunny', 'Flower', 'Swan', 'Bird', 'Flamingo', 'Seahorse'],
    types: ['Dress', 'Lovey', 'Plush', 'Rattle', 'Romper'],
  },
  nurturer: {
    id: 'nurturer',
    title: 'The Cozy Nurturer',
    flower: 'Lavender',
    emoji: '💜',
    blurb:
      'Warm, caring, the one who tucks everyone in. Loves snuggles, soft things, and bedtime stories.',
    themes: ['Bear', 'Lamb', 'Koala', 'Cat', 'Cow', 'Owl', 'Deer', 'Porcupine'],
    types: ['Lovey', 'Pajama Set', 'Blanket', 'Plush Toy', 'Plush', 'Pacifier Buddy'],
  },
  maker: {
    id: 'maker',
    title: 'The Busy Maker',
    flower: 'Marigold',
    emoji: '🌼',
    blurb:
      'Hands-on and full of ideas — building, stacking, drumming, always making something new.',
    themes: ['Blocks', 'Music', 'Produce', 'Avocado', 'Apple', 'Fruit', 'Monkey', 'Mouse', 'Beaver'],
    types: ['Activity Toy', 'Play Gym', 'Stroller Toy', 'Crinkle Blankie', 'Plush'],
  },
}

export const archetypeList = Object.values(archetypes)
