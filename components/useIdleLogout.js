import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function useIdleLogout(timeoutMs = 15 * 60 * 1000) {
  const router = useRouter();
  const timer = useRef(null);

  useEffect(() => {
    function reset() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        try {
          await Promise.all([
            fetch('/api/auth/logout', { credentials: 'include' }),
            fetch('/api/portal/fleet/logout', { credentials: 'include' }),
            fetch('/api/portal/local/logout', { credentials: 'include' }),
          ]);
        } finally {
          router.push('/login');
        }
      }, timeoutMs);
    }

    reset();
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset));
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [router, timeoutMs]);
}
