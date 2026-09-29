import '../styles/pirateIntro.css'

export function PirateIntroPage({ onBegin }) {
  return (
    <main className="pirate-intro" aria-label="Pirate fleet introduction">
      <div className="pirate-intro-layout">
        <section className="pirate-intro-copy" aria-labelledby="pirate-intro-heading">
          <h1 id="pirate-intro-heading">Commander the Pirate fleet is on the run.</h1>
          <p>We're going to need to steal, fight, and run to escape the forces against us.</p>
          <p>The Imperium, RoboCorp, and even the Rebels are all out to get us. We need your help to manage our forces.</p>
          <p className="pirate-intro-question">Are you ready?</p>
          <button className="pirate-intro-begin" type="button" onClick={onBegin}>Press to Begin</button>
        </section>
        <div className="pirate-intro-crew">
          <img className="pirate-intro-prank" src={`${import.meta.env.BASE_URL}assets/storm-commander/commanders/prank-sumatra.png`} alt="Pirate commander Prank Sumatra" draggable="false" />
          <img className="pirate-intro-lilith" src={`${import.meta.env.BASE_URL}assets/storm-commander/commanders/captain-lilith-haraway.png`} alt="Pirate captain Lilith Haraway" draggable="false" />
        </div>
      </div>
    </main>
  )
}
