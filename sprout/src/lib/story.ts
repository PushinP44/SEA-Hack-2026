// Client-side story fetch. Calls our /api/story endpoint (which talks to Claude
// Haiku 4.5 server-side). If the endpoint is unavailable, falls back to a local
// template so the quiz never blocks — the deterministic scoring already decided
// the archetype + product, so the story is pure flavor.
import type { Archetype } from '../data/archetypes'
import type { Buddy } from '../data/buddies'
import type { Product } from '../data/catalog'

export type Story = { title: string; body: string }

export async function fetchStory(input: {
  buddy: Buddy
  archetype: Archetype
  product: Product
  choiceLabels: string[]
  childName?: string
}): Promise<Story> {
  try {
    const res = await fetch('/api/story', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        buddy: input.buddy.name,
        archetype: input.archetype.title,
        flower: input.archetype.flower,
        product: input.product.name,
        choices: input.choiceLabels,
        childName: input.childName ?? null,
      }),
    })
    if (!res.ok) throw new Error(`story api ${res.status}`)
    const data = (await res.json()) as Story
    if (data?.title && data?.body) return data
    throw new Error('malformed story')
  } catch {
    return templateStory(input)
  }
}

// Deterministic local fallback — same shape as the AI story.
export function templateStory(input: {
  buddy: Buddy
  archetype: Archetype
  product: Product
  childName?: string
}): Story {
  const hero = input.childName ? `${input.childName} and ${input.buddy.name}` : input.buddy.name
  return {
    title: `${input.buddy.name} and the ${input.archetype.flower}`,
    body:
      `Once upon a quiet morning in Apple Park, ${hero} planted a tiny seed and waited. ` +
      `Day by day it grew — a little ${input.archetype.flower.toLowerCase()} unfurling in the sun. ` +
      `${input.buddy.name} is ${input.archetype.title.replace('The ', '').toLowerCase()} at heart: ` +
      `${input.archetype.blurb} ` +
      `And when the flower finally bloomed, it whispered a secret — that the perfect companion for this ` +
      `adventure was waiting all along: the ${input.product.name}. The end… or really, just the beginning.`,
  }
}
