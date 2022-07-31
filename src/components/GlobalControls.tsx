import React from 'react';
import { pauseMatch, startMatch, undoEvents } from '../events';
import { GameEvent, GlobalState } from '../types';

import './GlobalControls.scss';

export function GlobalControls({
  globalState,
  addEvent,
}: {
  globalState: GlobalState;
  addEvent: (newEvent: GameEvent) => void;
}) {
  return (
    <div className="GlobalControls">
      <button disabled={!!globalState.matchTimer.at} onClick={() => addEvent(startMatch())}>
        Start Match
      </button>
      <button disabled={!globalState.matchTimer.at} onClick={() => addEvent(pauseMatch())}>
        Pause Match
      </button>
      <button
        disabled={globalState.eventsToUndo.length === 0}
        onClick={() => addEvent(undoEvents(globalState.eventsToUndo.map((e) => e.id)))}
      >
        Undo
      </button>
    </div>
  );
}
