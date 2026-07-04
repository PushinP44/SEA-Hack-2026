// A single illustrated, emoji-free choice card. Hovering plays its sound. When a
// choice names a Farm Buddy, the card shows that character instead of an icon.
import ChoiceIcon from './ChoiceIcon'
import BuddyCharacter from './BuddyCharacter'
import { findBuddy } from '../../data/buddies'
import { playHover, stopHover } from '../../lib/sfx'
import type { Choice } from '../../data/questions'

export default function ChoiceCard({ choice, onPick }: { choice: Choice; onPick: () => void }) {
  const buddy = choice.buddyKey ? findBuddy(choice.buddyKey) : undefined
  return (
    <button
      className="choice"
      onClick={onPick}
      onPointerEnter={() => playHover(choice.icon)}
      onPointerLeave={stopHover}
      onFocus={() => playHover(choice.icon)}
      onBlur={stopHover}
    >
      <span className="choice__art">
        {buddy ? <BuddyCharacter buddy={buddy} size={74} /> : <ChoiceIcon name={choice.icon} size={74} />}
      </span>
      <span className="choice__label">{choice.label}</span>
    </button>
  )
}
