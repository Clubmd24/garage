// pages/_app.js

// 1) Core Big Calendar styles (gridlines, toolbar, time slots, etc.)
import 'react-big-calendar/lib/css/react-big-calendar.css';

// 2) Drag-and-drop addon styles (drag handles, ghosting, etc.)
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

// 3) Your global Tailwind CSS (import last so you can override if needed)
import '../styles/globals.css';

import { useEffect } from 'react';
import useIdleLogout from '../components/useIdleLogout';

export default function MyApp({ Component, pageProps }) {
  // auto-logout on inactivity
  useIdleLogout();

  // initialize dark/light theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    document.documentElement.classList.toggle('dark', stored === 'dark');
  }, []);

  return <Component {...pageProps} />;
}
