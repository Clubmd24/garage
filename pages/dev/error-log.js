import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';

export default function ErrorLog() {
  const [entries, setEntries] = useState([]);
  const router = useRouter();
  const { level, route } = router.query;

  useEffect(() => {
    fetch('/error-log.json')
      .then(r => r.ok ? r.json() : [])
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);

  const filtered = entries.filter(e => {
    if (level && e.level !== level) return false;
    if (route && e.route !== route) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header />
        <main className="p-8">
          <Head><title>Error Log</title></Head>
          <h1 className="text-3xl mb-4">Error Log</h1>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[var(--color-surface)] rounded-xl shadow text-sm">
              <thead className="text-left">
                <tr>
                  <th className="px-3 py-2">Timestamp</th>
                  <th className="px-3 py-2">Level</th>
                  <th className="px-3 py-2">Route</th>
                  <th className="px-3 py-2">Error Type</th>
                  <th className="px-3 py-2">Summary</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={i} className="border-t border-gray-300">
                    <td className="px-3 py-2">{e.timestamp}</td>
                    <td className="px-3 py-2">{e.level}</td>
                    <td className="px-3 py-2">{e.route}</td>
                    <td className="px-3 py-2">{e.errorType || '—'}</td>
                    <td className="px-3 py-2">{e.summary}</td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan="5" className="px-3 py-2 text-center">No log entries</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
