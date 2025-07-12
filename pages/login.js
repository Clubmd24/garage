// File: pages/login.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('theme') || 'light';
    setTheme(stored);
    document.documentElement.classList.toggle('dark', stored === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    setTheme(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier, password }),
      });
       if (!res.ok) {
         let errMsg = 'Login failed';
         try {
           const body = await res.json();
           if (body.error) errMsg = body.error;
         } catch (_) {
           /* parsing failed, keep generic */
         }
         throw new Error(errMsg);
     }
     
      // Fetch user info to determine role, then route accordingly
      let dest = '/dashboard';
      try {
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (meRes.ok) {
          const me = await meRes.json();
          if (me && me.role === 'engineer') dest = '/engineer';
        }
      } catch {
        /* ignore fetch errors and fallback to default */
      }
      router.push(dest);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Garage Vision</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Image
          src="/logo.png"
          alt="Garage Vision Logo"
          width={120}
          height={120}
          className="mb-6 rounded-full shadow-lg"
        />
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-[var(--color-surface)] shadow-lg"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        <div className="max-w-md w-full bg-[var(--color-surface)] bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">Garage Vision</h1>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Email or Username"
              className="input w-full"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="button w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
