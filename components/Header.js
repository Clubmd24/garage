import { useEffect, useState } from 'react';
export function Header() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch('/api/auth/me').then(r=>r.json()).then(setUser).catch(()=>null);
  }, []);
  return (
    <header className="bg-[var(--color-primary)] text-white p-4 flex justify-between">
      <div>Garage Vision</div>
      {user && <div>{user.role}: {user.id}</div>}
    </header>
  );
}