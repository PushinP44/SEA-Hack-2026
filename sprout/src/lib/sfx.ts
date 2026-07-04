// Tiny Web Audio sound engine — all sounds are synthesized (no audio files).
// Hovering a choice plays a matching sound; leaving fades it. The AudioContext
// is created lazily and resumed on the first user gesture (the Start click), so
// browsers don't block autoplay. A mute toggle silences everything.

type Voice = { stop: () => void }

let ctx: AudioContext | null = null
let master: GainNode | null = null
let ambientBus: GainNode | null = null
let noiseBuf: AudioBuffer | null = null
let active: Voice | null = null
let muted = false

function ensure(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = muted ? 0 : 0.5
    master.connect(ctx.destination)
    // Ambient bus is quieter — picked elements keep looping softly in the background.
    ambientBus = ctx.createGain()
    ambientBus.gain.value = 0.32
    ambientBus.connect(master)
    // 1s of white noise for breeze/percussive textures.
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  return ctx
}

// ---- persistent ambient: one soft looping voice per element TYPE ----------
// Different types recur at different periods (wind often, animals rarely). A new
// pick of the SAME type replaces the previous one (e.g. a new toy silences the
// old instrument). Cleared on reset / replay.
const PERIOD: Record<string, number> = { environment: 4500, toy: 7000, buddy: 12000 }
// Instruments loop back-to-back so the music is NON-STOP (period ≈ tune length).
const PERIOD_ICON: Record<string, number> = { flute: 1600, drum: 1040 }
const ambient: Record<string, { timer: number }> = {}

export function setAmbient(type: 'environment' | 'toy' | 'buddy', icon: string) {
  const c = ensure()
  if (!c || !ambientBus) return
  if (c.state === 'suspended') c.resume()
  clearAmbientType(type)
  const play = () => {
    if (muted) return
    const s = SOUNDS[icon]
    if (s && ambientBus) s(c, ambientBus)
  }
  play()
  const timer = window.setInterval(play, PERIOD_ICON[icon] ?? PERIOD[type] ?? 8000)
  ambient[type] = { timer }
}

function clearAmbientType(type: string) {
  if (ambient[type]) {
    window.clearInterval(ambient[type].timer)
    delete ambient[type]
  }
}

export function clearAmbient() {
  for (const k of Object.keys(ambient)) clearAmbientType(k)
}

// Call on the first user gesture (Start button) so audio is unlocked.
export function initAudio() {
  const c = ensure()
  if (c && c.state === 'suspended') c.resume()
}

export function setMuted(m: boolean) {
  muted = m
  if (master && ctx) master.gain.setTargetAtTime(m ? 0 : 0.5, ctx.currentTime, 0.02)
}

export function isMuted() {
  return muted
}

export function stopHover() {
  if (active) {
    active.stop()
    active = null
  }
}

export function playHover(icon: string) {
  const c = ensure()
  if (!c || !master) return
  if (c.state === 'suspended') c.resume()
  stopHover()
  active = (SOUNDS[icon] ?? chime)(c, master)
}

// ---- sound builders -------------------------------------------------------

function noise(c: AudioContext, out: GainNode, type: BiquadFilterType, freq: number, q: number, dur: number, peak: number): Voice {
  const src = c.createBufferSource()
  src.buffer = noiseBuf
  src.loop = true
  const filt = c.createBiquadFilter()
  filt.type = type
  filt.frequency.value = freq
  filt.Q.value = q
  const g = c.createGain()
  const t = c.currentTime
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(peak, t + Math.min(0.25, dur * 0.4))
  src.connect(filt).connect(g).connect(out)
  src.start()
  return {
    stop: () => {
      const n = c.currentTime
      g.gain.cancelScheduledValues(n)
      g.gain.setTargetAtTime(0, n, 0.12)
      src.stop(n + 0.5)
    },
  }
}

function tone(c: AudioContext, out: GainNode, type: OscillatorType, from: number, to: number, dur: number, peak: number): Voice {
  const osc = c.createOscillator()
  osc.type = type
  const g = c.createGain()
  const t = c.currentTime
  osc.frequency.setValueAtTime(from, t)
  osc.frequency.linearRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(peak, t + 0.04)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(out)
  osc.start()
  osc.stop(t + dur + 0.05)
  return { stop: () => {} }
}

function seq(c: AudioContext, out: GainNode, notes: number[], step: number, type: OscillatorType = 'sine'): Voice {
  const t0 = c.currentTime
  notes.forEach((f, i) => {
    const osc = c.createOscillator()
    osc.type = type
    const g = c.createGain()
    const t = t0 + i * step
    osc.frequency.setValueAtTime(f, t)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.22, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + step * 0.9)
    osc.connect(g).connect(out)
    osc.start(t)
    osc.stop(t + step)
  })
  return { stop: () => {} }
}

