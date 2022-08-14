import {
  capExclusion,
  capEm,
  goalScored,
  pauseMatch,
  stamp,
  startMatch,
  undoEvents,
  capEms,
  capBrutality,
  capPenelty,
} from './events';
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

describe('exclusions', () => {
  describe('when an Exclusion event is recorded', () => {
    const excludeCapOne = () => {
      const exclude = capExclusion('white', CapEnum.One);
      return setup(
        [startMatch, 1500], //
        [pauseMatch, 1000],
        [exclude, 0],
      );
    };
    it('the exclusion should be recorded in the teams exclusions', () => {
      const state = excludeCapOne();
      const exclusion = state.white.exclusions[0];
      expect(exclusion.cap).toEqual(CapEnum.One);
    });

    it('the exclusion should start when the match was paused (1500 ms)', () => {
      const state = excludeCapOne();
      const exclusion = state.white.exclusions[0];
      expect(exclusion.start).toEqual(1500);
    });

    it('the exclusion should end  20 seconds (20,000 ms) after the offence started (21,500 ms)', () => {
      const state = excludeCapOne();
      const exclusion = state.white.exclusions[0];
      expect(exclusion.end).toEqual(21500);
    });
  });

  describe('when an Exclusion Misconduct event is recorded', () => {
    const emCapOne = () => {
      const exclude = capEm('white', CapEnum.One);
      return setup(
        [startMatch, 1500], //
        [pauseMatch, 1000],
        [exclude, 0],
      );
    };
    it('the exclusion should be recorded in the teams exclusions', () => {
      const state = emCapOne();
      const exclusion = state.white.exclusions[0];
      expect(exclusion.cap).toEqual(CapEnum.One);
    });

    it('the exclusion should start when the match was paused (1500 ms)', () => {
      const state = emCapOne();
      const exclusion = state.white.exclusions[0];
      expect(exclusion.start).toEqual(1500);
    });

    it('the exclusion should end 20 seconds (20,000 ms) the offence started (21,500 ms)', () => {
      const state = emCapOne();
      const exclusion = state.white.exclusions[0];
      expect(exclusion.end).toEqual(21500);
    });
  });

  describe('when an Exclusion Misconduct with Substitution event is recorded', () => {
    const emsCapOne = () => {
      const exclude = capEms('white', CapEnum.One);
      return setup(
        [startMatch, 1500], //
        [pauseMatch, 1000],
        [exclude, 0],
      );
    };
    it('the exclusion should be recorded in the teams exclusions', () => {
      const state = emsCapOne();
      const exclusion = state.white.exclusions[0];
      expect(exclusion.cap).toEqual(CapEnum.One);
    });

    it('the exclusion should start when the match was paused (1500 ms)', () => {
      const state = emsCapOne();
      const exclusion = state.white.exclusions[0];
      expect(exclusion.start).toEqual(1500);
    });

    it('the exclusion should end 20 seconds (20,000 ms) after the offence started (21,500 ms)', () => {
      const state = emsCapOne();
      const exclusion = state.white.exclusions[0];
      expect(exclusion.end).toEqual(21500);
    });
  });

  describe('when a Brutality event is recorded', () => {
    const brutalityCapOne = () => {
      const exclude = capBrutality('white', CapEnum.One);
      return setup(
        [startMatch, 1500], //
        [pauseMatch, 1000],
        [exclude, 0],
      );
    };
    it('the exclusion should be recorded in the teams exclusions', () => {
      const state = brutalityCapOne();
      const exclusion = state.white.exclusions[0];
      expect(exclusion.cap).toEqual(CapEnum.One);
    });

    it('the exclusion should start when the match was paused (1500 ms)', () => {
      const state = brutalityCapOne();
      const exclusion = state.white.exclusions[0];
      expect(exclusion.start).toEqual(1500);
    });

    it('the exclusion should end 4 minutes (240,000 ms) after the offence started (241,500 ms)', () => {
      const state = brutalityCapOne();
      const exclusion = state.white.exclusions[0];
      expect(exclusion.end).toEqual(241500);
    });
  });
});

describe('multiple offences lead to red flag', () => {
  it('shouls start all players with an offence count of 0', () => {
    const state = setup();

    expect(state.white.offenceCount[CapEnum.One]).toEqual({ count: 0 });
  });

  it('should not flag a player after one penelty but increase the offence count to 1', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenelty('white', CapEnum.One), 1000],
    );

    expect(state.white.offenceCount[CapEnum.One]).toEqual({ count: 1 });
  });

  it('should not flag a player after two penelties but increace the offence count to 2', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenelty('white', CapEnum.One), 1000],
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenelty('white', CapEnum.One), 1000],
    );

    expect(state.white.offenceCount[CapEnum.One]).toEqual({ count: 2 });
  });

  it('should red flag a player after three penelties and increase the offence count to 3 and can still have more events', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenelty('white', CapEnum.One), 1000],
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenelty('white', CapEnum.One), 1000],
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenelty('white', CapEnum.One), 1000],
    );

    const oc = state.white.offenceCount[CapEnum.One];
    expect(oc.count).toEqual(3);
    expect(oc.flag).toEqual('RED');
    expect(oc.noMoreEvents).toEqual(undefined);
  });

  it('should yellow flag the Head Coach after 1 penelty and increase the offence count to 1 and can still have more events', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenelty('white', CapEnum.HeadCoach), 1000],
    );

    const oc = state.white.offenceCount[CapEnum.HeadCoach];
    expect(oc.count).toEqual(1);
    expect(oc.flag).toBe('YELLOW');
    expect(oc.noMoreEvents).toBeUndefined();
  });

  it('should red flag the Head Coach after 2 penelties and increase the offence count to 2 and can not have more events', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenelty('white', CapEnum.HeadCoach), 1000],
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenelty('white', CapEnum.HeadCoach), 1000],
    );

    const oc = state.white.offenceCount[CapEnum.HeadCoach];
    expect(oc.count).toEqual(2);
    expect(oc.flag).toBe('RED');
    expect(oc.noMoreEvents).toBe(true);
  });

  it('should red flag the Assistant Coach after 1 penelty and increase the offence count to 1 and can not have more events', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenelty('white', CapEnum.AssistantCoach), 1000],
    );

    const oc = state.white.offenceCount[CapEnum.AssistantCoach];
    expect(oc.count).toEqual(1);
    expect(oc.flag).toBe('RED');
    expect(oc.noMoreEvents).toBe(true);
  });

  it('should red flag the Team Manager after 1 penelty and increase the offence count to 1 and can not have more events', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenelty('white', CapEnum.TeamManager), 1000],
    );

    const oc = state.white.offenceCount[CapEnum.TeamManager];
    expect(oc.count).toEqual(1);
    expect(oc.flag).toBe('RED');
    expect(oc.noMoreEvents).toBe(true);
  });
});
