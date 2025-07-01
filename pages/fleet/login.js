import { useState } from 'react';
import { useRouter } from 'next/router';

export default function FleetLogin() {
  const router = useRouter();
  const [garageName, setGarageName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch('/api/portal/fleet/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ garage_name: garageName, pin }),
    });
    if (res.ok) {
      router.push('/fleet/home');
    } else {
      setError('Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white/20 p-8 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold mb-2 text-center">Fleet Login</h1>
        {error && <p className="text-red-300">{error}</p>}
        <input
          type="text"
          placeholder="Garage Name"
          className="input w-full"
          value={garageName}
          onChange={e => setGarageName(e.target.value)}
        />
        <input
          type="password"
          placeholder="PIN"
          className="input w-full"
          value={pin}
          onChange={e => setPin(e.target.value)}
        />
        <button type="submit" className="button w-full">Login</button>
      </form>
    </div>
  );
}
