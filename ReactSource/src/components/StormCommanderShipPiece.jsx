const EXHAUST_STREAMS = ['left', 'center', 'right']
const PAWN_EXHAUST_STREAMS = ['center']

function getExhaustStreams(pieceType) {
  return pieceType === 'p' ? PAWN_EXHAUST_STREAMS : EXHAUST_STREAMS
}

export function StormCommanderShipPiece({
  alt,
  faction,
  imageClassName,
  pieceType,
  pieceRotation,
  src,
}) {
  const exhaustStreams = getExhaustStreams(pieceType)

  return (
    <span
      className="storm-ship-piece"
      data-faction={faction || undefined}
      data-piece-type={pieceType || undefined}
      style={pieceRotation ? { transform: `rotate(${pieceRotation})` } : undefined}
    >
      <span className="storm-rocket-exhaust-cluster" aria-hidden="true">
        {exhaustStreams.map((stream) => (
          <span key={stream} className={`storm-rocket-exhaust storm-rocket-exhaust-${stream}`} />
        ))}
      </span>
      <img
        className={imageClassName}
        src={src}
        alt={alt}
        data-faction={faction || undefined}
        draggable="false"
      />
    </span>
  )
}
