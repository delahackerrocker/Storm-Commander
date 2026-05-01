# Storm Commander PNG Piece Library

Storm Commander chess pieces load from:

```text
public/assets/chess/storm-commander/pieces/
```

Required filenames:

```text
white-king.png
white-queen.png
white-rook.png
white-bishop.png
white-knight.png
white-pawn.png
black-king.png
black-queen.png
black-rook.png
black-bishop.png
black-knight.png
black-pawn.png
```

Dela can replace any PNG later without changing code as long as the path and filename stay the same. Recommended replacement art is a transparent-background PNG around 512x512 so it fits cleanly in the board square.

The single source of truth for piece paths is:

```text
src/chess/stormCommanderPieceAssets.js
```

`ChessPiece.jsx` reads that mapping when `pieceSet="storm-commander-png"` is passed from the Storm Commander mode.
