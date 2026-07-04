// Per-doll looks so all 10 Apple Park Kids dolls read as different children
// (hair style + colour, skin tone, outfit) while sharing one doll template.

export type HairStyle = 'pigtails' | 'wavy' | 'bob' | 'curly' | 'longWavy' | 'bun' | 'short' | 'shortCurly'

export type DollLook = {
  skin: string
  hair: string
  style: HairStyle
  dress: string
  boy?: boolean // boys wear overalls instead of a dress
}

const SKIN = {
  light: '#f2d0b5',
  fair: '#eec6a6',
  medium: '#d8a578',
  tan: '#c2895f',
  brown: '#a06a43',
}

// Keyed by lowercase doll name (matches Buddy.key for dolls).
export const dollLooks: Record<string, DollLook> = {
  chloe: { skin: SKIN.light, hair: '#7a5236', style: 'pigtails', dress: '#d99aa2' },
  mia: { skin: SKIN.medium, hair: '#2e2a26', style: 'wavy', dress: '#c98a86' },
  wren: { skin: SKIN.fair, hair: '#a45a34', style: 'bob', dress: '#8fb47f' },
  paloma: { skin: SKIN.brown, hair: '#241f1b', style: 'curly', dress: '#7fb0b8' },
  ella: { skin: SKIN.light, hair: '#e0b667', style: 'longWavy', dress: '#e7a6b8' },
  gwen: { skin: SKIN.fair, hair: '#c0492f', style: 'bun', dress: '#c9c0e0' },
  levi: { skin: SKIN.tan, hair: '#5a3f2a', style: 'short', dress: '#8fb47f', boy: true },
  luke: { skin: SKIN.brown, hair: '#1f1b18', style: 'short', dress: '#6f8fbf', boy: true },
  alex: { skin: SKIN.light, hair: '#d9b36a', style: 'short', dress: '#e0b45a', boy: true },
  grady: { skin: SKIN.tan, hair: '#3a2c20', style: 'shortCurly', dress: '#c98a5a', boy: true },
}

export function lookFor(key: string): DollLook {
  return dollLooks[key] ?? { skin: SKIN.fair, hair: '#7a5236', style: 'wavy', dress: '#d99aa2' }
}
