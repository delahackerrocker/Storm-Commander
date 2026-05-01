function buildMoveRows(moves) {
  const rows = []

  for (let index = 0; index < moves.length; index += 2) {
    rows.push({
      number: index / 2 + 1,
      white: moves[index],
      black: moves[index + 1] || '',
    })
  }

  return rows
}

export function MoveHistory({ moves }) {
  const rows = buildMoveRows(moves)

  return (
    <section className="move-history" aria-label="Move history">
      <h2>Moves</h2>
      {rows.length === 0 ? (
        <p className="empty-history">No moves yet</p>
      ) : (
        <ol className="move-list">
          {rows.map((row) => (
            <li key={row.number}>
              <span className="move-number">{row.number}.</span>
              <span>{row.white}</span>
              <span>{row.black}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
