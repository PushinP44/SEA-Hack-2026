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
      `Once upon a quiet morning in Apple Park, ${hero} planted a tiny seed and waited. ` +
      `Day by day it grew into a bright ${b.flower.toLowerCase()}. ${b.buddy} is a true ${b.archetype.replace(/^The /, '')}, ` +
      `and when the flower bloomed it revealed the perfect companion for the journey ahead: ` +
      `the ${b.product}. The end… or really, just the beginning.`,
  }
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
            `Personality archetype: ${body.archetype}. Its flower is the ${body.flower}.\n` +
            `The child made these playful choices in the quiz: ${body.choices.join(', ')}.\n` +
            `End by revealing that the perfect matching gift is the "${body.product}" — mention it by name naturally.\n` +
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
  console.log(`[sprout] story server on :${PORT} (ai=${hasKey ? 'on' : 'template-only'})`)
})
