import React from 'react';
import { pauseMatch, startMatch, nextPeriod } from '../events';

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
      <button disabled={!!globalState.unPausedAt} onClick={() => addEvent(startMatch())}>
        Start Match
      </button>
      <button disabled={!globalState.unPausedAt} onClick={() => addEvent(pauseMatch())}>
        Pause Match
      </button>

      <button onClick={() => addEvent(nextPeriod())}>Next period</button>
    </div>
  );
}
