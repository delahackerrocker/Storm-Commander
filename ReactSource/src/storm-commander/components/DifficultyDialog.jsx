import { useEffect, useRef } from 'react'
import { DIFFICULTY_OPTIONS } from '../difficulty/difficultySettings'
import { chooseDifficulty, useDifficultySettings } from '../difficulty/useDifficultySettings'

export function DifficultyDialog({ onClose, duringMatch = false }) {
  const settings = useDifficultySettings()
  const dialogRef = useRef(null)
  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    if (dialog.showModal) dialog.showModal()
    else dialog.setAttribute('open', '')
    dialog.querySelector('input:checked')?.focus()
    return () => {
      dialog.close?.()
      previousFocus?.focus?.({ preventScroll: true })
    }
  }, [])

  return (
    <dialog ref={dialogRef} className="storm-difficulty-dialog" aria-labelledby="difficulty-title"
      onCancel={event => { event.preventDefault(); onClose() }}>
      <p className="storm-difficulty-eyebrow">YOUR GAME. YOUR PACE.</p>
      <h1 id="difficulty-title">Choose your challenge</h1>
      <p className="storm-difficulty-note">{duringMatch ? 'Saved for your next match. This battle stays as it is.' : 'Pick your pace. You can change it any time.'}</p>
      <fieldset>
        <legend className="start-accessible-label">Difficulty</legend>
        {DIFFICULTY_OPTIONS.map(option => (
          <label key={option.id} className={`storm-difficulty-option${settings.mode === option.id ? ' is-selected' : ''}`}>
            <input type="radio" name="difficulty" value={option.id} checked={settings.mode === option.id}
              onChange={() => chooseDifficulty(option.id)} aria-describedby={`difficulty-${option.id}-description`} />
            <span><strong>{option.name}{option.id === 'standard' ? <small>DEFAULT</small> : null}</strong>
              <span id={`difficulty-${option.id}-description`}>{option.description}</span></span>
          </label>
        ))}
      </fieldset>
      <p className="storm-difficulty-footnote">Adaptive changes between matches, rises slowly, and has a limit. Losses ease it back down.</p>
      <button type="button" className="storm-difficulty-done" onClick={onClose}>Done</button>
    </dialog>
  )
}
