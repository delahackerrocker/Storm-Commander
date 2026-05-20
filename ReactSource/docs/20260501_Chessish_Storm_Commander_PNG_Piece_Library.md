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

The faction fleets use role-consistent silhouettes with faction-dominant finishes:

```text
Pirate: black hulls with bright bold orange panels, engines, and rugged patchwork.
Imperial: ivory-white hulls with bold gold panels, engines, and royal trim.
Robocorp: blue hulls with steel trim and clean technical panels.
Rebel: purple hulls with cream trim, asymmetric streaks, and agile forms.
```

The current silhouettes intentionally push each chess role farther apart:

```text
King: broad flagship with command bridge and heavy side pods.
Queen: hammerhead command ship with a wide blunt bow and a handle-like center hull.
Rook: blocky armored gunship with squared side pods.
Bishop: narrow spear/interceptor profile.
Knight: WWII-fighter-inspired frame with long nose, straight wings, tailplane, and cockpit.
Pawn: small patrol drone with one center engine.
```

Rocket jets are not baked into these PNGs. The running React app adds faction-tinted exhaust as a runtime particle layer so it can flicker and rotate with the ships. Pawns use one center jet; larger ships use three jets. Pirate exhaust keeps the orange burn but adds black smoke and a slightly larger runtime jet. Imperial exhaust follows the same ivory/gold read as the ship art, using a white-hot core with gold flame and glow.

The faction ship PNGs also avoid baked drop shadows, oval bases, and static exhaust. The generator hardens the alpha channel into crisp transparent cutouts and rejects partial-alpha ship PNGs so runtime board effects provide motion and atmosphere without a smoky halo around the sprites.

The React asset map appends a version query string to ship image URLs. This forces browsers to fetch regenerated PNGs after art passes instead of reusing older cached ships with stale painted effects.

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
