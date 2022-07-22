type Team = 'white' | 'blue';

interface GameEventBase {
  id: string;
  name: string;
  timestamp: number;
  team?: Team;
  cap?: number;
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

interface GoalScoredEvent extends GameEventBase {
  name: 'goal-scored';
  team: Team;
  cap: number;
}

interface PeneltyEvent extends GameEventBase {
  name: 'penelty';
  team: Team;
  cap: number;
}

type GameEvent = MatchStartEvent | MatchPauseEvent | MatchResumeEvent | GoalScoredEvent | PeneltyEvent;

type GameEventWithMatchTime = GameEvent & { matchTime: number };

interface Penelty {
  id: stringl;
  cap: number;
  start: number;
  end: number;
}

interface TeamStats {
  goals: number;
  penelties: Penelty[];
}

interface GlobalState {
  matchStarted: boolean;
  unPausedAt?: number;
  timeBeforePause: number;
  white: TeamStats;
  blue: TeamStats;
}
