// The wordless picture-quiz. Each option scores exactly one archetype.
// 5 forced-choice moments inside one continuous illustrated world.
import type { ArchetypeId } from './archetypes'

export type Choice = {
  id: string
  label: string
  emoji: string
  scores: ArchetypeId
}

export type Question = {
  id: number
  scene: string // short flavor line (spoken aloud / shown briefly)
  prompt: string
  choices: Choice[]
}

export const questions: Question[] = [
  {
    id: 1,
    scene: 'A bag of mysterious seeds spills open on the table…',
    prompt: 'Which seed would you sow?',
    choices: [
      { id: 'a', label: 'Veined hard seed', emoji: '🌰', scores: 'adventurer' },
      { id: 'b', label: 'Furry light seed', emoji: '🪶', scores: 'dreamer' },
      { id: 'c', label: 'Large plump seed', emoji: '🫘', scores: 'nurturer' },
      { id: 'd', label: 'Shiny golden seed', emoji: '✨', scores: 'maker' },
    ],
  },
  {
    id: 2,
    scene: 'While the seed settles in, you fancy some music…',
    prompt: 'Which sound would you play?',
    choices: [
      { id: 'a', label: 'A marching drum', emoji: '🥁', scores: 'maker' },
      { id: 'b', label: 'Ocean waves', emoji: '🌊', scores: 'adventurer' },
      { id: 'c', label: 'Soft piano', emoji: '🎹', scores: 'nurturer' },
      { id: 'd', label: 'A dreamy flute', emoji: '🪈', scores: 'dreamer' },
    ],
  },
  {
    id: 3,
    scene: 'The sprout leans toward the window. Where does it want to go?',
    prompt: 'Pick a window view.',
    choices: [
      { id: 'a', label: 'Tall wild mountains', emoji: '⛰️', scores: 'adventurer' },
      { id: 'b', label: 'A field of flowers', emoji: '🌸', scores: 'dreamer' },
      { id: 'c', label: 'A cozy fireplace', emoji: '🔥', scores: 'nurturer' },
      { id: 'd', label: 'A busy workshop', emoji: '🧩', scores: 'maker' },
    ],
  },
  {
    id: 4,
    scene: 'A little visitor comes to say hello to your plant.',
    prompt: 'Who do you hope it is?',
    choices: [
      { id: 'a', label: 'A bounding fox', emoji: '🦊', scores: 'adventurer' },
      { id: 'b', label: 'A shy bunny', emoji: '🐰', scores: 'dreamer' },
      { id: 'c', label: 'A sleepy bear', emoji: '🐻', scores: 'nurturer' },
      { id: 'd', label: 'A clever monkey', emoji: '🐵', scores: 'maker' },
    ],
  },
  {
    id: 5,
    scene: 'Your plant is ready to bloom. How do you celebrate?',
    prompt: 'Choose a treat.',
    choices: [
      { id: 'a', label: 'Go exploring outside', emoji: '🧭', scores: 'adventurer' },
      { id: 'b', label: 'Make a flower crown', emoji: '💐', scores: 'dreamer' },
      { id: 'c', label: 'A warm cuddle nap', emoji: '🧸', scores: 'nurturer' },
      { id: 'd', label: 'Build a tiny house', emoji: '🏠', scores: 'maker' },
    ],
  },
]
