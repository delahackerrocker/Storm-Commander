export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
export const RANKS_DESCENDING = ['8', '7', '6', '5', '4', '3', '2', '1']

export const BOARD_SQUARES = RANKS_DESCENDING.flatMap((rank) =>
  FILES.map((file) => `${file}${rank}`),
)

export function getSquareTone(square) {
  const fileIndex = FILES.indexOf(square[0])
  const rank = Number(square[1])

  return (fileIndex + rank) % 2 === 0 ? 'light' : 'dark'
}
