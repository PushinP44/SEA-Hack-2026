import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions } from '../data/questions'
import { dolls, farmBuddies, type Buddy } from '../data/buddies'
import { scoreAnswers, type Answer } from '../lib/scoring'
import { archetypes } from '../data/archetypes'
import { matchProduct, price } from '../lib/match'
import { fetchStory, type Story } from '../lib/story'

type Step =
  | { kind: 'intro' }
  | { kind: 'buddy' }
  | { kind: 'question'; index: number }
  | { kind: 'growing' }
  | { kind: 'reveal' }

const GROW_STAGES = ['🌱', '🌿', '🪴', '🌸']

export default function Quiz() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>({ kind: 'intro' })
  const [buddy, setBuddy] = useState<Buddy | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [story, setStory] = useState<Story | null>(null)
  const [growStage, setGrowStage] = useState(0)
  const [childName, setChildName] = useState('')
  const [added, setAdded] = useState(false)

  // Deterministic result (only meaningful once all answers are in).
  const { winner } = scoreAnswers(answers)
  const archetype = archetypes[winner]
  const product = buddy ? matchProduct(winner, buddy.theme) : matchProduct(winner)

  function reset() {
    setStep({ kind: 'intro' })
    setBuddy(null)
    setAnswers([])
    setStory(null)
    setGrowStage(0)
    setChildName('')
    setAdded(false)
  }

  function pickChoice(questionId: number, choiceId: string, index: number) {
    const next = [...answers.filter((a) => a.questionId !== questionId), { questionId, choiceId }]
    setAnswers(next)
    if (index + 1 < questions.length) {
      setStep({ kind: 'question', index: index + 1 })
    } else {
      startGrowing(next)
    }
  }

  async function startGrowing(finalAnswers: Answer[]) {
    setStep({ kind: 'growing' })
    setGrowStage(0)
    // Animate the seed → bloom while the story renders.
    let s = 0
    const timer = setInterval(() => {
      s += 1
      setGrowStage(Math.min(s, GROW_STAGES.length - 1))
    }, 900)

    const result = scoreAnswers(finalAnswers)
    const arch = archetypes[result.winner]
    const prod = buddy ? matchProduct(result.winner, buddy.theme) : matchProduct(result.winner)
    const labels = finalAnswers.map((a) => {
      const q = questions.find((q) => q.id === a.questionId)
      return q?.choices.find((c) => c.id === a.choiceId)?.label ?? ''
    })

    const st = await fetchStory({
      buddy: buddy!,
      archetype: arch,
      product: prod,
      choiceLabels: labels,
    })

    // Ensure the growing animation shows for a beat even if the API is instant.
    setTimeout(() => {
      clearInterval(timer)
      setGrowStage(GROW_STAGES.length - 1)
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
    const st = await fetchStory({
      buddy,
      archetype,
      product,
      choiceLabels: labels,
      childName: childName.trim(),
    })
    setStory(st)
  }

  const totalSteps = questions.length
  const progress =
    step.kind === 'question' ? step.index : step.kind === 'growing' || step.kind === 'reveal' ? totalSteps : -1

  return (
    <div className="quiz">
      <div className="quiz__frame">
        <div className="quiz__top">
          <button
            className="quiz__back"
            onClick={() => (step.kind === 'intro' ? navigate('/') : reset())}
          >
            ‹ {step.kind === 'intro' ? 'Home' : 'Restart'}
          </button>
          {progress >= 0 && (
            <div className="quiz__progress">
              {questions.map((_, i) => (
                <span key={i} className={'quiz__dot' + (i <= progress ? ' quiz__dot--on' : '')} />
              ))}
            </div>
          )}
        </div>

        <div className="quiz__body">
          {step.kind === 'intro' && (
            <>
              <div className="pot">🪴</div>
              <h1 className="quiz__title">SPROUT</h1>
              <p className="quiz__tag">Plant a story · grow the perfect gift</p>
              <p className="quiz__scene">
                A friend gave you a bag of mysterious seeds. “As we stay focused, the seed will grow
                and reflect your true nature.” Shall we plant one?
              </p>
              <div className="stack" style={{ marginTop: 26 }}>
                <button className="btn btn--sprout btn--lg" onClick={() => setStep({ kind: 'buddy' })}>
                  Start playing
                </button>
              </div>
            </>
          )}

          {step.kind === 'buddy' && (
            <>
              <p className="quiz__scene">First, pick the buddy who will star in the story.</p>
              <h2 className="quiz__q">Choose your Buddy</h2>
              <div className="buddy__group">🧒 Apple Park Kids dolls</div>
              <div className="buddies">
                {dolls.map((b) => (
                  <BuddyCard key={b.key} b={b} onPick={() => choose(b)} />
                ))}
              </div>
              <div className="buddy__group">🐾 Organic Farm Buddies</div>
              <div className="buddies">
                {farmBuddies.map((b) => (
                  <BuddyCard key={b.key} b={b} onPick={() => choose(b)} />
                ))}
              </div>
            </>
          )}

          {step.kind === 'question' && (
            <>
              <div className="pot" style={{ fontSize: 54 }}>
                {buddy?.emoji}
              </div>
              <p className="quiz__scene">{questions[step.index].scene}</p>
              <h2 className="quiz__q">{questions[step.index].prompt}</h2>
              <div className="choices">
                {questions[step.index].choices.map((c) => (
                  <button
                    key={c.id}
                    className="choice"
                    onClick={() => pickChoice(questions[step.index].id, c.id, step.index)}
                  >
                    <span className="choice__emoji">{c.emoji}</span>
                    <span className="choice__label">{c.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step.kind === 'growing' && (
            <div className="grow">
              <div className="grow__stage" key={growStage}>
                {GROW_STAGES[growStage]}
              </div>
              <div className="spinner" />
              <p className="grow__text">Your seed is growing into a story…</p>
            </div>
          )}

          {step.kind === 'reveal' && buddy && (
            <div className="reveal">
              <div className="reveal__flower">{archetype.emoji}</div>
              <div className="reveal__flowername">{archetype.flower}</div>
              <h2 className="reveal__type">{archetype.title}</h2>
              <p className="reveal__blurb">
                {buddy.name} is {archetype.title.replace('The ', '').toLowerCase()}. {archetype.blurb}
              </p>

              {story && (
                <div className="story">
                  <h3 className="story__title">{story.title}</h3>
                  <p className="story__body">{story.body}</p>
                </div>
              )}

              <div className="match">
                <span className="match__thumb">🎁</span>
                <div className="match__info">
                  <div className="match__label">Their perfect gift</div>
                  <div className="match__name">{product.name}</div>
                  <div className="match__price">
                    <PriceTag product={product} />
                  </div>
                </div>
              </div>

              <div className="stack">
                {added ? (
                  <span className="toast">✓ Added to cart</span>
                ) : (
                  <button className="btn btn--sprout btn--lg" onClick={() => setAdded(true)}>
                    Add to cart · {money(price(product).now)}
                  </button>
                )}

                <div className="keepsake" style={{ marginTop: 10 }}>
                  <p className="grow__text">Make it a keepsake — add your child’s name:</p>
                  <input
                    placeholder="Child’s first name"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                  />
                  <button className="btn btn--ghost" onClick={personalize} disabled={!childName.trim()}>
                    ✨ Personalize the story
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

  function choose(b: Buddy) {
    setBuddy(b)
    setStep({ kind: 'question', index: 0 })
  }
}

function BuddyCard({ b, onPick }: { b: Buddy; onPick: () => void }) {
  return (
    <button className="buddy" onClick={onPick}>
      <span className="buddy__emoji">{b.emoji}</span>
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
