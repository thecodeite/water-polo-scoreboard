import React from 'react';
import { GameEventWithMatchTime } from '../types';

import './EventLog.scss';

function formatTime(ms: number) {
  const mins = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000)
    .toString()
    .padStart(2, '0');

  return `${mins}:${seconds}`;
}

export function EventLog({
  events,
  deletedEvents = [],
}: {
  events: GameEventWithMatchTime[];
  deletedEvents?: string[];
}) {
  return (
    <div className="EventLog">
      <div className="header">
        <div>Timestamp</div>
        <div>Event</div>
        <div>Team</div>
        <div>Cap</div>
        <div>Period time</div>
        <div>Period</div>
        <div>Match time</div>
      </div>
      {events.map((event) => (
        <div className={`row ${deletedEvents.includes(event.id) ? 'deleted' : ''}`} key={event.id} data-key={event.id}>
          <div>{new Date(event.timestamp).toISOString()}</div>
          <div>
            {event.name}
            {event.meaning ? ` (${event.meaning})` : undefined}
          </div>
          <div>{event.team}</div>
          <div>{event.cap}</div>
          <div>{formatTime(event.periodTime)}</div>
          <div>{event.period + 1}</div>
          <div>{formatTime(event.matchTime)}</div>
        </div>
      ))}
    </div>
  );
}
