export type Team = 'white' | 'blue';

export enum CapEnum {
  One = '1',
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
  Ten = '10',
  Eleven = '11',
  Twelve = '12',
  HeadCoach = 'HC',
  AssistantCoach = 'AC',
  TeamManager = 'TM',
}

type TimeStamp = number;
export interface GameEventBase {
  id: string;
  name: string;
  timestamp: TimeStamp;
  team?: Team;
  cap?: CapEnum;
}

export interface GameEventCap extends GameEventBase {
  team: Team;
  cap: CapEnum;
}

export interface MatchPauseEvent extends GameEventBase {
  name: 'match-pause';
}
export interface MatchStartEvent extends GameEventBase {
  name: 'match-start';
}
export interface UndoEventsEvent extends GameEventBase {
  name: 'undo-events';
  ids: string[];
}

export interface GoalScoredEvent extends GameEventCap {
  name: 'goal-scored';
}

export interface ExclusionEvent extends GameEventCap {
  name: 'exclusion';
}

export interface PenaltyEvent extends GameEventCap {
  name: 'penalty';
}

export interface EmEvent extends GameEventCap {
  name: 'em';
}

export interface EmsEvent extends GameEventCap {
  name: 'ems';
}

export interface BrutalityEvent extends GameEventCap {
  name: 'brutality';
}

/* Visual Events */
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
  | PenaltyEvent
  | EmEvent
  | EmsEvent
  | BrutalityEvent
  | RestStartEvent
  | PeriodEndEvent
  | UndoEventsEvent;

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
  cap: CapEnum;
  start: number;
  end: number;
}
export interface OffenceCount {
  count: number;
  redFlag?: true;
  card?: 'RED' | 'YELLOW';
  noMoreEvents?: true;
}

export interface TeamStats {
  goals: number;
  exclusions: Exclusion[];
  offenceCount: Record<CapEnum, OffenceCount>;
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

  eventsToUndo: GameEventWithMatchTime[];
  deletedEvents: string[];
}
