import React, { useState } from 'react';
import './App.scss';
import { ScorerScreen } from './components/ScorerScreen';
import { GlobalControls } from './components/GlobalControls';
import { TeamControls } from './components/TeamControls';
import { EventLog } from './components/EventLog';
import { reduceState, withMatchTime } from './reducers';

function App() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const eventsWithMatchTime = withMatchTime(events);
  const globalState = reduceState(eventsWithMatchTime);
  const addEvent = (newEvent: GameEvent) => setEvents((oldEvents) => [...oldEvents, newEvent]);

  const reset = () => {
    setEvents([]);
  };

  return (
    <div className="App">
      <div>
        <button onClick={() => reset()}>Reset</button>
      </div>
      <ScorerScreen globalState={globalState} />
      <GlobalControls globalState={globalState} addEvent={addEvent} />
      <TeamControls globalState={globalState} addEvent={addEvent} />
      <EventLog events={eventsWithMatchTime} />
      {/* <pre>{JSON.stringify(globalState, null, '  ')}</pre> */}
    </div>
  );
}

export default App;
