import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { toApiError } from '../services/api.js';
import ErrorMessage from './ErrorMessage.jsx';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let scriptPromise;
function loadGsi() {
  if (window.google?.accounts?.id) return Promise.resolve();
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = GSI_SRC;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => {
      scriptPromise = undefined;
      reject(new Error('gsi'));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/** Renders the official "Sign in with Google" button (Google Identity Services). */
export default function GoogleLoginButton({ onSuccess }) {
  const { login } = useAuth();
  const container = useRef(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) {
      setError('Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID in the frontend .env file.');
      return undefined;
    }
    let cancelled = false;
    loadGsi()
      .then(() => {
        if (cancelled || !container.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async ({ credential }) => {
            setBusy(true);
            setError('');
            try {
              await login(credential); // backend verifies the token; nothing is stored client-side
              onSuccess?.();
            } catch (err) {
              setError(toApiError(err).message);
            } finally {
              setBusy(false);
            }
          },
        });
        window.google.accounts.id.renderButton(container.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
          width: 280,
        });
      })
      .catch(() => !cancelled && setError('Could not load Google sign-in. Check your connection or ad-blocker and retry.'));
    return () => {
      cancelled = true;
    };
  }, [login, onSuccess]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={container} aria-label="Sign in with Google" className={busy ? 'pointer-events-none opacity-50' : ''} />
      {busy && <p className="text-sm text-navy-500">Signing you in…</p>}
      <ErrorMessage message={error} />
    </div>
  );
}
