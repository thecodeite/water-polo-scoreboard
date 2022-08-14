import { stamp } from './events';
import {
  CapEnum,
  Exclusion,
  GameEvent,
  GameEventWithMatchTime,
  GlobalState,
  OffenceCount,
  TeamStats,
  Timer,
} from './types';

const PERIOD_LENGTH_MS = 8 * 60 * 1000;
const REST_PERIOD_LENGTH_MS = 2 * 60 * 1000;

export function withMatchTime(events: GameEvent[]): GameEventWithMatchTime[] {
  interface ReducerState {
    timeBeforePause: number;
    startedAt?: number;
    unPausedAt?: number;
    pausedAt?: number;
    period: number;
    restPeriodTime: number;
    inRest: boolean;
  }
  type ReducerType = [ReducerState, GameEventWithMatchTime[]];

  const initialState: ReducerState = {
    timeBeforePause: 0,
    unPausedAt: undefined,
    pausedAt: undefined,
    period: 0,
    restPeriodTime: 0,
    inRest: false,
  };

  const res = events.reduce(
    ([oldState, arr]: ReducerType, event: GameEvent): ReducerType => {
      switch (event.name) {
        case 'match-pause': {
          const { period } = oldState;
          if (!oldState.unPausedAt) return [oldState, [...arr]];

          const timeBeforePause = oldState.timeBeforePause + (event.timestamp - oldState.unPausedAt);
          const inRest = timeBeforePause > PERIOD_LENGTH_MS;
          const meaning = inRest ? 'reset-in-rest' : 'pause';
          const periodTime = meaning === 'reset-in-rest' ? PERIOD_LENGTH_MS : timeBeforePause;
          const restPeriodTime = meaning === 'reset-in-rest' ? timeBeforePause - PERIOD_LENGTH_MS : 0;
          const matchTime = period * PERIOD_LENGTH_MS + periodTime;
          return [
            {
              ...oldState,
              timeBeforePause,
              pausedAt: event.timestamp,
              unPausedAt: undefined,
              restPeriodTime,
              inRest,
            },
            [...arr, { ...event, periodTime, period, matchTime, restPeriodTime, meaning }],
          ];
        }
        case 'match-start': {
          const { inRest, restPeriodTime } = oldState;
          if (inRest) {
            const periodTime = 0;
            const period = oldState.period + 1;
            const matchTime = period * PERIOD_LENGTH_MS;

            const meaning = 'start-next-period';
            return [
              {
                ...oldState,
                timeBeforePause: 0,
                unPausedAt: event.timestamp,
                pausedAt: undefined,
                period,
                restPeriodTime: 0,
                inRest: false,
              },
              [...arr, { ...event, periodTime, period, matchTime, restPeriodTime, meaning }],
            ];
          }
          const { period } = oldState;
          const periodTime = Math.min(oldState.timeBeforePause, PERIOD_LENGTH_MS);
          const matchTime = oldState.period * PERIOD_LENGTH_MS + periodTime;
          const meaning = oldState.timeBeforePause === 0 ? 'start-of-match' : 'un-pause';
          return [
            {
              ...oldState,
              pausedAt: undefined,
              unPausedAt: event.timestamp,
            },
            [...arr, { ...event, periodTime, period, matchTime, restPeriodTime, meaning }],
          ];
        }
        default: {
          const { period, restPeriodTime } = oldState;
          const periodTime = Math.min(
            oldState.unPausedAt
              ? oldState.timeBeforePause + (event.timestamp - oldState.unPausedAt)
              : oldState.timeBeforePause,
            PERIOD_LENGTH_MS,
          );
          const matchTime = oldState.period * PERIOD_LENGTH_MS + periodTime;
          return [oldState, [...arr, { ...event, periodTime, period, matchTime, restPeriodTime }]];
        }
      }
    },
    [initialState, []],
  );
  const [, eventWithMatchTime] = res;

  return eventWithMatchTime;
}

