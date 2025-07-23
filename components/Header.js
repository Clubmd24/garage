import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import logout from '../lib/logout.js';

export function Header() {
  const [user, setUser] = useState(null);
  const [hasAnnouncement, setHasAnnouncement] = useState(false);
  const router = useRouter();
  useEffect(() => {
    fetch('/api/auth/me', { credentials:'include' })
      .then(r=>r.json()).then(setUser).catch(()=>null);
  }, []);

  useEffect(() => {
    if (!user || user.role?.toLowerCase() !== 'developer') return;
    fetch('/api/dev/announcements?limit=1', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : []))
      .then(rows => {
        const latest = rows[0];
        if (!latest) return;
        const seen = localStorage.getItem('announcement_seen_at');
        if (!seen || new Date(latest.created_at) > new Date(seen)) {
          setHasAnnouncement(true);
        }
      })
      .catch(() => {});
  }, [user]);
  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push('/login');
    }
  }
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 flex justify-between items-center shadow-lg rounded-b-3xl">
      <div className="flex items-center space-x-3">
        <img src="/logo.png" alt="Garage Vision Logo" className="w-8 h-8 rounded-full" />
        <span className="font-bold text-lg">Garage Vision</span>
      </div>
      {user && (
        <div className="flex items-center space-x-4">
          {user.role?.toLowerCase() === 'developer' && (
            <Link href="/dev/dashboard" className="relative" aria-label="Important announcements">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3H3a1 1 0 000 2h14a1 1 0 000-2h-1V8a6 6 0 00-6-6z" />
                <path d="M7 16a3 3 0 006 0" />
              </svg>
              {hasAnnouncement && (
                <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Link>
          )}
          <span>{user.username}</span>
          <button
            onClick={handleLogout}
            className="bg-gray-200 text-red-600 rounded-full px-4 py-2 shadow hover:bg-gray-300"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
