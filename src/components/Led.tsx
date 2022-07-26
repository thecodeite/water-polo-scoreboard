import React from 'react';

import './Led.scss';

export function Led({ on }: { on: boolean }) {
  return <span className={on ? 'Led Led-on' : 'Led'} />;
}
