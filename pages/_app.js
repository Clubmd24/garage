import '../styles/globals.css';
import { useEffect } from 'react';
import useIdleLogout from '../components/useIdleLogout';

export default function MyApp({ Component, pageProps }) {
  useIdleLogout();
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    document.documentElement.classList.toggle('dark', stored === 'dark');
  }, []);

  return <Component {...pageProps} />;
}
