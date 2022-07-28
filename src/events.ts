import {
  BrutalityEvent,
  EmsEvent,
  ExclusionEvent,
  GameEventBase,
  GoalScoredEvent,
  MatchPauseEvent,
  MatchStartEvent,
  PeneltyEvent,
  Team,
} from './types';

export function stamp() {
  return new Date().getTime();
}

let idState = 0;
export function nextId() {
  idState = idState + 1;
  return `${idState}`.padStart(10, '0');
}

function baseEvent(): GameEventBase {
  return {
    id: nextId(),
    name: 'base-event',
    timestamp: stamp(),
  };
}

export function pauseMatch(): MatchPauseEvent {
  return {
    ...baseEvent(),
    name: 'match-pause',
  };
}

export function startMatch(): MatchStartEvent {
  return {
    ...baseEvent(),
    name: 'match-start',
  };
}

export function goalScored(team: Team, cap: string): GoalScoredEvent {
  return {
    ...baseEvent(),
    name: 'goal-scored',
    team,
    cap,
  };
}
export function capExclusion(team: Team, cap: string): ExclusionEvent {
  return {
    ...baseEvent(),
    name: 'exclusion',
    team,
    cap,
  };
}

export function capPenelty(team: Team, cap: string): PeneltyEvent {
  return {
    ...baseEvent(),
    name: 'penelty',
    team,
    cap,
  };
}
export function capEms(team: Team, cap: string): EmsEvent {
  return {
    ...baseEvent(),
    name: 'ems',
    team,
    cap,
  };
}

export function capBrutality(team: Team, cap: string): BrutalityEvent {
  return {
    ...baseEvent(),
    name: 'brutality',
    team,
    cap,
  };
}
