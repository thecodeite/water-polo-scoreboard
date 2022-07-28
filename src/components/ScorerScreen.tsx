import React, { useEffect, useState } from 'react';
import { stamp } from '../events';
import { GlobalState, TeamStats } from '../types';
import './ScorerScreen.scss';

interface Times {
  periodClock: number;
  restClock: number;
  exclusionClock: number;
}

export function calcTimes(
  timeBeforePause: number,
  unPausedAt: number | undefined,
  restTimeStarted: number | undefined,
): Times {
  if (restTimeStarted !== undefined) {
    const clock = stamp() - restTimeStarted;
    const restClock = clock < 2 * 60 * 1000 ? clock : 2 * 60 * 1000;

    return {
      periodClock: 0,
      restClock,
      exclusionClock: 8 * 60 * 1000,
    };
  } else {
    const clockDelta = unPausedAt ? stamp() - unPausedAt : 0;
    const clock = timeBeforePause + clockDelta;
    const timeLeftSigned = 8 * 60 * 1000 - clock;

    return {
      periodClock: timeLeftSigned > 0 ? timeLeftSigned : 0,
      restClock: timeLeftSigned < 0 ? -timeLeftSigned : 0,
      exclusionClock: timeLeftSigned > 0 ? clock : 8 * 60 * 1000,
    };
  }
}

export function ScorerScreen({ globalState }: { globalState: GlobalState }) {
  const { timeBeforePause, unPausedAt, period, restTimeStarted } = globalState;
  const [{ periodClock, restClock, exclusionClock }, setClock] = useState(
    calcTimes(timeBeforePause, unPausedAt, restTimeStarted),
  );

  useEffect(() => {
    setClock(calcTimes(timeBeforePause, unPausedAt, restTimeStarted));
    const h = setInterval(() => {
      setClock(calcTimes(timeBeforePause, unPausedAt, restTimeStarted));
    }, 50);

    return () => clearInterval(h);
  }, [timeBeforePause, unPausedAt, restTimeStarted]);

  const tl = {
    minutes: Math.floor(periodClock / 60000).toString(),
    seconds: Math.floor((periodClock % 60000) / 1000)
      .toString()
      .padStart(2, '0'),
    tenths: Math.floor((periodClock % 1000) / 100).toString(),
  };

  const rt = {
    minutes: Math.floor(restClock / 60000).toString(),
    seconds: Math.floor((restClock % 60000) / 1000)
      .toString()
      .padStart(2, '0'),
    tenths: Math.floor((restClock % 1000) / 100).toString(),
  };
  return (
    <div className="ScorerScreen">
      <div>
        Match Time: {tl.minutes}:{tl.seconds}.{tl.tenths}
      </div>
      {restClock > 0 ? (
        <div>
          Rest Time: {rt.minutes}:{rt.seconds}.{rt.tenths}{' '}
        </div>
      ) : undefined}
      <div>Period: {period}</div>
      <div className="ScorerScreen-teams">
        <TeamStatsView clock={exclusionClock} title={'White'} teamStats={globalState.white} />
        <TeamStatsView clock={exclusionClock} title={'Blue'} teamStats={globalState.blue} />
      </div>
    </div>
  );
}

function TeamStatsView({ clock, title, teamStats }: { clock: number; title: string; teamStats: TeamStats }) {
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
