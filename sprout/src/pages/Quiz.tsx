import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions } from '../data/questions'
import { dolls, farmBuddies, allBuddies, findBuddy, type Buddy } from '../data/buddies'
import { scoreAnswers, type Answer } from '../lib/scoring'
import { archetypes, type ArchetypeId } from '../data/archetypes'
import { matchProduct, matchOutfit, moreSuggestions, outfitColor, price } from '../lib/match'
import type { Product } from '../data/catalog'
import { fetchStory, type Story } from '../lib/story'
import { MAX_PROGRESS } from '../data/scenes'
import SceneStage from '../components/quiz/SceneStage'
import BuddyCharacter, { type Outfit } from '../components/quiz/BuddyCharacter'
import ChoiceIcon from '../components/quiz/ChoiceIcon'
import { heldToys, companions, effectKind } from '../data/effects'
import { initAudio, setMuted, setAmbient, clearAmbient, playHover, stopHover } from '../lib/sfx'
import { buildSeedancePrompt } from '../lib/storyPrompt'
import type { Choice } from '../data/questions'

type Step =
  | { kind: 'intro' }
  | { kind: 'mode' }
  | { kind: 'buddy' }
  | { kind: 'question'; index: number }
  | { kind: 'growing' }
  | { kind: 'reveal' }

type PickMode = 'have' | 'want' | null

// Per-archetype bloom colour for the reveal flower (no emoji).
const ARCH_COLOR: Record<ArchetypeId, string> = {
  adventurer: '#e6c766',
  dreamer: '#d99aa2',
  nurturer: '#b9a9df',
  maker: '#e08a4e',
}

// Dolls → a wearable outfit; animals → a themed companion product.
function pickProduct(winnerId: ArchetypeId, b: Buddy): Product {
  return b.kind === 'doll' ? matchOutfit(winnerId) : matchProduct(winnerId, b.theme)
}

// A choice's picture: a real Farm Buddy if it names one, else its illustrated icon.
function choiceArt(choice: Choice, size: number) {
  const b = choice.buddyKey ? findBuddy(choice.buddyKey) : undefined
  return b ? <BuddyCharacter buddy={b} size={size} /> : <ChoiceIcon name={choice.icon} size={size} />
}

