import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser)
      .catch(() => null);
  }, []);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { credentials: 'include' });
    } finally {
      window.location = '/login';
    }
  }

  if (!user) return null;

  return (
    <>
      <Head>
        <title>Welcome - Garage Vision</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-primary)] text-white space-y-8 p-6">
        <h1 className="text-6xl font-bold">Garage Vision</h1>
        <p className="text-xl">Welcome, {user.username}!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-xl">
          <Link href="/admin/users" className="bg-gray-200 text-[var(--color-primary)] font-semibold rounded-2xl py-6 text-center shadow-xl hover:-translate-y-1 transition transform">User Setup</Link>
          <Link href="/dev/projects" className="bg-gray-200 text-[var(--color-primary)] font-semibold rounded-2xl py-6 text-center shadow-xl hover:-translate-y-1 transition transform">Projects</Link>
          <Link href="/chat" className="bg-gray-200 text-[var(--color-primary)] font-semibold rounded-2xl py-6 text-center shadow-xl hover:-translate-y-1 transition transform">Dev Chat</Link>
        </div>
        <button onClick={handleLogout} className="underline">Logout</button>
      </div>
    </>
  );
}
