import React, { useState } from 'react';
import { capPenelty, goalScored } from '../events';

export function TeamControls({
  globalState,
  addEvent,
}: {
  globalState: GlobalState;
  addEvent: (newEvent: GameEvent) => void;
}) {
  return (
    <div className="TeamControls">
      <SingleTeamControls team="white" globalState={globalState} addEvent={addEvent} />
      <SingleTeamControls team="blue" globalState={globalState} addEvent={addEvent} />
    </div>
  );
}

const caps = Array.from({ length: 5 }, (_, i) => i + 1);
type MultiEvent = '' | 'goal';

function SingleTeamControls({
  globalState,
  addEvent,
  team,
}: {
  globalState: GlobalState;
  addEvent: (newEvent: GameEvent) => void;
  team: Team;
}) {
  const [multiEvent, setMultiEvent] = useState<MultiEvent>('');

  const tapCap = (cap: number) => {
    if (multiEvent === '') {
      addEvent(capPenelty(team, cap));
    } else if (multiEvent === 'goal') {
      addEvent(goalScored(team, cap));
    }
    setMultiEvent('');
  };

  return (
    <div className="SingleTeamControls">
      <h1>{team}</h1>
      <div>
        {caps.map((cap) => (
          <div key={`cap-${cap}`}>
            <button onClick={() => tapCap(cap)}>Cap {cap}</button>
          </div>
        ))}
      </div>
      <hr />
      <div>
        <button onClick={() => setMultiEvent('goal')}>Goal</button>
      </div>
    </div>
  );
}
