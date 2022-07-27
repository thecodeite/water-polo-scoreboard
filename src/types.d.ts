type Team = 'white' | 'blue';

interface GameEventBase {
  id: string;
  name: string;
  timestamp: number;
  team?: Team;
  cap?: string;
}

interface GameEventCap extends GameEventBase {
  team: Team;
  cap: string;
}

interface MatchStartEvent extends GameEventBase {
  name: 'match-start';
}
interface MatchPauseEvent extends GameEventBase {
  name: 'match-pause';
}
interface MatchResumeEvent extends GameEventBase {
  name: 'match-resume';
}
interface NextPeriodEvent extends GameEventBase {
  name: 'next-period';
}

interface GoalScoredEvent extends GameEventCap {
  name: 'goal-scored';
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

type GameEvent =
  | MatchStartEvent
  | MatchPauseEvent
  | MatchResumeEvent
  | NextPeriodEvent
  | GoalScoredEvent
  | PeneltyEvent
  | EmsEvent
  | BrutalityEvent;

type GameEventWithMatchTime = GameEvent & { matchTime: number; period: number };

interface Penelty {
  id: stringl;
  cap: number;
  start: number;
  end: number;
}

interface TeamStats {
  goals: number;
  penelties: Penelty[];
  replaced: number[];
}

interface GlobalState {
  matchStarted: boolean;
  unPausedAt?: number;
  period: number;
  timeBeforePause: number;
  white: TeamStats;
  blue: TeamStats;
}
