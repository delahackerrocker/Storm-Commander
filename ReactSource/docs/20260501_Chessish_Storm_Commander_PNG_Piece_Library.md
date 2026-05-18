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

## Faction fleets

Storm Commander also includes four complete faction fleets:

```text
public/assets/chess/storm-commander/factions/pirate/
public/assets/chess/storm-commander/factions/imperial/
public/assets/chess/storm-commander/factions/robocorp/
public/assets/chess/storm-commander/factions/rebel/
```

Each faction folder contains:

```text
king.png
queen.png
rook.png
bishop.png
knight.png
pawn.png
```

The faction fleets use role-consistent silhouettes with faction-specific finishes:

```text
Pirate: dark charcoal hulls with orange panels and rugged patchwork.
Imperial: gold and ivory ornament with formal command silhouettes.
Robocorp: steel hulls with blue circuit accents and clean technical panels.
Rebel: cream hulls with purple marks, asymmetric streaks, and agile forms.
```

The generated preview sheet is:

```text
public/assets/chess/storm-commander/factions/preview-sheet.png
```

The current game-facing `white-*` and `black-*` PNGs remain in `pieces/` for compatibility. They are generated aliases of Robocorp for white and Pirate for black.

To regenerate the fleet PNGs:

```text
python scripts/generateStormCommanderFleets.py
```

The generator writes 512x512 transparent PNGs and refreshes the preview sheet and compatibility aliases.
