import { useEffect } from 'react';
import { useRouter } from 'next/router';
import logout from '../lib/logout.js';
import Head from 'next/head';
import { DashboardCard } from '../components/DashboardCard.js';
import { useCurrentUser } from '../components/useCurrentUser.js';

// Inline SVG icons
function UsersIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20c0-4 4-6 6-6s6 2 6 6" />
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2">
      <path d="M2 7h20v14H2z" />
      <path d="M22 7V5a2 2 0 0 0-2-2h-4V1H8v2H4a2 2 0 0 0-2 2v2h20z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2">
      <path d="M2 2h20v14H6l-4 4z" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2">
      <path d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM3 21h8v-6H3v6zM13 3v6h8V3h-8z" />
    </svg>
  );
}

function OfficeIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="mb-2">
      <path d="M4 22h16V2H4v20zm5-5h6v5H9v-5z" />
    </svg>
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
      await logout();
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
        {/* Logo placeholder */}
        <div className="w-30 h-30 bg-white rounded-full shadow-lg mb-4 flex items-center justify-center">
          <span className="text-blue-900 font-bold text-xl">GV</span>
        </div>
        <h1 className="text-6xl font-bold tracking-tight">Garage Vision</h1>
        <p className="text-xl opacity-90">Welcome, {user?.username || 'User'}!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-xl">
          <DashboardCard href="/admin/users" title="User Setup" Icon={UsersIcon} />
          <DashboardCard href="/dev/projects" title="Projects" Icon={ProjectsIcon} />
          <DashboardCard href="/dev/dashboard" title="Dashboard" Icon={DashboardIcon} />
          <DashboardCard href="/chat" title="Dev Chat" Icon={ChatIcon} />
          <DashboardCard href="/office" title="Office" Icon={OfficeIcon} />
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 bg-gray-200 text-red-600 rounded-full px-4 py-2 shadow hover:bg-gray-300"
        >
          Logout
        </button>
      </div>
    </>
  );
}
