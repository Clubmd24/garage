import { useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';

export default function StartDayPage() {
  const router = useRouter();
  const [start50, setStart50] = useState('');
  const [start20, setStart20] = useState('');
  const [start10, setStart10] = useState('');
  const [start5, setStart5] = useState('');
  const [start2, setStart2] = useState('');
  const [start1, setStart1] = useState('');
  const [start050, setStart050] = useState('');
  const [start020, setStart020] = useState('');
  const [start010, setStart010] = useState('');
  const [start005, setStart005] = useState('');
  const [error, setError] = useState(null);

  const total =
    (parseInt(start50) || 0) * 50 +
    (parseInt(start20) || 0) * 20 +
    (parseInt(start10) || 0) * 10 +
    (parseInt(start5) || 0) * 5 +
    (parseInt(start2) || 0) * 2 +
    (parseInt(start1) || 0) * 1 +
    (parseInt(start050) || 0) * 0.5 +
    (parseInt(start020) || 0) * 0.2 +
    (parseInt(start010) || 0) * 0.1 +
    (parseInt(start005) || 0) * 0.05;

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
          start_2: parseInt(start2) || 0,
          start_1: parseInt(start1) || 0,
          start_0_50: parseInt(start050) || 0,
          start_0_20: parseInt(start020) || 0,
          start_0_10: parseInt(start010) || 0,
          start_0_05: parseInt(start005) || 0,
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
          <label className="block mb-1">€50 notes</label>
          <input
            type="number"
            value={start50}
            onChange={e => setStart50(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">€20 notes</label>
          <input
            type="number"
            value={start20}
            onChange={e => setStart20(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">€10 notes</label>
          <input
            type="number"
            value={start10}
            onChange={e => setStart10(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1">€5 notes</label>
          <input
            type="number"
            value={start5}
            onChange={e => setStart5(e.target.value)}
            className="input w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block mb-1">€2 coins</label>
            <input type="number" value={start2} onChange={e=>setStart2(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="block mb-1">€1 coins</label>
            <input type="number" value={start1} onChange={e=>setStart1(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="block mb-1">50c coins</label>
            <input type="number" value={start050} onChange={e=>setStart050(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="block mb-1">20c coins</label>
            <input type="number" value={start020} onChange={e=>setStart020(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="block mb-1">10c coins</label>
            <input type="number" value={start010} onChange={e=>setStart010(e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="block mb-1">5c coins</label>
            <input type="number" value={start005} onChange={e=>setStart005(e.target.value)} className="input w-full" />
          </div>
        </div>
        <p className="font-semibold">Total: €{total.toFixed(2)}</p>
        <button type="submit" className="button">
          Open Session
        </button>
      </form>
    </OfficeLayout>
  );
}
