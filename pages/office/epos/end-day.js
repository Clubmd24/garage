import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';

export default function EndDayPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [end50, setEnd50] = useState('');
  const [end20, setEnd20] = useState('');
  const [end10, setEnd10] = useState('');
  const [end5, setEnd5] = useState('');
  const [endCoins, setEndCoins] = useState('');
  const [pdq, setPdq] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/epos/start-day')
      .then(r => r.json())
      .then(setSession);
  }, []);

  const totalCash =
    (parseInt(end50) || 0) * 50 +
    (parseInt(end20) || 0) * 20 +
    (parseInt(end10) || 0) * 10 +
    (parseInt(end5) || 0) * 5 +
    (parseFloat(endCoins) || 0);
  const float = session ? parseFloat(session.float_amount) : 0;

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/epos/end-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          end_50: parseInt(end50) || 0,
          end_20: parseInt(end20) || 0,
          end_10: parseInt(end10) || 0,
          end_5: parseInt(end5) || 0,
          end_coins: parseFloat(endCoins) || 0,
          pdq_total: parseFloat(pdq) || 0,
        }),
      });
      if (!res.ok) throw new Error();
      router.push('/office/epos');
    } catch {
      setError('Failed to close session');
    }
  };

  if (!session) return <OfficeLayout><p>Loading...</p></OfficeLayout>;

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">End Day</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={submit} className="space-y-4 max-w-sm">
        <p>Started at: {new Date(session.started_at).toLocaleString()}</p>
        <div>
          <label className="block mb-1">£50 Notes</label>
          <input
            type="number"
            value={end50}
            onChange={e => setEnd50(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">£20 Notes</label>
          <input
            type="number"
            value={end20}
            onChange={e => setEnd20(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">£10 Notes</label>
          <input
            type="number"
            value={end10}
            onChange={e => setEnd10(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">£5 Notes</label>
          <input
            type="number"
            value={end5}
            onChange={e => setEnd5(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">Coins (£)</label>
          <input
            type="number"
            step="0.01"
            value={endCoins}
            onChange={e => setEndCoins(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">PDQ Reading</label>
          <input
            type="number"
            step="0.01"
            value={pdq}
            onChange={e => setPdq(e.target.value)}
            className="input w-full"
          />
        </div>
        <p className="font-semibold">Cash Total: £{(totalCash - float).toFixed(2)}</p>
        <button type="submit" className="button">Close Session</button>
      </form>
    </OfficeLayout>
  );
}
