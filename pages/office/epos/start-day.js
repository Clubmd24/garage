import { useState } from 'react';
import { useRouter } from 'next/router';
import OfficeLayout from '../../../components/OfficeLayout';

export default function StartDayPage() {
  const router = useRouter();
  const [floatAmount, setFloatAmount] = useState('');
  const [error, setError] = useState(null);

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/epos/start-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ float_amount: parseFloat(floatAmount) || 0 }),
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
          <label className="block mb-1">Float Amount</label>
          <input
            type="number"
            value={floatAmount}
            onChange={e => setFloatAmount(e.target.value)}
            className="input w-full"
          />
        </div>
        <button type="submit" className="button">
          Open Session
        </button>
      </form>
    </OfficeLayout>
  );
}
