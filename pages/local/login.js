import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LocalLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch('/api/portal/local/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      router.push('/local');
    } else {
      setError('Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white/20 p-8 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold mb-2 text-center">Client Login</h1>
        {error && <p className="text-red-300">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="input w-full"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button type="submit" className="button w-full">Login</button>
      </form>
    </div>
  );
}
