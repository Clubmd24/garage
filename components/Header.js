// components/Header.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me', {
      credentials: 'include'  // ← include the auth_token cookie
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        // if unauthorized, send them to login
        router.replace('/login');
      });
  }, [router]);

  return (
    <header className="bg-[var(--color-primary)] text-white p-4 flex justify-between">
      <div>Garage Vision</div>
      {user && <div>{user.role}: {user.id}</div>}
    </header>
  );
}
