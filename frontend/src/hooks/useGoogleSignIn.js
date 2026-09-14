import { useEffect, useRef, useCallback } from 'react';

let scriptPromise = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Sign-In script')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Sign-In script'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

// Renders the official Google "Continue with Google" button into buttonRef
// and calls onCredential(idToken) once the user picks an account.
// Requires VITE_GOOGLE_CLIENT_ID to be set — if it isn't, the button
// silently doesn't render (enabled === false) instead of crashing the page.
export function useGoogleSignIn(onCredential) {
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleResponse = useCallback((response) => {
    if (response?.credential) {
      onCredential(response.credential);
    }
  }, [onCredential]);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleResponse,
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          width: 320,
          text: 'continue_with',
        });
      })
      .catch((err) => console.error('[google-signin]', err));

    return () => {
      cancelled = true;
    };
  }, [clientId, handleResponse]);

  return { buttonRef, enabled: Boolean(clientId) };
}
