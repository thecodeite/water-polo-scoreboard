import React from 'react';
import { pauseMatch, startMatch } from '../events';
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
    </div>
  );
}
