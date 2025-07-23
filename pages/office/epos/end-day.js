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
  const [end2, setEnd2] = useState('');
  const [end1, setEnd1] = useState('');
  const [end050, setEnd050] = useState('');
  const [end020, setEnd020] = useState('');
  const [end010, setEnd010] = useState('');
  const [end005, setEnd005] = useState('');
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
    (parseInt(end2) || 0) * 2 +
    (parseInt(end1) || 0) * 1 +
    (parseInt(end050) || 0) * 0.5 +
    (parseInt(end020) || 0) * 0.2 +
    (parseInt(end010) || 0) * 0.1 +
    (parseInt(end005) || 0) * 0.05;
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
          end_2: parseInt(end2) || 0,
          end_1: parseInt(end1) || 0,
          end_0_50: parseInt(end050) || 0,
          end_0_20: parseInt(end020) || 0,
          end_0_10: parseInt(end010) || 0,
          end_0_05: parseInt(end005) || 0,
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
          <label className="block mb-1">€50 notes</label>
          <input
            type="number"
            value={end50}
            onChange={e => setEnd50(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">€20 notes</label>
          <input
            type="number"
            value={end20}
            onChange={e => setEnd20(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">€10 notes</label>
          <input
            type="number"
            value={end10}
            onChange={e => setEnd10(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">€5 notes</label>
          <input
            type="number"
            value={end5}
            onChange={e => setEnd5(e.target.value)}
            className="input w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block mb-1">€2 coins</label>
            <input type="number" value={end2} onChange={e=>setEnd2(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="block mb-1">€1 coins</label>
            <input type="number" value={end1} onChange={e=>setEnd1(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="block mb-1">50c coins</label>
            <input type="number" value={end050} onChange={e=>setEnd050(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="block mb-1">20c coins</label>
            <input type="number" value={end020} onChange={e=>setEnd020(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="block mb-1">10c coins</label>
            <input type="number" value={end010} onChange={e=>setEnd010(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="block mb-1">5c coins</label>
            <input type="number" value={end005} onChange={e=>setEnd005(e.target.value)} className="input w-full" />
          </div>
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
        <p className="font-semibold">Cash Total: €{(totalCash - float).toFixed(2)}</p>
        <button type="submit" className="button">Close Session</button>
      </form>
    </OfficeLayout>
  );
}
