import React, { useEffect, useState } from 'react';
import { stamp } from '../events';
import './ScorerScreen.scss';

export function ScorerScreen({ globalState }: { globalState: GlobalState }) {
  const { timeBeforePause, unPausedAt } = globalState;
  const [clock, setClock] = useState(timeBeforePause);

  useEffect(() => {
    const h = setInterval(() => {
      const running = unPausedAt ? stamp() - unPausedAt : 0;
      setClock(timeBeforePause + running);
    }, 50);

    return () => clearInterval(h);
  }, [timeBeforePause, unPausedAt]);

  const timeLeft = 8 * 60 * 1000 - clock;
  const minutes = Math.floor(timeLeft / 60000).toString();
  const seconds = Math.floor((timeLeft % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  const tenths = Math.floor((timeLeft % 1000) / 100).toString();

  return (
    <div className="ScorerScreen">
      <div>
        Match Time: {minutes}:{seconds}.{tenths}
      </div>
      <div className="ScorerScreen-teams">
        <TeamStats clock={clock} title={'White'} teamStats={globalState.white} />
        <hr />
        <TeamStats clock={clock} title={'Blue'} teamStats={globalState.blue} />
      </div>
    </div>
  );
}

function TeamStats({ clock, title, teamStats }: { clock: number; title: string; teamStats: TeamStats }) {
  const pens = teamStats.penelties
    .filter((p) => p.end > clock) //
    .map((p) => ({ ...p, t: p.end - clock }));

  return (
    <div>
      <h2>{title}</h2>
      <div className="ScorerScreen-score">{teamStats.goals}</div>
      <ul>
        {pens.map((pen) => (
          <li key={pen.id}>
            {pen.cap} - 0:
            {Math.floor(pen.t / 1000)
              .toString()
              .padStart(2, '0')}
          </li>
        ))}
      </ul>
    </div>
  );
}