function makeZeroOffenceCount(): Record<CapEnum, OffenceCount> {
  const caps = Object.values(CapEnum);
  const zeroOffences: OffenceCount = { count: 0 };
  const entries: [CapEnum, OffenceCount][] = caps.map((cap: CapEnum) => [cap, zeroOffences]);
  const obj = Object.fromEntries<OffenceCount>(entries) as Record<CapEnum, OffenceCount>;
  return obj;
}

export function reduceState(events: GameEventWithMatchTime[]) {
  const initialState: GlobalState = {
    period: 0,
    white: {
      goals: 0,
      exclusions: [],
      offenceCount: makeZeroOffenceCount(),
    },
    blue: {
      goals: 0,
      exclusions: [],
      offenceCount: makeZeroOffenceCount(),
    },

    matchTimer: {
      at: undefined,
      before: 0,
    },
    periodTimer: {
      at: undefined,
      before: 0,
    },
    restPeriodTimer: {
      at: undefined,
      before: 0,
    },

    eventsToUndo: [],
    deletedEvents: [],
  };

  const eventsToDelete = events.reduce<string[]>((ids, e) => (e.name === 'undo-events' ? [...ids, ...e.ids] : ids), []);

  const filteredEvents = events.filter((e) => !eventsToDelete.includes(e.id));
  initialState.deletedEvents = eventsToDelete;

  const state = filteredEvents.reduce<GlobalState>((oldStateArg, event): GlobalState => {
    // All events
    const oldState = {
      ...oldStateArg,
      eventsToUndo: [...oldStateArg.eventsToUndo, event],
    };

    switch (event.name) {
      case 'match-pause': {
        if (event.meaning === 'reset-in-rest') {
          // Period has ended

          return {
            ...oldState,

            matchTimer: {
              at: undefined,
              before: event.matchTime,
            },
            periodTimer: {
              at: undefined,
              before: event.periodTime,
            },
            restPeriodTimer: {
              at: event.timestamp - event.restPeriodTime,
              before: event.restPeriodTime,
            },

            eventsToUndo: [],
          };
        }

        return {
          ...oldState,

          matchTimer: {
            at: undefined,
            before: event.matchTime,
          },
          periodTimer: {
            at: undefined,
            before: event.periodTime,
          },

          eventsToUndo: [],
        };
      }
      case 'match-start': {
        if (event.meaning === 'start-next-period') {
          return {
            ...oldState,
            period: event.period,

            matchTimer: {
              at: event.timestamp,
              before: event.matchTime,
            },
            periodTimer: {
              at: event.timestamp,
              before: event.periodTime,
            },
            restPeriodTimer: {
              at: undefined,
              before: 0,
            },

            eventsToUndo: [],
          };
        } else if (event.meaning === 'start-of-match') {
          // Start of match
          return {
            ...oldState,
            matchTimer: {
              at: event.timestamp,
              before: event.matchTime,
            },
            periodTimer: {
              at: event.timestamp,
              before: event.periodTime,
            },

            eventsToUndo: [],
          };
        }

        // unpaused

        return {
          ...oldState,

          matchTimer: {
            at: event.timestamp,
            before: event.matchTime,
          },
          periodTimer: {
            at: event.timestamp,
            before: event.periodTime,
          },

          eventsToUndo: [],
        };
      }
      case 'goal-scored': {
        const oldTeamState = oldState[event.team];
        return {
          ...oldState,
          [event.team]: {
            ...oldTeamState,
            goals: oldTeamState.goals + 1,
          },
        };
      }
      case 'penelty': {
        const oldTeamState = oldState[event.team];
        //const newCount = oldTeamState.offenceCount[event.cap].count + 1;
        //const newOffenceCount: OffenceCount = { count: newCount, flag: newCount >= 3 ? 'RED' : undefined };

        return {
          ...oldState,
          [event.team]: {
            ...oldTeamState,
            offenceCount: {
              ...oldTeamState.offenceCount,
              [event.cap]: calcOffenceCount(oldTeamState, event.cap),
            },
          },
        };
      }
      case 'exclusion': {
        const oldTeamState = oldState[event.team];
        const newExlcusion: Exclusion = {
          id: event.id,
          cap: event.cap,
          start: event.periodTime,
          end: event.periodTime + 20000,
        };
        const newOffenceCount: OffenceCount = { count: oldTeamState.offenceCount[event.cap].count + 1 };
        return {
          ...oldState,
          [event.team]: {
            ...oldTeamState,
            offenceCount: {
              ...oldTeamState.offenceCount,
              [event.cap]: newOffenceCount,
            },
            exclusions: [...oldTeamState.exclusions, newExlcusion],
          },
        };
      }
      case 'em': {
        const oldTeamState = oldState[event.team];
        const newExlcusion: Exclusion = {
          id: event.id,
          cap: event.cap,
          start: event.periodTime,
          end: event.periodTime + 20000,
        };
        return {
          ...oldState,
          [event.team]: {
            ...oldTeamState,
            exclusions: [...oldTeamState.exclusions, newExlcusion],
          },
        };
      }
      case 'ems': {
        const oldTeamState = oldState[event.team];
        const newExlcusion: Exclusion = {
          id: event.id,
          cap: event.cap,
          start: event.periodTime,
          end: event.periodTime + 20000,
        };
        return {
          ...oldState,
          [event.team]: {
            ...oldTeamState,
            exclusions: [...oldTeamState.exclusions, newExlcusion],
          },
        };
      }
      case 'brutality': {
        const oldTeamState = oldState[event.team];
        const newExlcusion: Exclusion = {
          id: event.id,
          cap: event.cap,
          start: event.periodTime,
          end: event.periodTime + 4 * 60000,
        };

        return {
          ...oldState,
          [event.team]: {
            ...oldTeamState,
            exclusions: [...oldTeamState.exclusions, newExlcusion],
          },
        };
      }
      case 'undo-events': {
        return {
          ...oldState,
          eventsToUndo: [],
        };
      }
      default:
        return oldState;
    }
  }, initialState);

  return state;
}

