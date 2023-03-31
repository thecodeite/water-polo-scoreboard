import {
  capExclusion,
  capEm,
  goalScored,
  pauseMatch,
  stamp,
  startMatch,
  undoEvents,
  capEms,
  capViolentAction,
  capPenalty,
  teamTimeout,
} from './events';
import { reduceState, withMatchTime } from './reducers';
import { CapEnum, GameEvent, GlobalState, SupportStaff, Team } from './types';

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
    const excludeWhiteCap = (cap: CapEnum) => {
      const exclude = capExclusion('white', cap);
      return setup(
        [startMatch, 1500], //
        [pauseMatch, 1000],
        [exclude, 0],
      );
    };

    it('the exclusion should be recorded in the teams exclusions', () => {
      const state = excludeWhiteCap(CapEnum.One);
      const exclusion = state.white.exclusions[0];
      expect(exclusion.cap).toEqual(CapEnum.One);
    });

    it('the exclusion should start when the match was paused (1500 ms)', () => {
      const state = excludeWhiteCap(CapEnum.One);
      const exclusion = state.white.exclusions[0];
      expect(exclusion.start).toEqual(1500);
    });

    it('the exclusion should end 20 seconds (20,000 ms) after the offence started (21,500 ms)', () => {
      const state = excludeWhiteCap(CapEnum.One);
      const exclusion = state.white.exclusions[0];
      expect(exclusion.end).toEqual(21500);
    });

    it('should show the exclusion timer for players', () => {
      const state = excludeWhiteCap(CapEnum.One);
      const exclusion = state.white.exclusions[0];
      expect(exclusion).toBeDefined();
    });

    it.each(SupportStaff)('should not show the exclusion timer for support staff', (cap) => {
      const state = excludeWhiteCap(cap);
      const exclusion = state.white.exclusions[0];
      expect(exclusion).not.toBeDefined();
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
    it('the exclusion should not recorded in the teams exclusions', () => {
      const state = emCapOne();
      expect(state.white.exclusions.length).toEqual(0);
    });

    it('should red card a player after a single EM', () => {
      const state = setup(
        [startMatch, 1000], //
        [pauseMatch, 1000],
        [capEm('white', CapEnum.One), 1000],
      );

      const oc = state.white.offenceCount[CapEnum.One];
      expect(oc.count).toEqual(1);
      expect(oc.card).toEqual('RED');
      expect(oc.noMoreEvents).toEqual(true);
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
    // it('the exclusion should be recorded in the teams exclusions', () => {
    //   const state = emsCapOne();
    //   const exclusion = state.white.exclusions[0];
    //   expect(exclusion.cap).toEqual(CapEnum.One);
    // });

    // it('the exclusion should start when the match was paused (1500 ms)', () => {
    //   const state = emsCapOne();
    //   const exclusion = state.white.exclusions[0];
    //   expect(exclusion.start).toEqual(1500);
    // });

    // it('the exclusion should end 20 seconds (20,000 ms) after the offence started (21,500 ms)', () => {
    //   const state = emsCapOne();
    //   const exclusion = state.white.exclusions[0];
    //   expect(exclusion.end).toEqual(21500);
    // });

    it.todo('define what it should do, red flag?');
  });

  describe('when a ViolentAction event is recorded', () => {
    const violentActionCapOne = () => {
      const exclude = capViolentAction('white', CapEnum.One);
      return setup(
        [startMatch, 1500], //
        [pauseMatch, 1000],
        [exclude, 0],
      );
    };
    it('the exclusion should be recorded in the teams exclusions', () => {
      const state = violentActionCapOne();
      const exclusion = state.white.exclusions[0];
      expect(exclusion.cap).toEqual(CapEnum.One);
    });

    it('the exclusion should start when the match was paused (1500 ms)', () => {
      const state = violentActionCapOne();
      const exclusion = state.white.exclusions[0];
      expect(exclusion.start).toEqual(1500);
    });

    it('the exclusion should end 4 minutes (240,000 ms) after the offence started (241,500 ms)', () => {
      const state = violentActionCapOne();
      const exclusion = state.white.exclusions[0];
      expect(exclusion.end).toEqual(241500);
    });
  });
});

