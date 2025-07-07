import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LocalLogin() {
  const router = useRouter();
  const [garage, setGarage] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/portal/local/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garage_name: garage,
          vehicle_reg: vehicleReg,
          password,
        }),
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
      router.push('/local');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white/20 p-8 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold mb-2 text-center">Client Login</h1>
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
          placeholder="Car Registration"
          className="input w-full"
          value={vehicleReg}
          onChange={e => setVehicleReg(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="input w-full"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" className="button w-full">Login</button>
      </form>
    </div>
  );
}
