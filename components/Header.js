import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  useEffect(() => {
    fetch('/api/auth/me', { credentials:'include' })
      .then(r=>r.json()).then(setUser).catch(()=>null);
  }, []);
  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { credentials: 'include' });
    } finally {
      router.push('/login');
    }
  }
  return (
    <header className="bg-[var(--color-primary)] text-white p-4 flex justify-between items-center">
      <div>Dev Portal</div>
      {user && (
        <div className="flex items-center space-x-4">
          <span>{user.username}</span>
          <button onClick={handleLogout} className="underline">
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
