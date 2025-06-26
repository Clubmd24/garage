import { useEffect, useState } from 'react';

export function Sidebar() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setUserRole(u?.role?.toLowerCase()))
      .catch(() => null);
  }, []);

  return (
    <nav className="w-64 bg-[var(--color-surface)] h-screen p-4 space-y-4 text-[var(--color-text-primary)]">
      <a href="/" className="block font-bold mb-4 text-center">Garage Vision</a>
      <a href="/dev/projects" className="button block text-center w-full">Dev → Projects</a>
      <a href="/chat" className="button block text-center w-full">Dev → Chat</a>
      {userRole === 'admin' && (
        <a href="/admin/users" className="button block text-center w-full">Admin → Users</a>
      )}
    </nav>
  );
}
