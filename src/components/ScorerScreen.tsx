import React, { useEffect, useState } from 'react';
import { stamp } from '../events';
import './ScorerScreen.scss';

export function ScorerScreen({ globalState }: { globalState: GlobalState }) {
  const { timeBeforePause, unPausedAt, period } = globalState;
  const [clock, setClock] = useState(timeBeforePause);

  useEffect(() => {
    setClock(timeBeforePause);
    const h = setInterval(() => {
      const running = unPausedAt ? stamp() - unPausedAt : 0;
      console.log('unPausedAt, timeBeforePause , running:', unPausedAt, timeBeforePause, running);
      setClock(timeBeforePause + running);
    }, 50);

    return () => clearInterval(h);
  }, [timeBeforePause, unPausedAt]);

  let timeLeftSigned = 8 * 60 * 1000 - clock;
  const inRest = timeLeftSigned < 0;
  if (timeLeftSigned < -2 * 60 * 1000) {
    timeLeftSigned = -2 * 60 * 1000;
  }
  const timeLeft = Math.abs(timeLeftSigned);
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
      {inRest ? <div>Rest</div> : undefined}
      <div>Period: {period}</div>
      <div className="ScorerScreen-teams">
        <TeamStats clock={clock} title={'White'} teamStats={globalState.white} />
        <TeamStats clock={clock} title={'Blue'} teamStats={globalState.blue} />
      </div>
    </div>
  );
}

function TeamStats({ clock, title, teamStats }: { clock: number; title: string; teamStats: TeamStats }) {
  const pens = teamStats.exclusions
    .filter((p) => p.end > clock) //
    .map((p) => ({ ...p, t: p.end - clock }));

  return (
    <div>
      <h2>{title}</h2>
      <div className="ScorerScreen-score">{teamStats.goals}</div>
      {pens.length > 0 ? (
        <>
          <div>Exclusions</div>
          <ul>
            {pens.map((pen) => (
              <li key={pen.id}>
                {pen.cap} - {formatTime(pen.t)}
              </li>
            ))}
          </ul>
        </>
      ) : undefined}
      {teamStats.replaced.length > 0 ? <div>Replaced: {teamStats.replaced.join()}</div> : undefined}
    </div>
  );
}

function formatTime(ms: number) {
  const mins = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  return `${mins}:${seconds}`;
}
