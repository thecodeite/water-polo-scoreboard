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
interface NextQuarterEvent extends GameEventBase {
  name: 'next-quarter';
}

interface GoalScoredEvent extends GameEventCap {
  name: 'goal-scored';
}

interface PeneltyEvent extends GameEventCap {
  name: 'penelty';
}

interface ReplacementEvent extends GameEventCap {
  name: 'replacement';
}

interface BrutalityEvent extends GameEventCap {
  name: 'brutality';
}

type GameEvent =
  | MatchStartEvent
  | MatchPauseEvent
  | MatchResumeEvent
  | NextQuarterEvent
  | GoalScoredEvent
  | PeneltyEvent
  | ReplacementEvent
  | BrutalityEvent;

type GameEventWithMatchTime = GameEvent & { matchTime: number; quarter: number };

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
  quarter: number;
  timeBeforePause: number;
  white: TeamStats;
  blue: TeamStats;
}
