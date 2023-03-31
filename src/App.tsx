import React, { useState } from 'react';
import './App.scss';
import { ScorerScreen } from './components/ScorerScreen';
import { GlobalControls } from './components/GlobalControls';
import { TeamControls } from './components/TeamControls';
import { EventLog } from './components/EventLog';
import { reduceState, withMatchTime } from './reducers';
import { pauseMatch, stamp, startMatch } from './events';
import { GameEvent } from './types';

function buildTimeline(...entries: [() => GameEvent, number][]) {
  let now = stamp();
  return [...entries]
    .reverse()
    .map(([ge, delay]) => ({
      ...ge(),
      timestamp: (now -= delay),
    }))
    .reverse();
}

function App() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const eventsWithMatchTime = withMatchTime(events);
  const globalState = (() => {
    try {
      return reduceState(eventsWithMatchTime);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  })();
  const unPaused = !!globalState?.timers.matchTimer?.at;
  const addEvent = (newEvent: GameEvent) => setEvents((oldEvents) => [...oldEvents, newEvent]);

  const reset = () => {
    setEvents([]);
  };

  const plusTime = (time: number) => {
    if (unPaused) {
      setEvents((oldEvents) => oldEvents.map((event) => ({ ...event, timestamp: event.timestamp - time })));
    } else {
      setEvents((oldEvents) =>
        oldEvents.map((event, i) =>
          i < oldEvents.length - 1 ? { ...event, timestamp: event.timestamp - time } : event,
        ),
      );
    }
  };

  const resetToNearEndOfPeriod = () => {
    setEvents(
      buildTimeline(
        //
        [startMatch, 8 * 60 * 1000 - 2000],
        [pauseMatch, 1000],
      ),
    );
  };

  const resetToNextPeriod = () => {
    setEvents(
      buildTimeline(
        //
        [startMatch, 8 * 60 * 1000 + 2000],
        [pauseMatch, 2 * 60 * 1000],
      ),
    );
  };

  return (
    <div className="App">
      <div>
        <button onClick={() => reset()}>Reset</button>
        {'( Debug: '}
        <button onClick={() => resetToNearEndOfPeriod()}>Reset to Near end of Period</button>
        <button onClick={() => resetToNextPeriod()}>Reset to Next period</button>
        {` | `}
        <button onClick={() => plusTime(60 * 1000)}>+1:00</button>
        <button onClick={() => plusTime(10 * 1000)}>+0:10</button>
        {')'}
      </div>
      {globalState && (
        <>
          <ScorerScreen globalState={globalState} />
          <GlobalControls globalState={globalState} addEvent={addEvent} />
          <TeamControls globalState={globalState} unPaused={unPaused} addEvent={addEvent} />
        </>
      )}
      <EventLog events={eventsWithMatchTime} deletedEvents={globalState?.deletedEvents} />
      {/* <pre>{JSON.stringify(globalState, null, '  ')}</pre> */}
    </div>
  );
}

export default App;
