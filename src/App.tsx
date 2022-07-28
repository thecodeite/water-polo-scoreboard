import React, { useState } from 'react';
import './App.scss';
import { ScorerScreen } from './components/ScorerScreen';
import { GlobalControls } from './components/GlobalControls';
import { TeamControls } from './components/TeamControls';
import { EventLog } from './components/EventLog';
import { reduceState, withMatchTime } from './reducers';
import { pauseMatch, stamp, startMatch } from './events';
import { GameEvent } from './types';

function App() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const eventsWithMatchTime = withMatchTime(events);
  const globalState = reduceState(eventsWithMatchTime);
  const addEvent = (newEvent: GameEvent) => setEvents((oldEvents) => [...oldEvents, newEvent]);

  const reset = () => {
    setEvents([]);
  };

  const resetToNeop = () => {
    setEvents([
      {
        ...startMatch(),
        timestamp: stamp() - 7.9 * 60 * 1000,
      },
      {
        ...pauseMatch(),
        timestamp: stamp() - 1000,
      },
    ]);
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
