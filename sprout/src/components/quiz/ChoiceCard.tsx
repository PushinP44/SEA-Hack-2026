// A single illustrated, emoji-free choice card.
import ChoiceIcon from './ChoiceIcon'
import type { Choice } from '../../data/questions'

export default function ChoiceCard({ choice, onPick }: { choice: Choice; onPick: () => void }) {
  return (
    <button className="choice" onClick={onPick}>
      <span className="choice__art">
        <ChoiceIcon name={choice.icon} size={74} />
      </span>
      <span className="choice__label">{choice.label}</span>
    </button>
  )
}
