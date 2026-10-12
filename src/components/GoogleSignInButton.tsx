import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

const GIS_SRC = 'https://accounts.google.com/gsi/client';
let gisPromise: Promise<void> | null = null;

function loadGis(): Promise<void> {
  if (typeof window !== 'undefined' && window.google?.accounts?.id) return Promise.resolve();
  if (gisPromise) return gisPromise;
  gisPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')));
      return;
    }
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
  return gisPromise;
}

interface GoogleSignInButtonProps {
  clientId: string;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  onCredential: (credential: string) => void;
  onError?: (message: string) => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  clientId,
  text = 'continue_with',
  onCredential,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const credentialRef = useRef(onCredential);
  const errorRef = useRef(onError);
  credentialRef.current = onCredential;
  errorRef.current = onError;

  useEffect(() => {
    let cancelled = false;
    loadGis()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential?: string }) => {
            if (response?.credential) credentialRef.current(response.credential);
            else errorRef.current?.('Google sign-in did not return a credential');
          },
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text,
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 320,
        });
      })
      .catch((err: Error) => errorRef.current?.(err.message));
    return () => {
      cancelled = true;
    };
  }, [clientId, text]);

  return <div ref={containerRef} className="flex justify-center min-h-[44px]" />;
};
