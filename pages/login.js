import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Login() {
  const [theme, setTheme] = useState('light');
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
  return (
    <>
      <Head><title>Login - Garage Vision</title></Head>
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] dark:bg-[var(--color-bg)]">
        <div className="absolute top-4 right-4">
          <button onClick={toggleTheme} className="p-2 rounded-full bg-[var(--color-surface)] shadow-lg">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        <div className="max-w-md w-full bg-[var(--color-surface)] bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-4">Garage Vision</h1>
          <form className="space-y-4">
            <input type="email" placeholder="Email" className="input w-full" />
            <input type="password" placeholder="Password" className="input w-full" />
            <button type="submit" className="button w-full">Sign In</button>
          </form>
        </div>
      </div>
    </>
  );
}