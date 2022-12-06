import React, { useEffect, useState } from 'react';
import { gameRules } from '../gameRules';
import { calcTimes } from '../reducers';
import { GlobalState, TeamStats } from '../types';
import './ScorerScreen.scss';

function timeParts(clock: number) {
  const minutes = Math.floor(clock / 60000).toString();
  const seconds = Math.floor((clock % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  const tenths = Math.floor((clock % 1000) / 100).toString();
  return `${minutes}:${seconds}.${tenths}`;
}

export function ScorerScreen({ globalState }: { globalState: GlobalState }) {
  const { timers, period } = globalState;
  const [{ periodClock, restClock, matchClock, timeoutClock, showTimeout, periodBump }, setClock] = useState(
    calcTimes(timers),
  );

  useEffect(() => {
    setClock(calcTimes(timers));
    const h = setInterval(() => {
      setClock(calcTimes(timers));
    }, 50);

    return () => clearInterval(h);
  }, [timers]);

  const mt = timeParts(periodClock);
  const rt = timeParts(restClock);
  const tt = timeParts(timeoutClock);

  return (
    <div className="ScorerScreen">
      {showTimeout ? <div>Timeout Time: {tt}</div> : undefined}
      {restClock <= 0 ? <div>Match Time: {mt}</div> : <div>Rest Time: {rt}</div>}

      <div>Period: {period + 1 + periodBump}</div>
      <div className="ScorerScreen-teams">
        <TeamStatsView matchClock={matchClock} title={'White'} teamStats={globalState.white} />
        <TeamStatsView matchClock={matchClock} title={'Blue'} teamStats={globalState.blue} />
      </div>
    </div>
  );
}

function TeamStatsView({ matchClock, title, teamStats }: { matchClock: number; title: string; teamStats: TeamStats }) {
  const pens = teamStats.exclusions
    .filter((p) => p.end > matchClock) //
    .map((p) => ({ ...p, t: p.end - matchClock }));
  const cards = Object.entries(teamStats.offenceCount)
    .filter(([, oc]) => oc.card)
    .map(([cap, oc]) => ({ cap, colour: oc.card }));
  const redFlags = Object.entries(teamStats.offenceCount)
    .filter(([, oc]) => oc.redFlag)
    .map(([cap, oc]) => ({ cap, redFlag: true }));

  const timeoutsTaken = gameRules.timeoutCount - teamStats.timeoutsLeft;
  return (
    <div>
      <h2>{title}</h2>
      <div className="ScorerScreen-score">{teamStats.goals}</div>
      <div className="ScorerScreen-timeouts">T {timeoutsTaken}</div>
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
      {cards.length > 0 ? (
        <>
          <ul className="flags">
            {cards.map((card) => (
              <li key={card.cap}>
                {card.colour} CARD {card.cap}
              </li>
            ))}
          </ul>
        </>
      ) : undefined}
      {redFlags.length > 0 ? (
        <>
          <ul className="flags">
            {redFlags.map((flag) => (
              <li key={flag.cap}>RED FLAG {flag.cap}</li>
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