describe('multiple offences lead to red flag', () => {
  it('should start all players with an offence count of 0', () => {
    const state = setup();

    expect(state.white.offenceCount[CapEnum.One]).toEqual({ count: 0 });
  });

  it('should not flag a player after one penalty but increase the offence count to 1', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenalty('white', CapEnum.One), 1000],
    );

    expect(state.white.offenceCount[CapEnum.One]).toEqual({ count: 1 });
  });

  it('should not flag a player after two penalties but increase the offence count to 2', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenalty('white', CapEnum.One), 1000],
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenalty('white', CapEnum.One), 1000],
    );

    expect(state.white.offenceCount[CapEnum.One]).toEqual({ count: 2 });
  });

  it('should red flag a player after three penalties and increase the offence count to 3 and can still have more events', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenalty('white', CapEnum.One), 1000],
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenalty('white', CapEnum.One), 1000],
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenalty('white', CapEnum.One), 1000],
    );

    const oc = state.white.offenceCount[CapEnum.One];
    expect(oc.count).toEqual(3);
    expect(oc.redFlag).toEqual(true);
    expect(oc.noMoreEvents).toEqual(undefined);
  });

  it('should yellow flag the Head Coach after 1 penalty and increase the offence count to 1 and can still have more events', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenalty('white', CapEnum.HeadCoach), 1000],
    );

    const oc = state.white.offenceCount[CapEnum.HeadCoach];
    expect(oc.count).toEqual(1);
    expect(oc.card).toBe('YELLOW');
    expect(oc.noMoreEvents).toBeUndefined();
  });

  it('should red flag the Head Coach after 2 penalties and increase the offence count to 2 and can not have more events', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenalty('white', CapEnum.HeadCoach), 1000],
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenalty('white', CapEnum.HeadCoach), 1000],
    );

    const oc = state.white.offenceCount[CapEnum.HeadCoach];
    expect(oc.count).toEqual(2);
    expect(oc.card).toBe('RED');
    expect(oc.noMoreEvents).toBe(true);
  });

  it('should red flag the Assistant Coach after 1 penalty and increase the offence count to 1 and can not have more events', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenalty('white', CapEnum.AssistantCoach), 1000],
    );

    const oc = state.white.offenceCount[CapEnum.AssistantCoach];
    expect(oc.count).toEqual(1);
    expect(oc.card).toBe('RED');
    expect(oc.noMoreEvents).toBe(true);
  });

  it('should red flag the Team Manager after 1 penalty and increase the offence count to 1 and can not have more events', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [capPenalty('white', CapEnum.TeamManager), 1000],
    );

    const oc = state.white.offenceCount[CapEnum.TeamManager];
    expect(oc.count).toEqual(1);
    expect(oc.card).toBe('RED');
    expect(oc.noMoreEvents).toBe(true);
  });
});

describe('offences', () => {
  const eventsThatCountAsOffence: { n: string; f: (a: Team, b: CapEnum) => GameEvent }[] = [
    { n: 'penalty', f: capPenalty },
    { n: 'exclusion', f: capExclusion },
  ];

  it.each(eventsThatCountAsOffence)('should increase the offence count for a $n', ({ f }) => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [f('white', CapEnum.One), 1000],
    );

    expect(state.white.offenceCount[CapEnum.One]).toEqual({ count: 1 });
  });

  const eventsThatCountAsRedCard: { n: string; f: (a: Team, b: CapEnum) => GameEvent }[] = [
    { n: 'ems', f: capEms },
    { n: 'em', f: capEm },
    { n: 'violent-action', f: capViolentAction },
  ];

  it.each(eventsThatCountAsRedCard)('should give a red card for a $n', ({ f }) => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [f('white', CapEnum.One), 1000],
    );

    expect(state.white.offenceCount[CapEnum.One]).toEqual({
      card: 'RED',
      count: 1,
      noMoreEvents: true,
    });
  });
});

describe('timeouts', () => {
  it('should start with 2 timeouts left', () => {
    const state = setup();

    expect(state.white.timeoutsLeft).toEqual(2);
  });

  it('should decrease timeout count when used', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [teamTimeout('white'), 1000],
    );

    expect(state.white.timeoutsLeft).toEqual(1);
  });

  it('should decrease timeout count when used again', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [teamTimeout('white'), 1000],
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [teamTimeout('white'), 1000],
    );

    expect(state.white.timeoutsLeft).toEqual(0);
  });

  it('should be "in timeout" for 1 min after', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [teamTimeout('white'), 1000],
    );

    expect(state.timers.timeoutTimer.at).toBeDefined();
  });

  it('should clear timeout when game starts again', () => {
    const state = setup(
      [startMatch, 1000], //
      [pauseMatch, 1000],
      [teamTimeout('white'), 1000],
      [startMatch, 1000], //
    );

    expect(state.timers.timeoutTimer.at).toBeUndefined();
  });
});
