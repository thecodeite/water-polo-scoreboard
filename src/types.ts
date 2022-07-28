export type Team = 'white' | 'blue';

type TimeStamp = number;
export interface GameEventBase {
  id: string;
  name: string;
  timestamp: TimeStamp;
  team?: Team;
  cap?: string;
}

export interface GameEventCap extends GameEventBase {
  team: Team;
  cap: string;
}

export interface MatchPauseEvent extends GameEventBase {
  name: 'match-pause';
}
export interface MatchStartEvent extends GameEventBase {
  name: 'match-start';
}

export interface GoalScoredEvent extends GameEventCap {
  name: 'goal-scored';
}

export interface ExclusionEvent extends GameEventCap {
  name: 'exclusion';
}

export interface PeneltyEvent extends GameEventCap {
  name: 'penelty';
}

export interface EmsEvent extends GameEventCap {
  name: 'ems';
}

export interface BrutalityEvent extends GameEventCap {
  name: 'brutality';
}

/* Vistual Events */
export interface GameEventVirtual extends GameEventBase {
  isVirtual: boolean;
}
export interface RestStartEvent extends GameEventVirtual {
  name: 'rest-start';
}

export interface PeriodEndEvent extends GameEventVirtual {
  name: 'period-end';
}

export type GameEvent =
  | MatchPauseEvent
  | MatchStartEvent
  | GoalScoredEvent
  | ExclusionEvent
  | PeneltyEvent
  | EmsEvent
  | BrutalityEvent
  | RestStartEvent
  | PeriodEndEvent;

export interface RelativeTiming {
  periodTime: number;
  period: number;
  matchTime: number;
  restPeriodTime: number;
  meaning?: string;
}

export type GameEventWithMatchTime = GameEvent & RelativeTiming;

export interface Exclusion {
  id: string;
  cap: number;
  start: number;
  end: number;
}

export interface TeamStats {
  goals: number;
  exclusions: Exclusion[];
}

export interface Timer {
  at?: TimeStamp;
  before: number;
}
export interface GlobalState {
  period: number;
  white: TeamStats;
  blue: TeamStats;

  matchTimer: Timer;
  periodTimer: Timer;
  restPeriodTimer: Timer;
}
