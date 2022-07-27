import React, { useState } from 'react';
import { capPenelty, capReplacement as capEms, goalScored, capBrutality } from '../events';
import { Led } from './Led';

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

const caps = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', 'HC', 'AC', 'TM'];
//const caps = Array.from({ length: 15 }, (_, i) => i< i + 1);
type MultiEvent = '' | 'goal' | 'ems' | 'brutality';

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

  const tapCap = (cap: string) => {
    if (multiEvent === '') {
      addEvent(capPenelty(team, cap));
    } else if (multiEvent === 'goal') {
      addEvent(goalScored(team, cap));
    } else if (multiEvent === 'ems') {
      addEvent(capEms(team, cap));
    } else if (multiEvent === 'brutality') {
      addEvent(capBrutality(team, cap));
    }
    setMultiEvent('');
  };

  const pressAction = {
    '': 'Exclusion',
    goal: 'goal scored by',
    ems: 'Exclusion Misconduct with Substitute (EMS)',
    brutality: 'brutality replacement for',
  }[multiEvent];

  return (
    <div className="SingleTeamControls">
      <h1>{team}</h1>
      <div>
        {caps.map((cap) => (
          <div key={`cap-${cap}`}>
            <label>
              Press for {pressAction} <button onClick={() => tapCap(cap)}>Cap {cap}</button>
            </label>
          </div>
        ))}
      </div>
      <hr />
      <div>
        <Led on={multiEvent === 'goal'} />
        <button onClick={() => setMultiEvent((existing) => (existing !== 'goal' ? 'goal' : ''))}>Goal</button>
      </div>
      <div>
        <Led on={multiEvent === 'ems'} />
        <button onClick={() => setMultiEvent((existing) => (existing !== 'ems' ? 'ems' : ''))}>EMS</button>
      </div>
      <div>
        <Led on={multiEvent === 'brutality'} />
        <button onClick={() => setMultiEvent((existing) => (existing !== 'brutality' ? 'brutality' : ''))}>
          Brutality
        </button>
      </div>
    </div>
  );
}
