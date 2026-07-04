// Deterministic scoring: tally answers -> winning archetype.
// Ties break by a fixed priority order, so the same answers always win the same
// archetype (demo-safe).
import { questions, type Choice } from '../data/questions'
import { archetypes, type ArchetypeId } from '../data/archetypes'

const TIE_ORDER: ArchetypeId[] = ['adventurer', 'dreamer', 'nurturer', 'maker']

export type Answer = { questionId: number; choiceId: string }

export function scoreAnswers(answers: Answer[]): {
  winner: ArchetypeId
  tally: Record<ArchetypeId, number>
} {
  const tally: Record<ArchetypeId, number> = {
    adventurer: 0,
    dreamer: 0,
    nurturer: 0,
    maker: 0,
  }

  for (const a of answers) {
    const q = questions.find((q) => q.id === a.questionId)
    const choice: Choice | undefined = q?.choices.find((c) => c.id === a.choiceId)
    if (choice) tally[choice.scores] += 1
  }

  let winner: ArchetypeId = TIE_ORDER[0]
  let best = -1
  for (const id of TIE_ORDER) {
    if (tally[id] > best) {
      best = tally[id]
      winner = id
    }
  }
  return { winner, tally }
}

export const archetypeOf = (id: ArchetypeId) => archetypes[id]
