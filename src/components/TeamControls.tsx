import React, { Dispatch, SetStateAction, useState } from 'react';
import { capExclusion, capEm, capEms, goalScored, capBrutality, capPenelty } from '../events';
import { calcTimes } from '../reducers';
import { CapEnum, GameEvent, GlobalState, Team } from '../types';
import { Led } from './Led';

import './TeamControls.scss';

export function TeamControls({
  unPaused,
  addEvent,
  globalState,
}: {
  unPaused: boolean;
  addEvent: (newEvent: GameEvent) => void;
  globalState: GlobalState;
}) {
  const [multiEvent, setMultiEvent] = useState<MultiEvent>('');

  return (
    <div className="TeamControls">
      <div className="TeamControls-split">
        <SingleTeamControls
          multiEvent={multiEvent}
          setMultiEvent={setMultiEvent}
          team="white"
          addEvent={addEvent}
          unPaused={unPaused}
          globalState={globalState}
        />
        <SingleTeamControls
          multiEvent={multiEvent}
          setMultiEvent={setMultiEvent}
          team="blue"
          addEvent={addEvent}
          unPaused={unPaused}
          globalState={globalState}
        />
      </div>
      <hr />
      <EventControls multiEvent={multiEvent} setMultiEvent={setMultiEvent} unPaused={unPaused} />
    </div>
  );
}

const caps = Object.values(CapEnum);

type MultiEvent = '' | 'goal' | 'penelty' | 'em' | 'ems' | 'brutality';

function SingleTeamControls({
  addEvent,
  team,
  multiEvent,
  setMultiEvent,
  unPaused,
  globalState,
}: {
  addEvent: (newEvent: GameEvent) => void;
  team: Team;
  multiEvent: MultiEvent;
  setMultiEvent: Dispatch<SetStateAction<MultiEvent>>;
  unPaused: boolean;
  globalState: GlobalState;
}) {
  const tapCap = (cap: CapEnum) => {
    if (multiEvent === '') {
      addEvent(capExclusion(team, cap));
    } else if (multiEvent === 'goal') {
      addEvent(goalScored(team, cap));
    } else if (multiEvent === 'penelty') {
      addEvent(capPenelty(team, cap));
    } else if (multiEvent === 'em') {
      addEvent(capEm(team, cap));
    } else if (multiEvent === 'ems') {
      addEvent(capEms(team, cap));
    } else if (multiEvent === 'brutality') {
      addEvent(capBrutality(team, cap));
    }
    setMultiEvent('');
  };

  const { matchTimer, periodTimer, restPeriodTimer } = globalState;
  const clock = calcTimes(matchTimer, periodTimer, restPeriodTimer);

  const playerDisabled = (cap: CapEnum) => {
    if (unPaused) return true;
    if (globalState[team].exclusions.some((e) => e.cap === cap && e.end > clock.matchClock)) return true;
    if (globalState[team].offenceCount[cap].noMoreEvents) return true;
    return false;
  };

  const pressAction = {
    '': 'Exclusion',
    goal: 'goal scored by',
    penelty: 'Penelty by',
    em: 'Exclusion Misconduct (EM)',
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
              Press for {pressAction}{' '}
              <button disabled={playerDisabled(cap)} onClick={() => tapCap(cap)}>
                Cap {cap}
              </button>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventControls({
  multiEvent,
  setMultiEvent,
  unPaused,
}: {
  multiEvent: MultiEvent;
  setMultiEvent: Dispatch<SetStateAction<MultiEvent>>;
  unPaused: boolean;
}) {
  return (
    <div className="EventControls">
      <div className="EventControls-center-box">
        <MultiEventButton {...{ multiEvent, setMultiEvent, unPaused }} eventName="goal">
          Goal
        </MultiEventButton>
        <MultiEventButton {...{ multiEvent, setMultiEvent, unPaused }} eventName="penelty">
          Penelty
        </MultiEventButton>
        <MultiEventButton {...{ multiEvent, setMultiEvent, unPaused }} eventName="em">
          EM
        </MultiEventButton>
        <MultiEventButton {...{ multiEvent, setMultiEvent, unPaused }} eventName="ems">
          EMS
        </MultiEventButton>
        <MultiEventButton {...{ multiEvent, setMultiEvent, unPaused }} eventName="brutality">
          Brutality
        </MultiEventButton>
      </div>
    </div>
  );
}

function MultiEventButton({
  multiEvent,
  setMultiEvent,
  unPaused,
  eventName,
  children,
}: {
  multiEvent: MultiEvent;
  setMultiEvent: Dispatch<SetStateAction<MultiEvent>>;
  unPaused: boolean;
  eventName: MultiEvent;
  children: string;
}) {
  return (
    <label>
      <Led on={multiEvent === eventName} />
      <button
        disabled={unPaused}
        onClick={() => setMultiEvent((existing: string) => (existing !== eventName ? eventName : ''))}
      >
        {children}
      </button>
    </label>
  );
}
