export function withMatchTime(events: GameEvent[]): GameEventWithMatchTime[] {
  interface ReducerState {
    timeBeforePause: number;
    startedAt?: number;
    unPausedAt?: number;
    pausedAt?: number;
  }
  type ReducerType = [ReducerState, GameEventWithMatchTime[]];

  const initialState: ReducerState = {
    timeBeforePause: 0,
    startedAt: undefined,
    unPausedAt: undefined,
    pausedAt: undefined,
  };

  const res = events.reduce(
    ([oldState, arr]: ReducerType, event: GameEvent): ReducerType => {
      let timeBeforePause: number;
      let matchTime: number;
      console.log('event.name:', event.name);
      switch (event.name) {
        case 'match-start':
          if (oldState.startedAt) throw new Error('Match already started');
          matchTime = 0;
          timeBeforePause = 0;
          return [
            {
              ...oldState,
              timeBeforePause,
              startedAt: event.timestamp,
              unPausedAt: event.timestamp,
            },
            [...arr, { ...event, matchTime }],
          ];
        case 'match-pause':
          if (oldState.pausedAt || !oldState.unPausedAt) throw new Error('Match already paused');

          timeBeforePause = oldState.timeBeforePause + (event.timestamp - oldState.unPausedAt);
          matchTime = timeBeforePause;
          return [
            {
              ...oldState,
              timeBeforePause,
              pausedAt: event.timestamp,
              unPausedAt: undefined,
            },
            [...arr, { ...event, matchTime }],
          ];
        case 'match-resume':
          if (!oldState.pausedAt || oldState.unPausedAt) throw new Error('Match not paused');
          matchTime = oldState.timeBeforePause;
          return [
            {
              ...oldState,
              pausedAt: undefined,
              unPausedAt: event.timestamp,
            },
            [...arr, { ...event, matchTime }],
          ];
        default:
          if (oldState.unPausedAt) {
            matchTime = oldState.timeBeforePause + (event.timestamp - oldState.unPausedAt);
          } else {
            matchTime = oldState.timeBeforePause;
          }
          return [oldState, [...arr, { ...event, matchTime }]];
      }
    },
    [initialState, []],
  );
  return res[1];
}

export function reduceState(events: GameEventWithMatchTime[]) {
  const initialState: GlobalState = {
    timeBeforePause: 0,
    matchStarted: false,
    white: {
      goals: 0,
      penelties: [],
    },
    blue: {
      goals: 0,
      penelties: [],
    },
  };

  const state = events.reduce((oldState, event) => {
    switch (event.name) {
      case 'match-start':
        if (oldState.matchStarted) throw new Error('Match already started');
        return {
          ...oldState,
          matchStarted: true,
          unPausedAt: event.timestamp,
        };
      case 'match-pause':
        if (!oldState.unPausedAt) throw new Error('Match already paused');
        return {
          ...oldState,
          timeBeforePause: event.matchTime,
          unPausedAt: undefined,
        };
      case 'match-resume':
        if (oldState.unPausedAt) throw new Error('Match not paused');
        return {
          ...oldState,
          unPausedAt: event.timestamp,
        };
      case 'goal-scored':
        const oldTsGoals = oldState[event.team];
        return {
          ...oldState,
          [event.team]: {
            ...oldTsGoals,
            goals: oldTsGoals.goals + 1,
          },
        };
      case 'penelty':
        const oldTsPens = oldState[event.team];
        return {
          ...oldState,
          [event.team]: {
            ...oldTsPens,
            penelties: [
              ...oldTsPens.penelties,
              {
                id: event.id,
                cap: event.cap,
                start: event.matchTime,
                end: event.matchTime + 20000,
              },
            ],
          },
        };
      default:
        return oldState;
    }
  }, initialState);

  return state;
}
