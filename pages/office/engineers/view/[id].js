import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import OfficeLayout from '../../../../components/OfficeLayout';
import Card from '../../../../components/Card';

export default function EngineerViewPage() {
  const router = useRouter();
  const { id } = router.query;
  const [engineer, setEngineer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/engineers/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setEngineer(data);
      } catch {
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const deleteEngineer = async () => {
    if (!confirm('Delete this engineer?')) return;
    await fetch(`/api/engineers/${id}`, { method: 'DELETE' });
    router.push('/office/engineers');
  };

  if (loading) return <OfficeLayout><p>Loading…</p></OfficeLayout>;
  if (error) return <OfficeLayout><p className="text-red-500">{error}</p></OfficeLayout>;

  return (
    <OfficeLayout>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link href={`/office/engineers/${id}`} className="button">Edit Engineer</Link>
        <button onClick={deleteEngineer} className="button bg-red-600 hover:bg-red-700">Delete Engineer</button>
        <Link href="/office/engineers" className="button">Back to Engineers</Link>
      </div>
      <Card>
        <h2 className="text-xl font-semibold mb-4">Engineer Info</h2>
        <p><strong>Username:</strong> {engineer.username}</p>
        <p><strong>Email:</strong> {engineer.email || '—'}</p>
      </Card>
    </OfficeLayout>
  );
}
