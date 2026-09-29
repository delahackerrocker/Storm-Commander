// Fixed vector silhouettes keep chess roles legible across platforms and fonts.
const SILHOUETTES = {
  p: 'M32 7a9 9 0 1 1 0 18 9 9 0 0 1 0-18ZM25 27h14v5h-3c0 9 2 13 8 17H20c6-4 8-8 8-17h-3ZM19 51h26l3 6H16Z',
  r: 'M17 8h8v7h4V8h6v7h4V8h8v16h-5l-3 23H25l-3-23h-5ZM22 49h20l5 8H17Z',
  b: 'M32 5c-3 5-13 12-13 20 0 7 5 11 13 11s13-4 13-11c0-5-4-10-8-15l-8 14-3-2 8-14ZM25 38h14l-3 4 7 7H21l7-7ZM20 51h24l4 6H16Z',
  n: 'M19 47c-1-10 4-17 15-24l-10 2-5 6-8-5 9-16 11-2 5-5 2 8c13 7 16 22 9 36ZM19 49h28l3 8H15Z',
  q: 'M13 15a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM28 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM44 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM59 15a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM10 21l12 9 2-14 8 13 8-13 2 14 12-9-11 20H21ZM22 43h20l-3 5 8 9H17l8-9Z',
  k: 'M29 5h6v6h6v6h-6v8h-6v-8h-6v-6h6ZM18 25c-8 0-9 13 3 18h22c12-5 11-18 3-18-6 0-9 5-14 5s-8-5-14-5ZM23 45h18l-2 5 8 7H17l8-7Z',
}

export function ChessPieceSilhouette({ pieceType }) {
  return (
    <svg className="storm-chess-silhouette" viewBox="0 0 64 64" aria-hidden="true">
      <path fill="currentColor" d={SILHOUETTES[pieceType]} />
    </svg>
  )
}
