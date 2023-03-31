import { ulid } from 'ulid';
import {
  ViolentActionEvent,
  CapEnum,
  EmEvent,
  EmsEvent,
  ExclusionEvent,
  GameEventBase,
  GoalScoredEvent,
  MatchPauseEvent,
  MatchStartEvent,
  PenaltyEvent,
  Team,
  TimeoutEvent,
  UndoEventsEvent,
} from './types';

export function stamp() {
  return new Date().getTime();
}

export function nextId() {
  return ulid();
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

export function goalScored(team: Team, cap: CapEnum): GoalScoredEvent {
  return {
    ...baseEvent(),
    name: 'goal-scored',
    team,
    cap,
  };
}
export function capExclusion(team: Team, cap: CapEnum): ExclusionEvent {
  return {
    ...baseEvent(),
    name: 'exclusion',
    team,
    cap,
  };
}

export function capPenalty(team: Team, cap: CapEnum): PenaltyEvent {
  return {
    ...baseEvent(),
    name: 'penalty',
    team,
    cap,
  };
}

export function capEm(team: Team, cap: CapEnum): EmEvent {
  return {
    ...baseEvent(),
    name: 'em',
    team,
    cap,
  };
}

export function capEms(team: Team, cap: CapEnum): EmsEvent {
  return {
    ...baseEvent(),
    name: 'ems',
    team,
    cap,
  };
}

export function capViolentAction(team: Team, cap: CapEnum): ViolentActionEvent {
  return {
    ...baseEvent(),
    name: 'violent-action',
    team,
    cap,
  };
}

export function teamTimeout(team: Team): TimeoutEvent {
  return {
    ...baseEvent(),
    name: 'timeout',
    team,
  };
}

export function undoEvents(ids: string[]): UndoEventsEvent {
  return {
    ...baseEvent(),
    name: 'undo-events',
    ids,
  };
}
