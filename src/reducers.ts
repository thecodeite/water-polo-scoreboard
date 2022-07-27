import { nextId } from './events';

export function withMatchTime(events: GameEvent[]): GameEventWithMatchTime[] {
  interface ReducerState {
    timeBeforePause: number;
    startedAt?: number;
    unPausedAt?: number;
    pausedAt?: number;
    period: number;
  }
  type ReducerType = [ReducerState, GameEventWithMatchTime[]];

  const initialState: ReducerState = {
    timeBeforePause: 0,
    unPausedAt: undefined,
    pausedAt: undefined,
    period: 1,
  };

  const res = events.reduce(
    ([oldState, arr]: ReducerType, event: GameEvent): ReducerType => {
      let timeBeforePause: number;
      let periodTime: number;
      let period = oldState.period;

      switch (event.name) {
        case 'match-pause':
          if (oldState.pausedAt || !oldState.unPausedAt) throw new Error('Match already paused');

          timeBeforePause = oldState.timeBeforePause + (event.timestamp - oldState.unPausedAt);
          periodTime = timeBeforePause;
          return [
            {
              ...oldState,
              timeBeforePause,
              pausedAt: event.timestamp,
              unPausedAt: undefined,
            },
            [...arr, { ...event, periodTime, period }],
          ];
        case 'match-start':
          periodTime = oldState.timeBeforePause;
          return [
            {
              ...oldState,
              pausedAt: undefined,
              unPausedAt: event.timestamp,
            },
            [...arr, { ...event, periodTime, period }],
          ];
        case 'next-period':
          //if (!oldState.pausedAt || oldState.unPausedAt) throw new Error('Match not paused');
          timeBeforePause = 0;
          periodTime = 0;
          period += 1;
          return [
            {
              ...oldState,
              timeBeforePause,
              unPausedAt: undefined,
              pausedAt: undefined,
              period,
            },
            [...arr, { ...event, periodTime, period }],
          ];
        default:
          if (oldState.unPausedAt) {
            periodTime = oldState.timeBeforePause + (event.timestamp - oldState.unPausedAt);
          } else {
            periodTime = oldState.timeBeforePause;
          }
          return [oldState, [...arr, { ...event, periodTime, period }]];
      }
    },
    [initialState, []],
  );
  const [state, eventWithMatchTime] = res;

  if (state.unPausedAt) {
    const timeLeft = 8 * 60 * 1000 - state.timeBeforePause;

    const restStartEvent: RestStartEvent & RelativeTiming = {
      periodTime: 8 * 60 * 1000,
      period: state.period,
      name: 'rest-start',
      id: nextId(),
      timestamp: state.unPausedAt + timeLeft,
      isVirtual: true,
    };

    eventWithMatchTime.push(restStartEvent);
  }

  return eventWithMatchTime;
}

export function reduceState(events: GameEventWithMatchTime[]) {
  const initialState: GlobalState = {
    timeBeforePause: 0,
    matchStarted: false,
    period: 1,
    white: {
      goals: 0,
      exclusions: [],
    },
    blue: {
      goals: 0,
      exclusions: [],
    },
  };

  const state = events.reduce((oldState, event) => {
    switch (event.name) {
      case 'next-period':
        // if (oldState.matchStarted) throw new Error('Match already started');
        return {
          ...oldState,
          period: oldState.period + 1,
          timeBeforePause: 0,
          matchStarted: false,
          unPausedAt: undefined,
        };
      case 'match-pause':
        if (!oldState.unPausedAt) throw new Error('Match already paused');
        return {
          ...oldState,
          timeBeforePause: event.periodTime,
          unPausedAt: undefined,
        };
      case 'match-start':
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
      case 'exclusion':
        const oldTsPens = oldState[event.team];
        return {
          ...oldState,
          [event.team]: {
            ...oldTsPens,
            exclusions: [
              ...oldTsPens.exclusions,
              {
                id: event.id,
                cap: event.cap,
                start: event.periodTime,
                end: event.periodTime + 20000,
              },
            ],
          },
        };
      case 'ems':
        const oldTsRep = oldState[event.team];
        return {
          ...oldState,
          [event.team]: {
            ...oldTsRep,
            exclusions: [
              ...oldTsRep.exclusions,
              {
                id: event.id,
                cap: event.cap,
                start: event.periodTime,
                end: event.periodTime + 20000,
              },
            ],
          },
        };
      case 'brutality':
        const oldTsBrute = oldState[event.team];
        return {
          ...oldState,
          [event.team]: {
            ...oldTsBrute,
            exclusions: [
              ...oldTsBrute.exclusions,
              {
                id: event.id,
                cap: event.cap,
                start: event.periodTime,
                end: event.periodTime + 4 * 60000,
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
