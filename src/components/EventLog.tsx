import React from 'react';

export function EventLog({ events }: { events: GameEventWithMatchTime[] }) {
  return (
    <div className="EventLog">
      <div>Timestamp</div>
      <div>Event</div>
      <div>Team</div>
      <div>Cap</div>
      <div>Match time</div>
      {events.map((event) => (
        <React.Fragment key={event.id}>
          <div>{event.timestamp}</div>
          <div>{event.name}</div>
          <div>{event.team}</div>
          <div>{event.cap}</div>
          <div>{event.matchTime}</div>
        </React.Fragment>
      ))}
    </div>
  );
}
