import { useState } from 'react';
import { initials } from '../utils/formatting.js';

export default function Avatar({ user, size = 'h-9 w-9' }) {
  const [failed, setFailed] = useState(false);
  if (user?.picture && !failed) {
    return (
      <img
        src={user.picture}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${size} rounded-full object-cover`}
      />
    );
  }
  return (
    <span className={`${size} flex items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700`}>
      {initials(user?.name) || '?'}
    </span>
  );
}