export default function Quiz() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>({ kind: 'intro' })
  const [buddy, setBuddy] = useState<Buddy | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [story, setStory] = useState<Story | null>(null)
  const [childName, setChildName] = useState('')
  const [added, setAdded] = useState(false)
  const [pickMode, setPickMode] = useState<PickMode>(null)
  const [muted, setMutedState] = useState(false)
  function toggleMute() {
    setMutedState((m) => {
      setMuted(!m)
      return !m
    })
  }
  // Click impact: the icon of the last-picked choice + a nonce so the scene
  // re-fires a burst even if the same icon is picked twice.
  const [burst, setBurst] = useState<{ icon: string; n: number } | undefined>()
  const burstN = useRef(0)

  // Icons of the answers on the current path, in question order — each one is
  // dropped into the scene along the path so the child watches the story build.
  const chosen = [...answers]
    .sort((a, b) => a.questionId - b.questionId)
    .map((a) => questions.find((q) => q.id === a.questionId)?.choices.find((c) => c.id === a.choiceId)?.icon)
    .filter((x): x is string => Boolean(x))

  const { winner } = scoreAnswers(answers)
  const archetype = archetypes[winner]
  // Dolls are shown *wearing* a suggested outfit; Farm-Buddy animals get a
  // themed companion product (an animal in a dress reads wrong).
  const isDoll = buddy?.kind === 'doll'
  const product = buddy ? pickProduct(winner, buddy) : matchProduct(winner)
  const outfit: Outfit | undefined =
    buddy && isDoll ? { color: outfitColor(product, ARCH_COLOR[winner]), label: product.name } : undefined
  // Two extra picks for the reveal's "2 you may like" row.
  const suggestions = buddy ? moreSuggestions(winner, [product.id]) : []
  // Everything the child collected — shown on the doll at the reveal.
  const collectedToys = buddy ? heldToys(chosen) : []
  const collectedPals = buddy ? companions(chosen) : []

  // The scene's progress (0..MAX) is derived from the current step, so the
  // world stays in lockstep with the questions and rewinds on Back.
  const progress =
    step.kind === 'question'
      ? step.index
      : step.kind === 'growing' || step.kind === 'reveal'
        ? MAX_PROGRESS
        : 0

  function reset() {
    setStep({ kind: 'intro' })
    setBuddy(null)
    setAnswers([])
    setStory(null)
    setChildName('')
    setAdded(false)
    setBurst(undefined)
    setPickMode(null)
    clearAmbient()
  }

  function choose(b: Buddy) {
    setBuddy(b)
    setStep({ kind: 'question', index: 0 })
  }

  function surpriseMe() {
    setPickMode(null)
    const b = allBuddies[Math.floor(Math.random() * allBuddies.length)]
    choose(b)
  }

  function goBack() {
    if (step.kind === 'question') {
      if (step.index === 0) {
        setStep({ kind: 'buddy' })
      } else {
        const prevId = questions[step.index].id
        setAnswers((a) => a.filter((x) => x.questionId !== prevId))
        setStep({ kind: 'question', index: step.index - 1 })
      }
    } else if (step.kind === 'buddy') {
      setStep({ kind: 'mode' })
    } else if (step.kind === 'mode') {
      setStep({ kind: 'intro' })
    } else if (step.kind === 'intro') {
      navigate('/')
    } else {
      reset()
    }
  }

  function pickChoice(questionId: number, choiceId: string, index: number) {
    const next = [...answers.filter((a) => a.questionId !== questionId), { questionId, choiceId }]
    setAnswers(next)
    // Fire a themed burst in the scene for the tapped choice, and keep its sound
    // looping softly in the background (one ambient per type; new pick replaces).
    const icon = questions[index].choices.find((c) => c.id === choiceId)?.icon
    if (icon) {
      setBurst({ icon, n: ++burstN.current })
      const k = effectKind(icon)
      if (k) setAmbient(k, icon)
    }
    if (index + 1 < questions.length) {
      setStep({ kind: 'question', index: index + 1 })
    } else {
      startGrowing(next)
    }
  }

  async function startGrowing(finalAnswers: Answer[]) {
    setStep({ kind: 'growing' })
    const result = scoreAnswers(finalAnswers)
    const arch = archetypes[result.winner]
    const prod = buddy ? pickProduct(result.winner, buddy) : matchProduct(result.winner)
    const labels = finalAnswers.map((a) => {
      const q = questions.find((q) => q.id === a.questionId)
      return q?.choices.find((c) => c.id === a.choiceId)?.label ?? ''
    })
    // Log a full Seedance video-prompt storyboard of the whole journey, so a
    // non-interactive fairytale video could be generated from this exact play.
    console.log(
      '%cSPROUT → Seedance storyboard prompt (copy everything below)',
      'font-weight:bold;color:#7a5cff;font-size:13px',
    )
    console.log(
      buildSeedancePrompt({
        buddy: buddy!,
        answers: finalAnswers,
        winner: result.winner,
        product: prod,
        outfitColor: buddy?.kind === 'doll' ? outfitColor(prod, ARCH_COLOR[result.winner]) : undefined,
      }),
    )

    const st = await fetchStory({ buddy: buddy!, archetype: arch, product: prod, choiceLabels: labels })
    // Let the garden finish blooming before revealing.
    setTimeout(() => {
      setStory(st)
      setStep({ kind: 'reveal' })
    }, 2600)
  }

  async function personalize() {
    if (!childName.trim() || !buddy) return
    const labels = answers.map((a) => {
      const q = questions.find((q) => q.id === a.questionId)
      return q?.choices.find((c) => c.id === a.choiceId)?.label ?? ''
    })
    const st = await fetchStory({ buddy, archetype, product, choiceLabels: labels, childName: childName.trim() })
    setStory(st)
  }

  const showProgress = step.kind === 'question' || step.kind === 'growing' || step.kind === 'reveal'

  return (
    <div className="quiz">
      {/* The continuous animated world sits behind everything. */}
      <SceneStage
        progress={progress}
        buddy={step.kind === 'intro' || step.kind === 'mode' || step.kind === 'buddy' ? null : buddy}
        outfit={step.kind === 'reveal' ? outfit : undefined}
        chosen={chosen}
        burst={burst}
      />

      <div className="quiz__frame">
        <div className="quiz__top">
          <button className="quiz__back" onClick={goBack}>
            ‹ {step.kind === 'intro' ? 'Home' : 'Back'}
          </button>
          {showProgress && (
            <div className="quiz__progress">
              {questions.map((_, i) => (
                <span key={i} className={'quiz__dot' + (i <= progress ? ' quiz__dot--on' : '')} />
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="quiz__back quiz__mute" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                  <path d="M4 9 h4 l5 -4 v14 l-5 -4 H4 Z" fill="currentColor" />
                  <path d="M16 9 l5 6 M21 9 l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                  <path d="M4 9 h4 l5 -4 v14 l-5 -4 H4 Z" fill="currentColor" />
                  <path d="M16 8 q3 4 0 8 M18.5 6 q5 6 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
            <button
              className="quiz__back"
              onClick={reset}
              style={{ visibility: step.kind === 'intro' || step.kind === 'mode' ? 'hidden' : 'visible' }}
            >
              Restart
            </button>
          </div>
        </div>

        <div
          className={
            'quiz__body ' +
            (step.kind === 'question' || step.kind === 'growing'
              ? 'quiz__body--top'
              : step.kind === 'intro' || step.kind === 'mode'
                ? 'quiz__body--center'
                : 'quiz__body--scroll') // buddy picker + reveal scroll from the top (tall content)
          }
        >
          {step.kind === 'intro' && (
            <div className="panel">
              <h1 className="quiz__title">SPROUT</h1>
              <p className="quiz__tag">Plant a story · grow the perfect gift</p>
              <p className="quiz__scene">
                A gentle wind is blowing over the hills of Apple Park. Pick a buddy and let’s go on a
                little adventure together — no reading required.
              </p>
              <button
                className="btn btn--sprout btn--lg"
                onClick={() => {
                  initAudio() // unlock audio on the first gesture
                  setStep({ kind: 'mode' })
                }}
              >
                Start playing
              </button>
            </div>
          )}

          {step.kind === 'mode' && (
            <div className="panel">
              <h2 className="quiz__q">Pick your buddy…</h2>
              <p className="quiz__scene">How would you like to choose?</p>
              <div className="modes">
                <button
                  className="mode-card"
                  onClick={() => {
                    setPickMode('have')
                    setStep({ kind: 'buddy' })
                  }}
                >
                  <span className="mode-card__title">One I have</span>
                  <span className="mode-card__sub">Play as a buddy you already own</span>
                </button>
                <button
                  className="mode-card"
                  onClick={() => {
                    setPickMode('want')
                    setStep({ kind: 'buddy' })
                  }}
                >
                  <span className="mode-card__title">One I want</span>
                  <span className="mode-card__sub">Try one you’d love to have</span>
                </button>
                <button className="mode-card mode-card--surprise" onClick={surpriseMe}>
                  <span className="mode-card__title">Surprise me!</span>
                  <span className="mode-card__sub">We’ll pick a buddy for you</span>
                </button>
              </div>
            </div>
          )}

          {step.kind === 'buddy' && (
            <div className="panel panel--wide">
              <h2 className="quiz__q">
                {pickMode === 'have' ? 'Which buddy do you have?' : pickMode === 'want' ? 'Which buddy would you love?' : 'Choose your Buddy'}
              </h2>
              <p className="quiz__scene">They’ll be the hero of the story.</p>
              <div className="buddy__group">Apple Park Kids dolls</div>
              <div className="buddies">
                {dolls.map((b) => (
                  <BuddyPick key={b.key} b={b} onPick={() => choose(b)} />
                ))}
              </div>
              <div className="buddy__group">Organic Farm Buddies</div>
              <div className="buddies">
                {farmBuddies.map((b) => (
                  <BuddyPick key={b.key} b={b} onPick={() => choose(b)} />
                ))}
              </div>
            </div>
          )}

          {step.kind === 'question' && (
            /* one thought bubble above the head: the question + the two big
               choices live together, so it reads as "let's decide together" */
            <div className="thinkbubble" key={step.index}>
              <div className="thinkbubble__cloud">
                <p className="tbubble__q">
                  {questions[step.index].ask.replace('{name}', buddy?.name ?? 'friend')}
                </p>
                <div className="tbubble__choices">
                  {questions[step.index].choices.map((c) => (
                    <button
                      key={c.id}
                      className="tchoice"
                      onClick={() => pickChoice(questions[step.index].id, c.id, step.index)}
                      onPointerEnter={() => playHover(c.icon)}
                      onPointerLeave={stopHover}
                    >
                      <span className="tchoice__art">{choiceArt(c, 120)}</span>
                      <span className="tchoice__label">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <i className="thinkbubble__b1" />
              <i className="thinkbubble__b2" />
            </div>
          )}

          {step.kind === 'growing' && (
            <div className="panel panel--top">
              <div className="spinner" />
              <p className="quiz__scene">Your garden is blooming into a story…</p>
            </div>
          )}

          {step.kind === 'reveal' && buddy && (
            <div className="panel reveal">
              <div className="reveal__hero">
                {collectedPals.slice(0, 1).map((key, k) => {
                  const pb = findBuddy(key)
                  return pb ? (
                    <span key={k} className="reveal__pal">
                      <BuddyCharacter buddy={pb} size={78} emotion="love" />
                    </span>
                  ) : null
                })}
                <BuddyCharacter buddy={buddy} size={156} outfit={outfit} held={collectedToys} emotion="excited" />
              </div>
              {(collectedToys.length > 0 || collectedPals.length > 0) && (
                <p className="reveal__collected">
                  …with everything {buddy.name} gathered along the way.
                </p>
              )}
              <h2 className="reveal__type">
                {buddy.name} is {archetype.title.replace('The ', 'a little ').toLowerCase()}!
              </h2>
              {isDoll && (
                <p className="reveal__wearing">
                  …and looks perfect in the <strong>{product.name}</strong>.
                </p>
              )}

              {/* The story is the centerpiece — it stars this buddy + outfit. */}
              {story && (
                <div className="story story--lead">
                  <h3 className="story__title">{story.title}</h3>
                  <p className="story__body">{story.body}</p>
                </div>
              )}

              <div className="match">
                <span className="match__thumb">
                  <ChoiceIcon name="gift" size={52} />
                </span>
                <div className="match__info">
                  <div className="match__label">Their perfect gift</div>
                  <div className="match__name">{product.name}</div>
                  <div className="match__price">
                    <PriceTag product={product} />
                  </div>
                </div>
              </div>

              {suggestions.length > 0 && (
                <div className="suggest">
                  <div className="suggest__label">2 you may also like</div>
                  <div className="suggest__row">
                    {suggestions.map((s) => (
                      <a key={s.id} className="suggest__card" href={s.url} target="_blank" rel="noreferrer">
                        <span className="suggest__thumb">
                          <BuddyCharacter buddy={buddy} size={66} outfit={{ color: outfitColor(s, ARCH_COLOR[winner]) }} />
                        </span>
                        <span className="suggest__name">{s.name}</span>
                        <span className="suggest__price">
                          <PriceTag product={s} />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="stack">
                {added ? (
                  <span className="toast">
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden style={{ marginRight: 6, verticalAlign: '-2px' }}>
                      <path d="M5 13 l4 4 L19 7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Added to cart
                  </span>
                ) : (
                  <button className="btn btn--sprout btn--lg" onClick={() => setAdded(true)}>
                    Add to cart · {money(price(product).now)}
                  </button>
                )}
                <div className="keepsake">
                  <p className="quiz__scene" style={{ margin: '4px 0' }}>
                    Make it a keepsake — add your child’s name:
                  </p>
                  <input
                    placeholder="Child’s first name"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                  />
                  <button className="btn btn--ghost" onClick={personalize} disabled={!childName.trim()}>
                    Personalize the story
                  </button>
                </div>
                <button className="linkish" onClick={reset}>
                  Play again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BuddyPick({ b, onPick }: { b: Buddy; onPick: () => void }) {
  return (
    <button className="buddy" onClick={onPick}>
      <span className="buddy__avatar">
        <BuddyCharacter buddy={b} size={56} />
      </span>
      <span className="buddy__name">{b.name}</span>
      <span className="buddy__kind">{b.kind === 'doll' ? 'Doll' : b.theme}</span>
    </button>
  )
}

function money(n: number) {
  return `$${n.toFixed(2)}`
}

function PriceTag({ product }: { product: ReturnType<typeof matchProduct> }) {
  const p = price(product)
  return (
    <>
      <span className={'card__now' + (p.onSale ? ' card__now--sale' : '')}>{money(p.now)}</span>
      {p.onSale && <span className="card__was">{money(p.was)}</span>}
    </>
  )
}
