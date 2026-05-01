export function SecondPage({ onBack }) {
  return (
    <main className="blank-page" aria-label="Second page">
      <button type="button" className="back-button" onClick={onBack}>
        Back
      </button>
    </main>
  )
}
