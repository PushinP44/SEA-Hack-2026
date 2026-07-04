// The wordless picture-quiz: 6 short moments, 2 choices each, inside one
// continuous illustrated world led by the chosen buddy. Choices render as SVG
// icons (components/quiz/ChoiceIcon) — no emoji.
//
// Binary choices, but balanced so each of the 4 archetypes appears in exactly
// 3 questions (adventurer: Q1/Q3/Q5, dreamer: Q2/Q4/Q5, nurturer: Q1/Q4/Q6,
// maker: Q2/Q3/Q6) → a decisive winner from scoreAnswers().
import type { ArchetypeId } from './archetypes'

export type Choice = {
  id: string
  label: string
  icon: string // key into components/quiz/ChoiceIcon (also drives sound/effect)
  scores: ArchetypeId
  buddyKey?: string // if set, the card shows this Farm Buddy (into buddies.ts)
}

export type Question = {
  id: number
  scene: string
  prompt: string
  choices: Choice[]
}

export const questions: Question[] = [
  {
    id: 1,
    scene: 'You and your buddy reach the top of a breezy hill. The wind swirls all around!',
    prompt: 'What do you do?',
    choices: [
      { id: 'a', label: 'Run down into the wind', icon: 'run', scores: 'adventurer' },
      { id: 'b', label: 'Curl up and watch the clouds', icon: 'cloud', scores: 'nurturer' },
    ],
  },
  {
    id: 2,
    scene: 'Strolling down the path, you start to hum a little tune…',
    prompt: 'Which sound feels right?',
    choices: [
      { id: 'a', label: 'A dreamy flute', icon: 'flute', scores: 'dreamer' },
      { id: 'b', label: 'A bouncy drum', icon: 'drum', scores: 'maker' },
    ],
  },
  {
    id: 3,
    scene: 'You reach a lookout high above the valley.',
    prompt: 'Where do you go next?',
    choices: [
      { id: 'a', label: 'Off to the wild mountains', icon: 'mountains', scores: 'adventurer' },
      { id: 'b', label: 'Blow some bubbles', icon: 'bubbles', scores: 'maker' },
    ],
  },
  {
    id: 4,
    scene: 'A little Farm Buddy wants to join your adventure!',
    prompt: 'Who comes along?',
    choices: [
      { id: 'a', label: 'Cupcake the Unicorn', icon: 'bunny', buddyKey: 'cupcake the unicorn', scores: 'dreamer' },
      { id: 'b', label: 'Kozy Koala', icon: 'bear', buddyKey: 'kozy koala', scores: 'nurturer' },
    ],
  },
  {
    id: 5,
    scene: 'The sun begins to set — time for a treat!',
    prompt: 'What sounds best?',
    choices: [
      { id: 'a', label: 'One more little adventure', icon: 'compass', scores: 'adventurer' },
      { id: 'b', label: 'Make a flower crown', icon: 'crown', scores: 'dreamer' },
    ],
  },
  {
    id: 6,
    scene: 'Back home, the garden is ready to bloom.',
    prompt: 'How do you settle in?',
    choices: [
      { id: 'a', label: 'A warm cuddle nap', icon: 'teddy', scores: 'nurturer' },
      { id: 'b', label: 'Build a cozy little house', icon: 'house', scores: 'maker' },
    ],
  },
]
