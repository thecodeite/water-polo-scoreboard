import React, { useState } from 'react';
import './App.scss';
import { ScorerScreen } from './components/ScorerScreen';
import { GlobalControls } from './components/GlobalControls';
import { TeamControls } from './components/TeamControls';
import { EventLog } from './components/EventLog';
import { reduceState, withMatchTime } from './reducers';
import { stamp, startMatch } from './events';

function App() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const eventsWithMatchTime = withMatchTime(events);
  const globalState = reduceState(eventsWithMatchTime);
  const addEvent = (newEvent: GameEvent) => setEvents((oldEvents) => [...oldEvents, newEvent]);

  const reset = () => {
    setEvents([]);
  };

  const resetToNeop = () => {
    const sme = {
      ...startMatch(),
      timestamp: stamp() - 7.5 * 60 * 1000,
    };
    setEvents([sme]);
  };

  return (
    <div className="App">
      <div>
        <button onClick={() => reset()}>Reset</button>
        {'( Debug: '}
        <button onClick={() => resetToNeop()}>Near end of Period</button>
        {')'}
      </div>
      <ScorerScreen globalState={globalState} />
      <GlobalControls globalState={globalState} addEvent={addEvent} />
      <TeamControls unPaused={!!globalState.unPausedAt} addEvent={addEvent} />
      <EventLog events={eventsWithMatchTime} />
      {/* <pre>{JSON.stringify(globalState, null, '  ')}</pre> */}
    </div>
  );
}

export default App;
