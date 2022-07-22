import React from 'react';
import { pauseMatch, resumeMatch, startMatch } from '../events';

export function GlobalControls({
  globalState,
  addEvent,
}: {
  globalState: GlobalState;
  addEvent: (newEvent: GameEvent) => void;
}) {
  return (
    <div className="GlobalControls">
      <div>
        {!globalState.matchStarted ? (
          <button onClick={() => addEvent(startMatch())}>Start Match</button>
        ) : globalState.unPausedAt ? (
          <button onClick={() => addEvent(pauseMatch())}>Pause Match</button>
        ) : (
          <button onClick={() => addEvent(resumeMatch())}>Resume Match</button>
        )}
      </div>
    </div>
  );
}
