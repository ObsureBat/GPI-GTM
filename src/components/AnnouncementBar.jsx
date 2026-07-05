import { useState } from 'react';

const DEFAULT_MAIN = 'WELCOME TO THE STORE';
const DEFAULT_SUB = 'GPI INDUSTRIES PVT. LTD.';

export function AnnouncementBar({ config }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const { mainText, subText } = config?.announcement || {};
  const displayMain = mainText || DEFAULT_MAIN;
  const displaySub = subText || DEFAULT_SUB;

  return (
    <div className="announcement" role="region" aria-label="Store announcement">
      <div className="announcement__inner page-width">
        <span className="announcement__gradient">{displayMain}</span>
        {displaySub ? <span className="announcement__sub">{displaySub}</span> : null}
        <button
          type="button"
          className="announcement__close"
          onClick={() => setDismissed(true)}
          aria-label="Close announcement"
        >
          ×
        </button>
      </div>
    </div>
  );
}
