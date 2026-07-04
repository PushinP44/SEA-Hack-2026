// Data-driven scene beats — a cozy oil-pastel NIGHT MEADOW. The quiz "progress"
// value (0..6) drives one continuous world; SceneStage interpolates between the
// two nearest beats by the fractional part of progress. Palette is muted and
// comforting: dusky indigo sky with an apricot horizon glow, moonlit mossy greens.

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

// Gentle evening deepening across the journey — kept subtle and soft.
export const beats: Beat[] = [
  { name: 'Meadow dusk', skyTop: '#5a6690', skyBottom: '#e9b98f', hillFar: '#8ba489', hillMid: '#799a7c', ground: '#6f8f6c', cameraX: 0, wind: 0.9, bloom: 0, visitor: 0 },
  { name: 'Along the path', skyTop: '#565f8c', skyBottom: '#e6b493', hillFar: '#87a086', hillMid: '#749677', ground: '#6b8b68', cameraX: 190, wind: 0.7, bloom: 0, visitor: 0 },
  { name: 'The lookout', skyTop: '#515a88', skyBottom: '#e3af97', hillFar: '#849d84', hillMid: '#719374', ground: '#688865', cameraX: 380, wind: 0.58, bloom: 0.05, visitor: 0 },
  { name: 'A friend', skyTop: '#4c5484', skyBottom: '#e0aa9a', hillFar: '#809981', hillMid: '#6e9071', ground: '#658562', cameraX: 570, wind: 0.48, bloom: 0.15, visitor: 1 },
  { name: 'Moonrise', skyTop: '#464e80', skyBottom: '#dca79c', hillFar: '#7d9680', hillMid: '#6b8d6f', ground: '#628260', cameraX: 760, wind: 0.4, bloom: 0.35, visitor: 0.5 },
  { name: 'Home meadow', skyTop: '#424a7d', skyBottom: '#d9a49e', hillFar: '#7b9480', hillMid: '#698b6e', ground: '#60805e', cameraX: 950, wind: 0.32, bloom: 0.65, visitor: 0.2 },
  { name: 'Starry bloom', skyTop: '#3f477b', skyBottom: '#d7a2a0', hillFar: '#7a9380', hillMid: '#688a6d', ground: '#5f7f5d', cameraX: 1140, wind: 0.26, bloom: 1, visitor: 0 },
]

export const MAX_PROGRESS = beats.length - 1
