import React from 'react';

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
          <div>{new Date(event.timestamp).toISOString()}</div>
          <div>{event.name}</div>
          <div>{event.team}</div>
          <div>{event.cap}</div>
          <div>{event.matchTime}</div>
          <div>{event.period}</div>
        </React.Fragment>
      ))}
    </div>
  );
}
