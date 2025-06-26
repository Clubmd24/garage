import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Users, Briefcase, MessageCircle } from 'lucide-react';

// Custom hook to fetch current user
function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) throw new Error('Auth failed');
        setUser(await res.json());
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { user, loading };
}

// Reusable dashboard card with icon and pop effect
function DashboardCard({ href, title, Icon }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-blue-400 text-white font-bold rounded-full py-6 px-6 shadow-2xl transform hover:scale-105 transition-transform duration-300"
    >
      <Icon size={32} className="mb-2" />
      <span className="text-lg">{title}</span>
    </Link>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  // Logout handler
  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { credentials: 'include' });
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      router.push('/login');
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  // Main render
  return (
    <>
      <Head>
        <title>Garage Vision</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white space-y-8 p-6">
        <h1 className="text-6xl font-bold tracking-tight">Garage Vision</h1>
        <p className="text-xl opacity-90">Welcome, {user.username}!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-xl">
          <DashboardCard href="/admin/users" title="User Setup" Icon={Users} />
          <DashboardCard href="/dev/projects" title="Projects" Icon={Briefcase} />
          <DashboardCard href="/chat" title="Dev Chat" Icon={MessageCircle} />
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
        >
          Logout
        </button>
      </div>
    </>
  );
}
