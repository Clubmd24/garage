import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchInvoices } from '../../../lib/invoices';
import { fetchClients } from '../../../lib/clients';
import { fetchVehicles } from '../../../lib/vehicles';
import { fetchInvoiceStatuses } from '../../../lib/invoiceStatuses.js';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInvoices()
      .then(setInvoices)
      .catch(() => setError('Failed to load invoices'))
      .finally(() => setLoading(false));
    fetchInvoiceStatuses()
      .then(setStatuses)
      .catch(() => setStatuses([]));
  }, []);

  const clientMap = useMemo(() => {
    const m = {};
    clients.forEach(c => {
      m[c.id] = `${c.first_name || ''} ${c.last_name || ''}`.trim();
    });
    return m;
  }, [clients]);

  const vehicleMap = useMemo(() => {
    const m = {};
    vehicles.forEach(v => {
      m[v.id] = v;
    });
    return m;
  }, [vehicles]);

  const filteredInvoices = invoices.filter(inv => {
    const q = searchQuery.toLowerCase();
    const name = (clientMap[inv.customer_id] || '').toLowerCase();
    const licence = (vehicleMap[inv.vehicle_id]?.licence_plate || '').toLowerCase();
    const make = (vehicleMap[inv.vehicle_id]?.make || '').toLowerCase();
    const matchesQuery = (
      name.includes(q) ||
      licence.includes(q) ||
      make.includes(q) ||
      String(inv.id).includes(q) ||
      String(inv.amount).includes(q) ||
      (inv.status || '').toLowerCase().includes(q)
    );
    const matchesStatus =
      statusFilter === 'all' || (inv.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesQuery && matchesStatus;
  });

  useEffect(() => {
    fetchClients()
      .then(setClients)
      .catch(() => setClients([]));
    fetchVehicles()
      .then(setVehicles)
      .catch(() => setVehicles([]));
  }, []);

  return (
    <OfficeLayout>
      <h1 className="text-2xl font-semibold mb-4">Invoices</h1>
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
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input mb-4"
          >
            <option value="all">All</option>
            {statuses.map(s => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="grid gap-4 sm:grid-cols-2">
          {filteredInvoices.map(inv => (
            <div key={inv.id} className="item-card">
              <h2 className="font-semibold mb-1">Invoice #{inv.id}</h2>
              <p className="text-sm">{clientMap[inv.customer_id] || ''}</p>
              <p className="text-sm">{vehicleMap[inv.vehicle_id]?.licence_plate || ''}</p>
              <p className="text-sm">{vehicleMap[inv.vehicle_id]?.make || ''}</p>
              <p className="text-sm">Amount: €{inv.amount}</p>
              <p className="text-sm">Status: {inv.status}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/office/invoices/${inv.id}`} className="button px-4 text-sm">View</Link>
                <a href={`/api/invoices/${inv.id}/pdf`} className="button-secondary px-4 text-sm">Download PDF</a>
              </div>
            </div>
          ))}
          </div>
        </>
      )}
    </OfficeLayout>
  );
};

export default InvoicesPage;
