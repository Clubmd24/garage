import '../styles/globals.css';
import { useEffect } from 'react';

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    document.documentElement.classList.toggle('dark', stored === 'dark');
  }, []);

  return <Component {...pageProps} />;
}
