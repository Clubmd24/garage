import { useState } from 'react';
import { useRouter } from 'next/router';

export default function FleetLogin() {
  const router = useRouter();
  const [garage, setGarage] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/portal/fleet/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ garage_name: garage, company_name: companyName, pin }),
      });
      if (!res.ok) {
        let msg = 'Login failed';
        try {
          const body = await res.json();
          if (body.error) msg = body.error;
        } catch {
          /* noop */
        }
        throw new Error(msg);
      }
      router.push('/fleet/home');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white/20 p-8 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold mb-2 text-center">Fleet Login</h1>
        {error && <p className="text-red-300">{error}</p>}
        <input
          type="text"
          placeholder="Name of your garage"
          className="input w-full"
          value={garage}
          onChange={e => setGarage(e.target.value)}
        />
        <input
          type="text"
          placeholder="Company Name"
          className="input w-full"
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
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
