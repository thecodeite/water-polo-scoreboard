import { GameEvent, GameEventWithMatchTime, GlobalState } from "./types";

const PERIOD_LENGTH_MS = 8 * 60 * 1000;

export function withMatchTime(events: GameEvent[]): GameEventWithMatchTime[] {
  interface ReducerState {
    timeBeforePause: number;
    startedAt?: number;
    unPausedAt?: number;
    pausedAt?: number;
    period: number;
    restPeriodTime?: number;
  }
  type ReducerType = [ReducerState, GameEventWithMatchTime[]];

  const initialState: ReducerState = {
    timeBeforePause: 0,
    unPausedAt: undefined,
    pausedAt: undefined,
    period: 0,
    restPeriodTime: undefined,
  };

  const res = events.reduce(
    ([oldState, arr]: ReducerType, event: GameEvent): ReducerType => {
      let periodTime: number;
      let period = oldState.period;
      let matchTime: number;

      switch (event.name) {
        case 'match-pause': {
          if (oldState.pausedAt || !oldState.unPausedAt) throw new Error('Match already paused');

          const timeBeforePause = oldState.timeBeforePause + (event.timestamp - oldState.unPausedAt);
          const periodTime = timeBeforePause > PERIOD_LENGTH_MS ? PERIOD_LENGTH_MS : timeBeforePause;
          const restPeriodTime = timeBeforePause > PERIOD_LENGTH_MS ? timeBeforePause - PERIOD_LENGTH_MS : undefined;
          const matchTime = oldState.period * PERIOD_LENGTH_MS + periodTime;
          return [
            {
              ...oldState,
              timeBeforePause,
              pausedAt: event.timestamp,
              unPausedAt: undefined,
              restPeriodTime,
            },
            [...arr, { ...event, periodTime, period, matchTime, restPeriodTime }],
          ];
        }
        case 'match-start':
          periodTime = oldState.timeBeforePause;
          if (periodTime > PERIOD_LENGTH_MS) {
            periodTime = PERIOD_LENGTH_MS;
          }
          matchTime = oldState.period * PERIOD_LENGTH_MS + periodTime;
          return [
            {
              ...oldState,
              pausedAt: undefined,
              unPausedAt: event.timestamp,
            },
            [...arr, { ...event, periodTime, period, matchTime, restPeriodTime: oldState.restPeriodTime }],
          ];
        default: {
          if (oldState.unPausedAt) {
            periodTime = oldState.timeBeforePause + (event.timestamp - oldState.unPausedAt);
          } else {
            periodTime = oldState.timeBeforePause;
          }
          if (periodTime > PERIOD_LENGTH_MS) {
            periodTime = PERIOD_LENGTH_MS;
          }
          matchTime = oldState.period * PERIOD_LENGTH_MS + periodTime;
          const restPeriodTime = oldState.restPeriodTime;
          return [oldState, [...arr, { ...event, periodTime, period, matchTime, restPeriodTime }]];
        }
      }
    },
    [initialState, []],
  );
  const [, eventWithMatchTime] = res;

  return eventWithMatchTime;
}

export function reduceState(events: GameEventWithMatchTime[]) {
  const initialState: GlobalState = {
    timeBeforePause: 0,
    matchStarted: false,
    period: 1,
    restTimeStarted: undefined,
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
      case 'match-pause': {
        if (event.restPeriodTime !== undefined) {
          // Period has ended
          return {
            ...oldState,
            restTimeStarted: event.timestamp - event.restPeriodTime,
            unPausedAt: undefined,
          };
        }

        return {
          ...oldState,
          timeBeforePause: event.periodTime,
          unPausedAt: undefined,
        };
      }
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

// interface TimeState {}

// function applyTime(globalState: GlobalState): TimeState {}
