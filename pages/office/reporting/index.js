import React, { useState, useEffect } from 'react';
import OfficeLayout from '../../../components/OfficeLayout';
import { fetchFinanceReport, fetchEngineerPerformance, fetchBusinessPerformance, fetchEposReport } from '../../../lib/reporting';

function formatDate(d) {
  return d.toISOString().substring(0, 10);
}

const ReportingPage = () => {
  const [range, setRange] = useState('today');
  const [customStart, setCustomStart] = useState(formatDate(new Date()));
  const [customEnd, setCustomEnd] = useState(formatDate(new Date()));
  const [finance, setFinance] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [business, setBusiness] = useState(null);
  const [epos, setEpos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function computeDates() {
    const now = new Date();
    let start, end;
    if (range === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(start);
      end.setDate(start.getDate() + 1);
    } else if (range === 'week') {
      const day = (now.getDay() + 6) % 7;
      start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 7);
    } else if (range === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else {
      if (!customStart || !customEnd) return null;
      start = new Date(customStart);
      end = new Date(customEnd);
      end.setDate(end.getDate() + 1);
    }
    return { start: start.toISOString(), end: end.toISOString() };
  }

  useEffect(() => {
    const dates = computeDates();
    if (!dates) return;
    setLoading(true);
    Promise.all([
      fetchFinanceReport(dates.start, dates.end),
      fetchEngineerPerformance(dates.start, dates.end),
      fetchBusinessPerformance(dates.start, dates.end),
      fetchEposReport(dates.start, dates.end),
    ])
      .then(([fin, eng, biz, epos]) => {
        setFinance(fin);
        setEngineers(eng);
        setBusiness(biz);
        setEpos(epos);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load reports');
      })
      .finally(() => setLoading(false));
  }, [range, customStart, customEnd]);

  return (
    <OfficeLayout>
      <h1 className="text-xl font-semibold mb-4">Reporting</h1>
      <div className="mb-6 space-x-2">
        <select value={range} onChange={e => setRange(e.target.value)} className="input inline-block w-auto">
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom</option>
        </select>
        {range === 'custom' && (
          <>
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="input inline-block w-auto" />
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="input inline-block w-auto" />
          </>
        )}
      </div>
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <>
          <h2 className="text-lg font-semibold mt-4 mb-2">Finance</h2>
          {finance && (
            <table className="mb-4 table-auto">
              <thead>
                <tr>
                  <th className="px-2 py-1">Invoices</th>
                  <th className="px-2 py-1">Total</th>
                  <th className="px-2 py-1">Paid</th>
                  <th className="px-2 py-1">Unpaid</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-1">{finance.invoice_count}</td>
                  <td className="px-2 py-1">€{finance.total_amount}</td>
                  <td className="px-2 py-1">€{finance.total_paid}</td>
                  <td className="px-2 py-1">€{finance.total_unpaid}</td>
                </tr>
              </tbody>
            </table>
          )}
          <h2 className="text-lg font-semibold mt-4 mb-2">Engineer Performance</h2>
          <table className="mb-4 table-auto">
            <thead>
              <tr>
                <th className="px-2 py-1">Engineer</th>
                <th className="px-2 py-1">Hours</th>
              </tr>
            </thead>
            <tbody>
              {engineers.map(e => (
                <tr key={e.username}>
                  <td className="px-2 py-1">{e.username}</td>
                  <td className="px-2 py-1">{e.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="text-lg font-semibold mt-4 mb-2">Business Performance</h2>
          {business && (
            <table className="mb-4 table-auto">
              <thead>
                <tr>
                  <th className="px-2 py-1">Jobs Created</th>
                  <th className="px-2 py-1">Jobs Completed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-1">{business.jobs_created}</td>
                  <td className="px-2 py-1">{business.jobs_completed}</td>
                </tr>
              </tbody>
            </table>
          )}
          <h2 className="text-lg font-semibold mt-4 mb-2">EPOS</h2>
          {epos && (
            <table className="mb-4 table-auto">
              <thead>
                <tr>
                  <th className="px-2 py-1">Session</th>
                  <th className="px-2 py-1">Cash Sales</th>
                  <th className="px-2 py-1">Declared Cash</th>
                  <th className="px-2 py-1">Cash Diff</th>
                  <th className="px-2 py-1">Card Sales</th>
                  <th className="px-2 py-1">Declared Card</th>
                  <th className="px-2 py-1">Card Diff</th>
                </tr>
              </thead>
              <tbody>
                {epos.sessions.map(s => (
                  <tr key={s.id}>
                    <td className="px-2 py-1">{s.id}</td>
                    <td className="px-2 py-1">€{s.sales_cash.toFixed(2)}</td>
                    <td className="px-2 py-1">€{s.declared_cash.toFixed(2)}</td>
                    <td className="px-2 py-1">€{s.cash_difference.toFixed(2)}</td>
                    <td className="px-2 py-1">€{s.sales_card.toFixed(2)}</td>
                    <td className="px-2 py-1">€{s.declared_card.toFixed(2)}</td>
                    <td className="px-2 py-1">€{s.card_difference.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="font-semibold border-t">
                  <td className="px-2 py-1">Total</td>
                  <td className="px-2 py-1">€{epos.totals.sales_cash.toFixed(2)}</td>
                  <td className="px-2 py-1">€{epos.totals.declared_cash.toFixed(2)}</td>
                  <td className="px-2 py-1">€{epos.totals.cash_difference.toFixed(2)}</td>
                  <td className="px-2 py-1">€{epos.totals.sales_card.toFixed(2)}</td>
                  <td className="px-2 py-1">€{epos.totals.declared_card.toFixed(2)}</td>
                  <td className="px-2 py-1">€{epos.totals.card_difference.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </>
      )}
    </OfficeLayout>
  );
};

export default ReportingPage;
