import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchJobsForDate } from '../../../lib/jobs';

const LiveScreenPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    const date = new Date();
    const dateStr = date.toLocaleDateString('en-CA');
    fetchJobsForDate(dateStr)
      .then(setJobs)
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);


  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Live Screen</h1>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map(j => (
            <div
              key={j.id}
              className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg p-4 shadow"
            >
              <h2 className="text-lg font-semibold mb-1">{j.licence_plate}</h2>
              <p className="text-sm mb-1">{j.make} {j.model}</p>
              <p className="text-sm mb-1">
                {j.scheduled_start ? new Date(j.scheduled_start).toLocaleTimeString() : 'N/A'}
              </p>
              <p className="text-sm mb-1">Engineer: {j.engineers || 'Unassigned'}</p>
              <p className="text-sm mb-1 capitalize">Status: {j.status}</p>
              <p className="text-sm mb-2">Defect: {j.defect_description || 'N/A'}</p>
              <Link href={`/office/jobs/${j.id}`} className="underline text-sm">View Job</Link>
            </div>
          ))}
        </div>
      )}
    </OfficeLayout>
  );
};

export default LiveScreenPage;