// a swept-filter whoosh (wind gust)
function whoosh(c: AudioContext, out: GainNode, f0: number, f1: number, dur: number, peak: number): Voice {
  const src = c.createBufferSource()
  src.buffer = noiseBuf
  src.loop = true
  const filt = c.createBiquadFilter()
  filt.type = 'bandpass'
  filt.Q.value = 1.2
  const g = c.createGain()
  const t = c.currentTime
  filt.frequency.setValueAtTime(f0, t)
  filt.frequency.linearRampToValueAtTime(f1, t + dur)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(peak, t + dur * 0.35)
  g.gain.linearRampToValueAtTime(0.0001, t + dur)
  src.connect(filt).connect(g).connect(out)
  src.start()
  src.stop(t + dur + 0.05)
  return { stop: () => src.stop() }
}

// a low animal growl (bear)
function growl(c: AudioContext, out: GainNode): Voice {
  const osc = c.createOscillator()
  osc.type = 'sawtooth'
  const lfo = c.createOscillator()
  lfo.frequency.value = 18
  const lfoGain = c.createGain()
  lfoGain.gain.value = 14
  lfo.connect(lfoGain).connect(osc.frequency)
  const filt = c.createBiquadFilter()
  filt.type = 'lowpass'
  filt.frequency.value = 360
  const g = c.createGain()
  const t = c.currentTime
  osc.frequency.setValueAtTime(95, t)
  osc.frequency.linearRampToValueAtTime(78, t + 0.7)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.3, t + 0.08)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85)
  osc.connect(filt).connect(g).connect(out)
  osc.start(); lfo.start()
  osc.stop(t + 0.9); lfo.stop(t + 0.9)
  return { stop: () => {} }
}

// percussive thump (drum hit) — low sine + short noise
function thump(c: AudioContext, out: GainNode, at: number, freq = 140) {
  const osc = c.createOscillator()
  osc.type = 'sine'
  const g = c.createGain()
  osc.frequency.setValueAtTime(freq, at)
  osc.frequency.exponentialRampToValueAtTime(freq * 0.6, at + 0.16)
  g.gain.setValueAtTime(0.001, at)
  g.gain.linearRampToValueAtTime(0.4, at + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.18)
  osc.connect(g).connect(out)
  osc.start(at); osc.stop(at + 0.2)
}

const chime = (c: AudioContext, out: GainNode): Voice => seq(c, out, [660, 880], 0.14)

// per-choice sounds — each clearly relates to its picture
const SOUNDS: Record<string, (c: AudioContext, out: GainNode) => Voice> = {
  run: (c, o) => whoosh(c, o, 300, 1400, 0.9, 0.3), // a rushing wind gust
  cloud: (c, o) => noise(c, o, 'lowpass', 340, 0.4, 1.6, 0.18), // soft airy calm
  mountains: (c, o) => whoosh(c, o, 900, 300, 1.3, 0.2), // high thin mountain wind
  // a flowing flute melody across different keys (loops back-to-back = non-stop)
  flute: (c, o) => seq(c, o, [523, 659, 784, 880, 784, 659, 587, 523], 0.2, 'sine'),
  // a steady drum groove (loops continuously)
  drum: (c, o) => {
    const t = c.currentTime
    thump(c, o, t, 150); thump(c, o, t + 0.25, 110); thump(c, o, t + 0.5, 150); thump(c, o, t + 0.68, 220); thump(c, o, t + 0.86, 110)
    return { stop: () => {} }
  },
  bubbles: (c, o) => {
    seq(c, o, [900, 1150, 1400, 1050], 0.12, 'sine') // little rising pops
    return noise(c, o, 'lowpass', 260, 0.4, 0.5, 0.14) // a soft blow
  },
  workshop: (c, o) => seq(c, o, [660, 660, 520, 780], 0.09, 'square'), // (kept for safety)
  bunny: (c, o) => {
    seq(c, o, [700, 1150], 0.09) // quick "hop-hop" squeak
    return { stop: () => {} }
  },
  bear: (c, o) => growl(c, o), // low animal growl
  compass: (c, o) => tone(c, o, 'triangle', 1320, 1320, 0.5, 0.2), // a clear ping
  crown: (c, o) => seq(c, o, [784, 988, 1319, 1568], 0.1), // sparkle arpeggio
  teddy: (c, o) => seq(c, o, [392, 523], 0.28, 'sine'), // warm cozy lullaby
  house: (c, o) => {
    const t = c.currentTime
    thump(c, o, t, 220); thump(c, o, t + 0.18, 220) // two little build knocks
    return seq(c, o, [523, 659], 0.16) // then a cozy chime
  },
}
