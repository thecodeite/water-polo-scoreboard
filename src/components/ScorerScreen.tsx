import React, { useEffect, useState } from 'react';
import { calcTimes } from '../reducers';
import { GlobalState, TeamStats } from '../types';
import './ScorerScreen.scss';

export function ScorerScreen({ globalState }: { globalState: GlobalState }) {
  const { matchTimer, periodTimer, restPeriodTimer, period } = globalState;
  const [{ periodClock, restClock, matchClock }, setClock] = useState(
    calcTimes(matchTimer, periodTimer, restPeriodTimer),
  );

  useEffect(() => {
    setClock(calcTimes(matchTimer, periodTimer, restPeriodTimer));
    const h = setInterval(() => {
      setClock(calcTimes(matchTimer, periodTimer, restPeriodTimer));
    }, 50);

    return () => clearInterval(h);
  }, [matchTimer, periodTimer, restPeriodTimer]);

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
      {restClock <= 0 ? (
        <div>
          Match Time: {tl.minutes}:{tl.seconds}.{tl.tenths}
        </div>
      ) : (
        <div>
          Rest Time: {rt.minutes}:{rt.seconds}.{rt.tenths}{' '}
        </div>
      )}
      <div>Period: {period + 1}</div>
      <div className="ScorerScreen-teams">
        <TeamStatsView clock={matchClock} title={'White'} teamStats={globalState.white} />
        <TeamStatsView clock={matchClock} title={'Blue'} teamStats={globalState.blue} />
      </div>
    </div>
  );
}

function TeamStatsView({ clock, title, teamStats }: { clock: number; title: string; teamStats: TeamStats }) {
  const pens = teamStats.exclusions
    .filter((p) => p.end > clock) //
    .map((p) => ({ ...p, t: p.end - clock }));
  const flags = Object.entries(teamStats.offenceCount)
    .filter(([, oc]) => oc.flag)
    .map(([cap, oc]) => ({ cap, colour: oc.flag }));

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
      {flags.length > 0 ? (
        <>
          <ul className="flags">
            {flags.map((flag) => (
              <li key={flag.cap}>
                {flag.colour} FLAG {flag.cap}
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
