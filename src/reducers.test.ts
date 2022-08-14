import { goalScored, pauseMatch, stamp, startMatch, undoEvents } from './events';
import { reduceState, withMatchTime } from './reducers';
import { CapEnum, GameEvent, GlobalState } from './types';

type Entry = [GameEvent | (() => GameEvent), number];

function buildTimeline(...entries: Entry[]) {
  let now = stamp();
  return [...entries]
    .reverse()
    .map(([ge, delay]) => ({
      ...(typeof ge === 'function' ? ge() : ge),
      timestamp: (now -= delay),
    }))
    .reverse();
}

function setup(...entries: Entry[]): GlobalState {
  const events = buildTimeline(...entries);
  return reduceState(withMatchTime(events));
}

describe('undo function', () => {
  it('should start with empty array', () => {
    const state = setup();

    expect(state.eventsToUndo).toEqual([]);
  });

  it('should not include startMatch', () => {
    const state = setup([startMatch, 1000]);

    expect(state.eventsToUndo).toEqual([]);
  });

  it('should not include pauseMatch', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
    );

    expect(state.eventsToUndo).toEqual([]);
  });

  it('should include goal after pause', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [goalScored('white', CapEnum.One), 1000],
    );

    expect(state.eventsToUndo.length).toEqual(1);
    const undoEvent = state.eventsToUndo[0];
    expect(undoEvent.name).toBe('goal-scored');
  });

  it('should clear goal if un-paused', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [goalScored('white', CapEnum.One), 1000],
      [startMatch, 1000], //
    );

    expect(state.eventsToUndo).toEqual([]);
  });

  it('should not apply goal if event is undone', () => {
    const goal = goalScored('white', CapEnum.One);
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [goal, 1000],
      [undoEvents([goal.id]), 1000],
    );

    expect(state.white.goals).toEqual(0);
    expect(state.eventsToUndo).toEqual([]);
    expect(state.deletedEvents).toEqual([goal.id]);
  });
});

/*
  Three options:

  1. Record 'Undo' as a regular event and resolve in the reducer
  2. Undo triggers deletion if the events from history
  3. Events are not commited until unpause and undo removes them from the commit buffer
*/
