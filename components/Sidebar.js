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
    <nav className="w-64 bg-[var(--color-surface)] h-screen p-4 space-y-2">
      <a href="/" className="block font-bold mb-4">Garage Vision</a>
      <a href="/dev/projects" className="block hover:underline">Dev → Projects</a>
      <a href="/chat" className="block hover:underline">Dev → Chat</a>
      {userRole?.toLowerCase() === 'admin' && (
        <a href="/admin/users" className="block hover:underline">Admin → Users</a>
      )}
    </nav>
  );
}
