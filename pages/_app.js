// pages/_app.js

// 1) Core Big Calendar styles (gridlines, toolbar, time slots, etc.)
import 'react-big-calendar/lib/css/react-big-calendar.css';

// 2) Drag-and-drop addon styles (drag handles, ghosting, etc.)
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

// 3) Your global Tailwind CSS (import last so you can override if needed)
import '../styles/globals.css';

import { useEffect, useState } from 'react';
import useIdleLogout from '../components/useIdleLogout';
import BugReportModal from '../components/BugReportModal.jsx';
import Toast from '../components/Toast.jsx';

export default function MyApp({ Component, pageProps }) {
  // auto-logout on inactivity
  useIdleLogout();

  const [showBug, setShowBug] = useState(false);
  const [toast, setToast] = useState(null);

  // initialize dark/light theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    document.documentElement.classList.toggle('dark', stored === 'dark');
  }, []);

  async function submitBug(data) {
    try {
      const res = await fetch('/api/dev/report-bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setToast({ type: 'success', message: 'Bug reported' });
    } catch {
      setToast({ type: 'error', message: 'Failed to send bug report' });
    } finally {
      setShowBug(false);
    }
  }

  return (
    <>
      <Component {...pageProps} />
      {showBug && (
        <BugReportModal onSubmit={submitBug} onClose={() => setShowBug(false)} />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
