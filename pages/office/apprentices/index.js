import React, { useEffect, useState } from 'react';
import OfficeLayout from '../../../components/OfficeLayout';
import Spinner from '../../../components/Spinner.jsx';
import Toast from '../../../components/Toast.jsx';
import { fetchApprentices } from '../../../lib/apprentices';
import Tabs from '../../../components/ui/Tabs.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import CurriculumDashboard from '../../../components/office/CurriculumDashboard.jsx';

export default function ApprenticesPage() {
  const [apprentices, setApprentices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ingestRunning, setIngestRunning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  const load = () => {
    setLoading(true);
    fetchApprentices()
      .then(setApprentices)
      .catch(() => setError('Failed to load apprentices'))
      .finally(() => setLoading(false));
  };

  const fetchStatus = () => {
    fetch(`/api/standards/status?secret=${process.env.NEXT_PUBLIC_API_SECRET}`)
      .then(r => (r.ok ? r.json() : { running: false }))
      .then(d => setIngestRunning(!!d.running))
      .catch(() => setIngestRunning(false));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(
        `/api/standards/ingest?secret=${process.env.NEXT_PUBLIC_API_SECRET}`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error('failed');
      setToast({ type: 'success', message: 'Curriculum refresh started' });
    } catch {
      setToast({ type: 'error', message: 'Failed to refresh curriculum' });
    } finally {
      setRefreshing(false);
      fetchStatus();
    }
  };

  useEffect(() => {
    load();
    fetchStatus();
  }, []);

  return (
    <OfficeLayout>
      <Tabs
        tabs={[
          {
            label: 'Apprentices',
            content: (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-semibold">Apprentices</h1>
                  <Button onClick={handleRefresh} className="flex items-center">
                    {refreshing ? <Spinner /> : 'Refresh Curriculum'}
                  </Button>
                </div>
                {ingestRunning && <p>Refreshing curriculum…</p>}
                {loading && <p>Loading…</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {apprentices.map(a => (
                      <div key={a.id} className="item-card">
                        <h2 className="font-semibold text-black dark:text-white text-lg mb-1">
                          {a.first_name} {a.last_name}
                        </h2>
                        <p className="text-sm text-black dark:text-white">{a.email || '—'}</p>
                        <p className="text-sm text-black dark:text-white">
                          Standard: {a.standard_id || '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ),
          },
          {
            label: 'Curriculum',
            content: <CurriculumDashboard />,
          },
        ]}
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </OfficeLayout>
  );
}
