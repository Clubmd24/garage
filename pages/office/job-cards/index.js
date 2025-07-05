import React, { useEffect, useState, useMemo } from 'react';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchQuotes, updateQuote } from '../../../lib/quotes';
import { createInvoice } from '../../../lib/invoices';
import { fetchClients } from '../../../lib/clients';
import { fetchVehicles } from '../../../lib/vehicles';
import { useCurrentUser } from '../../../components/useCurrentUser.js';

const JobCardsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useCurrentUser();

  const load = () => {
    setLoading(true);
    fetchQuotes()
      .then(q =>
        setJobs(q.filter(j => j.status === 'job-card' || j.status === 'completed'))
      )
      .catch(() => setError('Failed to load job cards'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    fetchClients()
      .then(setClients)
      .catch(() => setClients([]));
    fetchVehicles()
      .then(setVehicles)
      .catch(() => setVehicles([]));
  }, []);

  const completeJob = async id => {
    await updateQuote(id, { status: 'completed' });
    load();
  };

  const invoice = async job => {
    await createInvoice({
      job_id: job.id,
      customer_id: job.customer_id,
      amount: job.total_amount,
      due_date: new Date().toISOString().substring(0, 10),
      status: 'issued',
    });
    await updateQuote(job.id, { status: 'invoiced' });
    load();
  };

  const clientMap = useMemo(() => {
    const map = {};
    clients.forEach(c => {
      map[c.id] = `${c.first_name || ''} ${c.last_name || ''}`.trim();
    });
    return map;
  }, [clients]);

  const vehicleMap = useMemo(() => {
    const map = {};
    vehicles.forEach(v => {
      map[v.id] = v;
    });
    return map;
  }, [vehicles]);

  const filteredJobs = jobs.filter(j => {
    const q = searchQuery.toLowerCase();
    const name = (clientMap[j.customer_id] || '').toLowerCase();
    const licence = (vehicleMap[j.vehicle_id]?.licence_plate || '').toLowerCase();
    const make = (vehicleMap[j.vehicle_id]?.make || '').toLowerCase();
    return (
      name.includes(q) ||
      licence.includes(q) ||
      make.includes(q) ||
      String(j.id).includes(q) ||
      (j.status || '').toLowerCase().includes(q)
    );
  });

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Job Cards</h1>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input mb-4 w-full"
          />
          <div className="grid gap-4 sm:grid-cols-2">
          {filteredJobs.map(j => (
            <div key={j.id} className="item-card">
              <h2 className="font-semibold mb-1">Job #{j.id}</h2>
              <p className="text-sm">{clientMap[j.customer_id] || ''}</p>
              <p className="text-sm">{vehicleMap[j.vehicle_id]?.licence_plate || ''}</p>
              <p className="text-sm">{vehicleMap[j.vehicle_id]?.make || ''}</p>
              {user?.role?.toLowerCase() !== 'engineer' && (
                <p className="text-sm">Total: €{j.total_amount}</p>
              )}
              <p className="text-sm capitalize">Status: {j.status}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {j.status === 'job-card' && (
                  <button
                    onClick={() => completeJob(j.id)}
                    className="button px-4 text-sm"
                  >
                    Mark Completed
                  </button>
                )}
                {j.status === 'completed' && (
                  <button
                    onClick={() => invoice(j)}
                    className="button px-4 text-sm"
                  >
                    Generate Invoice
                  </button>
                )}
              </div>
            </div>
          ))}
          </div>
        </>
      )}
    </OfficeLayout>
  );
};

export default JobCardsPage;
