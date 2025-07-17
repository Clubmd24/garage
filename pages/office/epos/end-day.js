import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';

export default function EndDayPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [cash, setCash] = useState('');
  const [card, setCard] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/epos/start-day')
      .then(r => r.json())
      .then(setSession);
  }, []);

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/epos/end-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cash_total: parseFloat(cash) || 0, card_total: parseFloat(card) || 0 }),
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
          <label className="block mb-1">Cash Total</label>
          <input type="number" value={cash} onChange={e => setCash(e.target.value)} className="input w-full" />
        </div>
        <div>
          <label className="block mb-1">Card Total</label>
          <input type="number" value={card} onChange={e => setCard(e.target.value)} className="input w-full" />
        </div>
        <button type="submit" className="button">Close Session</button>
      </form>
    </OfficeLayout>
  );
}
