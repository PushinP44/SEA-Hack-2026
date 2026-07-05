// Tiny Express server exposing POST /api/story.
// It calls Claude Haiku 4.5 (fast, cheap — chosen for the ~15s "growing" render)
// to write the final keepsake story. If ANTHROPIC_API_KEY is unset or the call
// fails, it returns a deterministic template so the demo never blocks on the API.
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = Number(process.env.PORT ?? 8787)
const hasKey = Boolean(process.env.ANTHROPIC_API_KEY)
// The SDK reads ANTHROPIC_API_KEY from the environment.
const client = hasKey ? new Anthropic() : null

type StoryReq = {
  buddy: string
  archetype: string
  flower: string
  product: string
  choices: string[]
  childName: string | null
}

function template(b: StoryReq): { title: string; body: string } {
  const hero = b.childName ? `${b.childName} and ${b.buddy}` : b.buddy
  return {
    title: `${b.buddy} and the ${b.flower}`,
    body:
      `One breezy morning in Apple Park, ${hero} set off on a little adventure. ` +
      `${adventureFrom(b.choices)} ` +
      `What a day for a true ${b.archetype.replace(/^The /, '')}! ` +
      `And waiting at home was the perfect outfit — the ${b.product} — comfy and soft, ` +
      `just right for a child who loves ${loveFrom(b.choices)}. ${b.buddy} put it on, twirled once, and beamed. ` +
      `The end… or really, just the beginning.`,
  }
}

// Turn the child's picked choices into the story's beats + a "loves …" phrase.
function adventureFrom(choices: string[]): string {
  const beats = choices.slice(0, 4).map((c) => c.toLowerCase())
  if (!beats.length) return `They played all day long.`
  return `They chose to ${beats.join(', then ')}.`
}
function loveFrom(choices: string[]): string {
  const beats = choices.slice(0, 2).map((c) => c.toLowerCase())
  return beats.length ? beats.join(' and ') : 'play'
}

app.post('/api/story', async (req, res) => {
  const body = req.body as StoryReq
  if (!client) {
    return res.json(template(body))
  }
  try {
    const nameLine = body.childName
      ? `Weave in the child's real name, "${body.childName}", as the co-hero alongside ${body.buddy}.`
      : `The hero is the doll/character named ${body.buddy}.`

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 600,
      system:
        'You are a warm childrens picture-book author for Apple Park, an organic, heirloom kids brand. ' +
        'Write gentle, wholesome, age-appropriate bedtime stories. No scary content, no brand-negative themes. ' +
        'Return ONLY valid JSON: {"title": string, "body": string}. The body is 90-140 words, one short paragraph.',
      messages: [
        {
          role: 'user',
          content:
            `Write a tiny bedtime story that celebrates a child's personality result.\n` +
            `${nameLine}\n` +
            `Personality archetype: ${body.archetype}.\n` +
            `IMPORTANT — build the little adventure directly out of the choices the child made, in order: ` +
            `${body.choices.join('; ')}. Each choice should actually happen in the story (e.g. they run down the hill, they meet the bunny…), so the story clearly reflects what they picked.\n` +
            `Then end by revealing the perfect outfit — the "${body.product}" — and, in one warm closing sentence, ` +
            `say WHY it suits a child who loves doing those very things (tie the outfit back to their chosen actions, ` +
            `e.g. comfy to run and play in, soft for cozy days). Name the outfit naturally.\n` +
            `Respond with only the JSON object.`,
        },
      ],
    })

    const text = msg.content.find((b) => b.type === 'text')?.text ?? ''
    // Haiku may wrap JSON in prose/fences — extract the object defensively.
    const match = text.match(/\{[\s\S]*\}/)
    const parsed = match ? JSON.parse(match[0]) : null
    if (parsed?.title && parsed?.body) {
      return res.json({ title: String(parsed.title), body: String(parsed.body) })
    }
    return res.json(template(body))
  } catch (err) {
    console.error('[story] falling back to template:', (err as Error).message)
    return res.json(template(body))
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true, ai: hasKey }))

app.listen(PORT, () => {
  console.log(`[kradoll] story server on :${PORT} (ai=${hasKey ? 'on' : 'template-only'})`)
})
