import { useEffect, useState } from 'react';
export function Header() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch('/api/auth/me', { credentials:'include' })
      .then(r=>r.json()).then(setUser).catch(()=>null);
  }, []);
  return (
    <header className="bg-[var(--color-primary)] text-white p-4 flex justify-between">
      <div>Dev Portal</div>
      {user && <div>{user.username}</div>}
    </header>
  );
}
