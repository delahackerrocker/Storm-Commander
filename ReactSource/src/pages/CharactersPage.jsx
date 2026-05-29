import { STORM_COMMANDER_HERO_PROFILES } from '../storm-commander/heroes/heroProfiles'
import { getFactionDisplayName } from '../storm-commander/tactics/encounterConstants'
import '../styles/stormCommander.css'

export function CharactersPage({ onBack }) {
  return (
    <main className="storm-characters-page" aria-labelledby="characters-title">
      <div className="storm-characters-toolbar">
        <button type="button" className="back-button" onClick={onBack}>
          Back
        </button>
      </div>

      <section className="storm-characters-header">
        <h1 id="characters-title">Characters</h1>
      </section>

      <section className="storm-character-grid" aria-label="Storm Commander characters">
        {STORM_COMMANDER_HERO_PROFILES.map((hero) => (
          <article
            key={hero.id}
            className="storm-character-card"
            data-faction={hero.faction}
            style={{ '--storm-character-color': hero.color }}
          >
            <div className="storm-character-copy">
              <p className="storm-character-faction">{getFactionDisplayName(hero.faction)}</p>
              <h2>{hero.fullName}</h2>
            </div>

            <div className="storm-character-media" aria-label={`${hero.fullName} artwork`}>
              <div className="storm-character-portraits">
                {hero.assets.portraits.map((portrait, index) => (
                  <img
                    key={portrait}
                    src={portrait}
                    alt={`${hero.fullName} portrait ${index + 1}`}
                    className="storm-character-portrait"
                  />
                ))}
              </div>

              <div className="storm-character-bodies">
                {hero.assets.fullBodies.map((fullBody, index) => (
                  <img
                    key={fullBody}
                    src={fullBody}
                    alt={`${hero.fullName} full body ${index + 1}`}
                    className="storm-character-body"
                  />
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
