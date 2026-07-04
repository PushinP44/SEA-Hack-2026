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
  choiceLabels?: string[]
  childName?: string
}): Story {
  const hero = input.childName ? `${input.childName} and ${input.buddy.name}` : input.buddy.name
  const beats = (input.choiceLabels ?? []).map((c) => c.toLowerCase())
  const adventure = beats.length ? `They chose to ${beats.slice(0, 4).join(', then ')}. ` : ''
  const loves = beats.length ? beats.slice(0, 2).join(' and ') : 'to play'
  return {
    title: `${input.buddy.name}'s Big Day`,
    body:
      `One breezy morning in Apple Park, ${hero} set off on a little adventure. ` +
      adventure +
      `What a day for ${input.archetype.title.replace('The ', 'a little ').toLowerCase()}! ` +
      `And waiting at home was the perfect outfit — the ${input.product.name} — comfy and soft, ` +
      `just right for someone who loves ${loves}. ${input.buddy.name} put it on, gave a happy twirl, and beamed. ` +
      `The end… or really, just the beginning.`,
  }
}
