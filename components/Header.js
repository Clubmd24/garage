import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import logout from '../lib/logout.js';

export function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  useEffect(() => {
    fetch('/api/auth/me', { credentials:'include' })
      .then(r=>r.json()).then(setUser).catch(()=>null);
  }, []);
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
        <Image src="/logo.png" alt="Garage Vision Logo" width={32} height={32} className="w-8 h-8 rounded-full" />
        <span className="font-bold text-lg">Garage Vision</span>
      </div>
      {user && (
        <div className="flex items-center space-x-4">
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
