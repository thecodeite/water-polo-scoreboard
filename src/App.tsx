import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    (async () => {
      const res = await fetch(`http://localhost:4000/stream/game-1`);

      if (res.ok) {
        const newEvents = await res.json();
        setEvents(newEvents);
      } else {
        console.error(await res.text());
      }
    })();
  }, []);

  const eventsWithMatchTime = withMatchTime(events);
  const globalState = (() => {
    try {
      return reduceState(eventsWithMatchTime);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  })();
  //const addEventLocal = (newEvent: GameEvent) => setEvents((oldEvents) => [...oldEvents, newEvent]);

  const addEvent = async (newEvent: GameEvent) => {
    const res = await fetch(`http://localhost:4000/stream/game-1`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(newEvent),
    });

    if (res.ok) {
      const newEvents = await res.json();
      setEvents(newEvents);
    } else {
      console.error(await res.text());
    }
  };

  const reset = async () => {
    // setEvents([]);
    const res = await fetch(`http://localhost:4000/stream/game-1`, {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json',
      },
    });

    if (res.ok) {
      setEvents([]);
    } else {
      console.error(await res.text());
    }
  };

  const plusTime = (time: number) => {
    setEvents((oldEvents) => oldEvents.map((event) => ({ ...event, timestamp: event.timestamp - time })));
  };

  const resetToNeop = () => {
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
        <button onClick={() => resetToNeop()}>Near end of Period</button>
        <button onClick={() => resetToNextPeriod()}>Next period</button>{' '}
        <button onClick={() => plusTime(60 * 1000)}>+1:00</button>
        <button onClick={() => plusTime(10 * 1000)}>+0:10</button>
        {')'}
      </div>
      {globalState && (
        <>
          <ScorerScreen globalState={globalState} />
          <GlobalControls globalState={globalState} addEvent={addEvent} />
          <TeamControls unPaused={!!globalState.matchTimer?.at} addEvent={addEvent} />
        </>
      )}
      <EventLog events={eventsWithMatchTime} deletedEvents={globalState?.deletedEvents} />
      {/* <pre>{JSON.stringify(globalState, null, '  ')}</pre> */}
    </div>
  );
}

export default App;
