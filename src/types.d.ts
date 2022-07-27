type Team = 'white' | 'blue';

interface GameEventBase {
  id: string;
  name: string;
  timestamp: number;
  isVirtual: false;
  team?: Team;
  cap?: string;
}

interface GameEventCap extends GameEventBase {
  team: Team;
  cap: string;
}

interface MatchPauseEvent extends GameEventBase {
  name: 'match-pause';
}
interface MatchStartEvent extends GameEventBase {
  name: 'match-start';
}
interface NextPeriodEvent extends GameEventBase {
  name: 'next-period';
}

interface GoalScoredEvent extends GameEventCap {
  name: 'goal-scored';
}

interface ExclusionEvent extends GameEventCap {
  name: 'exclusion';
}

interface PeneltyEvent extends GameEventCap {
  name: 'penelty';
}

interface EmsEvent extends GameEventCap {
  name: 'ems';
}

interface BrutalityEvent extends GameEventCap {
  name: 'brutality';
}

/* Vistual Events */
interface GameEventVirtual extends GameEventBase {
  isVirtual: boolean;
}
interface RestStartEvent extends GameEventVirtual {
  name: 'rest-start';
}

interface PeriodEndEvent extends GameEventVirtual {
  name: 'period-end';
}

type GameEvent =
  | MatchPauseEvent
  | MatchStartEvent
  | NextPeriodEvent
  | GoalScoredEvent
  | ExclusionEvent
  | PeneltyEvent
  | EmsEvent
  | BrutalityEvent
  | RestStartEvent
  | PeriodEndEvent;

interface RelativeTiming {
  periodTime: number;
  period: number;
}

type GameEventWithMatchTime = GameEvent & RelativeTiming;

interface Exclusion {
  id: stringl;
  cap: number;
  start: number;
  end: number;
}

interface TeamStats {
  goals: number;
  exclusions: Exclusion[];
}

interface GlobalState {
  matchStarted: boolean;
  unPausedAt?: number;
  period: number;
  timeBeforePause: number;
  white: TeamStats;
  blue: TeamStats;
}