function calcOffenceCount(oldTeamState: TeamStats, cap: CapEnum): OffenceCount {
  const newCount = oldTeamState.offenceCount[cap].count + 1;

  if (cap === CapEnum.HeadCoach) {
    return { count: newCount, flag: newCount === 1 ? 'YELLOW' : 'RED', noMoreEvents: newCount > 1 ? true : undefined };
  }

  if (cap === CapEnum.AssistantCoach || cap === CapEnum.TeamManager) {
    return { count: newCount, flag: 'RED', noMoreEvents: true };
  }

  return { count: newCount, flag: newCount >= 3 ? 'RED' : undefined };
}

export interface Times {
  periodClock: number;
  restClock: number;
  matchClock: number;
}

export function calcTimes(matchTimer: Timer, periodTimer: Timer, restPeriodTimer: Timer): Times {
  if (restPeriodTimer.at !== undefined) {
    const clock = stamp() - restPeriodTimer.at;
    const restClock = Math.min(clock, REST_PERIOD_LENGTH_MS);

    return {
      periodClock: 0,
      restClock,
      matchClock: matchTimer.before,
    };
  } else {
    const now = stamp();
    const periodClockDelta = periodTimer.at ? now - periodTimer.at : 0;
    const periodTimeLeft = PERIOD_LENGTH_MS - (periodTimer.before + periodClockDelta);

    const periodClock = periodTimeLeft > 0 ? periodTimeLeft : 0;
    const restClockTotal = periodTimeLeft < 0 ? -periodTimeLeft : 0;
    const restClock = Math.min(restClockTotal, REST_PERIOD_LENGTH_MS);

    const matchClockDelta = matchTimer.at ? now - matchTimer.at : 0;
    const matchClockTotal = matchTimer.before + matchClockDelta;
    const matchClock = periodTimeLeft > 0 ? matchClockTotal : matchClockTotal + periodTimeLeft;

    return {
      periodClock,
      restClock,
      matchClock,
    };
  }
}
