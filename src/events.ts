export function stamp() {
  return new Date().getTime();
}

let idState = 0;
function nextId() {
  idState = idState + 1;
  return `${idState}`.padStart(10, '0');
}

export function pauseMatch(): MatchPauseEvent {
  return {
    id: nextId(),
    name: 'match-pause',
    timestamp: stamp(),
  };
}

export function startMatch(): MatchStartEvent {
  return {
    id: nextId(),
    name: 'match-start',
    timestamp: stamp(),
  };
}

export function nextPeriod(): NextPeriodEvent {
  return {
    id: nextId(),
    name: 'next-period',
    timestamp: stamp(),
  };
}

export function goalScored(team: Team, cap: string): GoalScoredEvent {
  return {
    id: nextId(),
    name: 'goal-scored',
    timestamp: stamp(),
    team,
    cap,
  };
}
export function capPenelty(team: Team, cap: string): PeneltyEvent {
  return {
    id: nextId(),
    name: 'penelty',
    timestamp: stamp(),
    team,
    cap,
  };
}

export function capReplacement(team: Team, cap: string): EmsEvent {
  return {
    id: nextId(),
    name: 'ems',
    timestamp: stamp(),
    team,
    cap,
  };
}

export function capBrutality(team: Team, cap: string): BrutalityEvent {
  return {
    id: nextId(),
    name: 'brutality',
    timestamp: stamp(),
    team,
    cap,
  };
}
