import { useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';

export default function StartDayPage() {
  const router = useRouter();
  const [start50, setStart50] = useState('');
  const [start20, setStart20] = useState('');
  const [start10, setStart10] = useState('');
  const [start5, setStart5] = useState('');
  const [startCoins, setStartCoins] = useState('');
  const [error, setError] = useState(null);

  const total =
    (parseInt(start50) || 0) * 50 +
    (parseInt(start20) || 0) * 20 +
    (parseInt(start10) || 0) * 10 +
    (parseInt(start5) || 0) * 5 +
    (parseFloat(startCoins) || 0);

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/epos/start-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_50: parseInt(start50) || 0,
          start_20: parseInt(start20) || 0,
          start_10: parseInt(start10) || 0,
          start_5: parseInt(start5) || 0,
          start_coins: parseFloat(startCoins) || 0,
        }),
      });
      if (!res.ok) throw new Error();
      router.push('/office/epos');
    } catch {
      setError('Failed to start session');
    }
  };

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Start Day</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-sm">
        <div>
          <label className="block mb-1">£50 Notes</label>
          <input
            type="number"
            value={start50}
            onChange={e => setStart50(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">£20 Notes</label>
          <input
            type="number"
            value={start20}
            onChange={e => setStart20(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">£10 Notes</label>
          <input
            type="number"
            value={start10}
            onChange={e => setStart10(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">£5 Notes</label>
          <input
            type="number"
            value={start5}
            onChange={e => setStart5(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">Coins (£)</label>
          <input
            type="number"
            step="0.01"
            value={startCoins}
            onChange={e => setStartCoins(e.target.value)}
            className="input w-full"
          />
        </div>
        <p className="font-semibold">Total: £{total.toFixed(2)}</p>
        <button type="submit" className="button">
          Open Session
        </button>
      </form>
    </OfficeLayout>
  );
}
