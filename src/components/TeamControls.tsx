import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { capExclusion, capEm, capEms, goalScored, capViolentAction, capPenalty, teamTimeout } from '../events';
import { calcTimes } from '../reducers';
// import { calcTimes } from '../reducers';
import { CapEnum, GameEvent, GlobalState, SupportStaff, Team } from '../types';
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

  const [{ inTimeout }, setClock] = useState(calcTimes(globalState.timers));

  const disableControls = unPaused || inTimeout;
  useEffect(() => {
    setClock(calcTimes(globalState.timers));
    const h = setInterval(() => {
      setClock(calcTimes(globalState.timers));
    }, 50);

    return () => clearInterval(h);
  }, [globalState.timers]);

  return (
    <div className="TeamControls">
      <div className="TeamControls-split">
        <SingleTeamControls
          multiEvent={multiEvent}
          setMultiEvent={setMultiEvent}
          team="white"
          addEvent={addEvent}
          disableControls={disableControls}
          globalState={globalState}
        />
        <SingleTeamControls
          multiEvent={multiEvent}
          setMultiEvent={setMultiEvent}
          team="blue"
          addEvent={addEvent}
          disableControls={disableControls}
          globalState={globalState}
        />
      </div>
      <hr />
      <EventControls multiEvent={multiEvent} setMultiEvent={setMultiEvent} disableControls={disableControls} />
    </div>
  );
}

const caps = Object.values(CapEnum);

type MultiEvent = '' | 'goal' | 'penalty' | 'em' | 'ems' | 'violent-action';

function SingleTeamControls({
  addEvent,
  team,
  multiEvent,
  setMultiEvent,
  disableControls,
  globalState,
}: {
  addEvent: (newEvent: GameEvent) => void;
  team: Team;
  multiEvent: MultiEvent;
  setMultiEvent: Dispatch<SetStateAction<MultiEvent>>;
  disableControls: boolean;
  globalState: GlobalState;
}) {
  const tapCap = (cap: CapEnum) => {
    if (multiEvent === '') {
      addEvent(capExclusion(team, cap));
    } else if (multiEvent === 'goal') {
      addEvent(goalScored(team, cap));
    } else if (multiEvent === 'penalty') {
      addEvent(capPenalty(team, cap));
    } else if (multiEvent === 'em') {
      addEvent(capEm(team, cap));
    } else if (multiEvent === 'ems') {
      addEvent(capEms(team, cap));
    } else if (multiEvent === 'violent-action') {
      addEvent(capViolentAction(team, cap));
    }
    setMultiEvent('');
  };

  //  const { matchTimer, periodTimer, restPeriodTimer } = globalState;
  //  const clock = calcTimes(matchTimer, periodTimer, restPeriodTimer);

  const playerDisabled = (cap: CapEnum, multiEvent: MultiEvent) => {
    if (disableControls) return true;

    if (multiEvent === 'goal' && SupportStaff.includes(cap)) return true;

    // if (globalState[team].exclusions.some((e) => e.cap === cap && e.end > clock.matchClock)) return true;
    if (globalState[team].offenceCount[cap].noMoreEvents) return true;
    return false;
  };

  const pressAction = {
    '': 'Exclusion',
    goal: 'goal scored by',
    penalty: 'Penalty by',
    em: 'Exclusion Misconduct (EM)',
    ems: 'Exclusion Misconduct with Substitute (EMS)',
    'violent-action': 'violent action replacement for',
  }[multiEvent];

  return (
    <div className="SingleTeamControls">
      <h1>{team}</h1>
      <div>
        {caps.map((cap) => (
          <div key={`cap-${cap}`}>
            <label>
              Press for {pressAction}{' '}
              <button disabled={playerDisabled(cap, multiEvent)} onClick={() => tapCap(cap)}>
                Cap {cap}
              </button>
            </label>{' '}
            <small>oc: {globalState[team].offenceCount[cap].count}</small>
          </div>
        ))}

        <div style={{ marginTop: '8px' }}>
          <label>
            Press for Timeout{' '}
            <button
              disabled={disableControls || globalState[team].timeoutsLeft <= 0}
              onClick={() => addEvent(teamTimeout(team))}
            >
              T
            </button>
          </label>{' '}
        </div>
      </div>
    </div>
  );
}

function EventControls({
  multiEvent,
  setMultiEvent,
  disableControls,
}: {
  multiEvent: MultiEvent;
  setMultiEvent: Dispatch<SetStateAction<MultiEvent>>;
  disableControls: boolean;
}) {
  return (
    <div className="EventControls">
      <div className="EventControls-center-box">
        <MultiEventButton {...{ multiEvent, setMultiEvent, disableControls }} eventName="goal">
          Goal
        </MultiEventButton>
        <MultiEventButton {...{ multiEvent, setMultiEvent, disableControls }} eventName="penalty">
          Penalty
        </MultiEventButton>
        <MultiEventButton {...{ multiEvent, setMultiEvent, disableControls }} eventName="em">
          EM
        </MultiEventButton>
        <MultiEventButton {...{ multiEvent, setMultiEvent, disableControls }} eventName="ems">
          EMS
        </MultiEventButton>
        <MultiEventButton {...{ multiEvent, setMultiEvent, disableControls }} eventName="violent-action">
          Violent Action
        </MultiEventButton>
      </div>
    </div>
  );
}

function MultiEventButton({
  multiEvent,
  setMultiEvent,
  disableControls,
  eventName,
  children,
}: {
  multiEvent: MultiEvent;
  setMultiEvent: Dispatch<SetStateAction<MultiEvent>>;
  disableControls: boolean;
  eventName: MultiEvent;
  children: string;
}) {
  return (
    <label>
      <Led on={multiEvent === eventName} />
      <button
        disabled={disableControls}
        onClick={() => setMultiEvent((existing: string) => (existing !== eventName ? eventName : ''))}
      >
        {children}
      </button>
    </label>
  );
}
