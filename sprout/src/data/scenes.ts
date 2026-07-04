// Data-driven scene beats. The quiz "progress" value (0..6) drives one continuous
// illustrated world; SceneStage interpolates between the two nearest beats by the
// fractional part of progress, so forward/back movement looks continuous.
//
// progress mapping (6 questions):
//   0 windy hilltop (Q1)   1 the path (Q2)   2 the lookout (Q3)
//   3 meadow friend (Q4)   4 sunset (Q5)     5 home garden (Q6)   6 full bloom (reveal)

export type Beat = {
  name: string
  skyTop: string
  skyBottom: string
  hillFar: string
  hillMid: string
  ground: string
  cameraX: number // parallax pan (px of world offset)
  wind: number // 0..1 ambient wind strength
  bloom: number // 0..1 how open the garden flowers are
  visitor: number // 0..1 fade-in of the little friend
}

export const beats: Beat[] = [
  { name: 'Windy hilltop', skyTop: '#bcd6ea', skyBottom: '#eaf2f6', hillFar: '#bcd0b4', hillMid: '#a8c5a8', ground: '#8fb47f', cameraX: 0, wind: 1.0, bloom: 0, visitor: 0 },
  { name: 'Down the path', skyTop: '#c7dcea', skyBottom: '#f2ece2', hillFar: '#bcd0b4', hillMid: '#a3c0a0', ground: '#89ae78', cameraX: 190, wind: 0.72, bloom: 0, visitor: 0 },
  { name: 'The lookout', skyTop: '#d7e2ea', skyBottom: '#f6ece0', hillFar: '#c2d2b8', hillMid: '#9fbd9c', ground: '#86ab75', cameraX: 380, wind: 0.58, bloom: 0.05, visitor: 0 },
  { name: 'A friend appears', skyTop: '#e6dcea', skyBottom: '#f7e6df', hillFar: '#c9d2c0', hillMid: '#a6c0a2', ground: '#88ad77', cameraX: 570, wind: 0.48, bloom: 0.15, visitor: 1 },
  { name: 'Sunset', skyTop: '#f0d6c8', skyBottom: '#f8e2cf', hillFar: '#cdcbb8', hillMid: '#a8bc9a', ground: '#8bab74', cameraX: 760, wind: 0.4, bloom: 0.35, visitor: 0.5 },
  { name: 'Home garden', skyTop: '#f0dfe0', skyBottom: '#f8e9df', hillFar: '#cdd3c2', hillMid: '#aac2a4', ground: '#8cb079', cameraX: 950, wind: 0.32, bloom: 0.65, visitor: 0.2 },
  { name: 'Full bloom', skyTop: '#f6dfe4', skyBottom: '#fdeee8', hillFar: '#d2d6c6', hillMid: '#aec6a8', ground: '#8fb47f', cameraX: 1140, wind: 0.24, bloom: 1, visitor: 0 },
]

export const MAX_PROGRESS = beats.length - 1
