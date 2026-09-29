# Approved title screens and commander portraits

Saved from the latest approved concept round on 2026-09-28. These are unchanged PNG copies of the generated masters in `output/commander-art-v1/` at the repository root. All twelve images are retained for future reuse.

| Faction | Title screen | Commander portraits |
| --- | --- | --- |
| Robocorp (blue) | `title-screens/blue-robocorp.png` | `commanders/dayna-scry.png`, `commanders/fenris-scry.png` |
| Imperial (yellow) | `title-screens/yellow-imperials.png` | `commanders/john-trace.png`, `commanders/sister-mary-wren.png` |
| Pirate (orange) | `title-screens/orange-pirates.png` | `commanders/prank-sumatra.png`, `commanders/captain-lilith-haraway.png` |
| Rebel (purple) | `title-screens/purple-rebels.png` | `commanders/lance-rosenthorn.png`, `commanders/thalia-mott.png` |

Each title image is 1672×941 and includes the title and play prompt. Portraits are 1254×1254. Character identities come from pages 30–37 of `Inspo/RebelFutureDesignDeck.pdf`, also available in the [approved Drive design deck](https://drive.google.com/file/d/166Znw1O6y-qGAB45BlMC4I2QVGrybjR7/view). Prompts, source-page references, and the full generation manifest are preserved in `output/commander-art-v1/`.

The title-screen component cycles the four images; `heroProfiles.js` maps `radioPortrait` to these commander files. Legacy portrait and full-body assets remain separate.

## iPhone portrait variants

`title-screens/portrait/` contains all four faction compositions adapted from the approved landscape screens on 2026-09-28. Each keeps both canonical commanders, a two-line title, and a small play prompt. Images are approximately 933×1686 with edge bleed for full-screen phone crops; originals remain unchanged. Generation prompts are in `output/commander-art-v1/PORTRAIT-PROMPTS.md`.
