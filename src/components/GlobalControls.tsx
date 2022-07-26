import React from 'react';
import { pauseMatch, resumeMatch, startMatch, nextQuarter } from '../events';

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
      {!globalState.matchStarted ? (
        <button onClick={() => addEvent(startMatch())}>Start Match</button>
      ) : globalState.unPausedAt ? (
        <button onClick={() => addEvent(pauseMatch())}>Pause Match</button>
      ) : (
        <button onClick={() => addEvent(resumeMatch())}>Resume Match</button>
      )}

      <button onClick={() => addEvent(nextQuarter())}>Next quarter</button>
    </div>
  );
}
