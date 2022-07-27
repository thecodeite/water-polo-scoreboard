import React from 'react';

import './EventLog.scss';

export function EventLog({ events }: { events: GameEventWithMatchTime[] }) {
  return (
    <div className="EventLog">
      <div>Timestamp</div>
      <div>Event</div>
      <div>Team</div>
      <div>Cap</div>
      <div>Match time</div>
      <div>Period</div>
      {events.map((event) => (
        <React.Fragment key={event.id}>
          <div className={event.isVirtual ? 'v' : undefined}>{new Date(event.timestamp).toISOString()}</div>
          <div className={event.isVirtual ? 'v' : undefined}>{event.name}</div>
          <div className={event.isVirtual ? 'v' : undefined}>{event.team}</div>
          <div className={event.isVirtual ? 'v' : undefined}>{event.cap}</div>
          <div className={event.isVirtual ? 'v' : undefined}>{event.matchTime}</div>
          <div className={event.isVirtual ? 'v' : undefined}>{event.period}</div>
        </React.Fragment>
      ))}
    </div>
  );
}
