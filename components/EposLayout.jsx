import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import logout from '../lib/logout.js';
import { fetchSearch } from '../lib/search.js';
import BugReportModal from './BugReportModal.jsx';
import Toast from './Toast.jsx';

export default function EposLayout({ children }) {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState(null);
  const [showBug, setShowBug] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!term) return setResults(null);
    let cancel = false;
    fetchSearch(term)
      .then(r => {
        if (!cancel) setResults(r);
      })
      .catch(() => {
        if (!cancel) setResults(null);
      });
    return () => {
      cancel = true;
    };
  }, [term]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push('/login');
    }
  }

  async function submitBug(data) {
    try {
      const res = await fetch('/api/dev/report-bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setToast({ type: 'success', message: 'Bug reported' });
    } catch {
      setToast({ type: 'error', message: 'Failed to send bug report' });
    } finally {
      setShowBug(false);
    }
  }

  return (
    <div className="min-h-screen flex text-white bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
      {/* Hidden sidebar for EPOS - better screen fit */}
      <aside className="hidden w-64 bg-slate-900 p-6 space-y-6">
        <nav className="space-y-4">
          <div>
            <h3 className="uppercase text-sm font-semibold mb-2 text-cyan-400">Main</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/dashboard" className="flex items-center hover:underline">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/office" className="flex items-center hover:underline">
                  Office Home
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="uppercase text-sm font-semibold mb-2 text-cyan-400">Sales</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/office/quotations/new" className="flex items-center hover:underline">
                  New Quotation
                </Link>
              </li>
              <li>
                <Link href="/office/invoices/new" className="flex items-center hover:underline">
                  New Invoice
                </Link>
              </li>
              <li>
                <Link href="/office/invoices" className="flex items-center hover:underline">
                  Invoices
                </Link>
              </li>
              <li>
                <Link href="/office/invoices?status=unpaid" className="flex items-center hover:underline">
                  Pay Invoice
                </Link>
              </li>
              <li>
                <Link href="/office/epos" className="flex items-center hover:underline">
                  EPOS
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="uppercase text-sm font-semibold mb-2 text-cyan-400">Operations</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/office/jobs/new" className="flex items-center hover:underline">
                  New Job
                </Link>
              </li>
              <li>
                <Link href="/office/job-requests" className="flex items-center hover:underline">
                  Job Requests
                </Link>
              </li>
              <li>
                <Link href="/office/job-management" className="flex items-center hover:underline">
                  Job Management
                </Link>
              </li>
              <li>
                <Link href="/office/quotations" className="flex items-center hover:underline">
                  Open Quotes
                </Link>
              </li>
              <li>
                <Link href="/office/scheduling" className="flex items-center hover:underline">
                  Scheduling
                </Link>
              </li>
              <li>
                <Link href="/office/live-screen" className="flex items-center hover:underline">
                  Workshop Live
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="uppercase text-sm font-semibold mb-2 text-cyan-400">CRM</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/office/clients" className="flex items-center hover:underline">
                  Clients
                </Link>
              </li>
              <li>
                <Link href="/office/engineers" className="flex items-center hover:underline">
                  Engineer
                </Link>
              </li>
              <li>
                <Link href="/office/apprentices" className="flex items-center hover:underline">
                  Apprentices
                </Link>
              </li>
              <li>
                <Link href="/office/crm" className="flex items-center hover:underline">
                  CRM
                </Link>
              </li>
              <li>
                <Link href="/office/reporting" className="flex items-center hover:underline">
                  Reporting
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="uppercase text-sm font-semibold mb-2 text-cyan-400">HR</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/office/hr" className="flex items-center hover:underline">
                  HR Home
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="uppercase text-sm font-semibold mb-2 text-cyan-400">Assets</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/office/parts" className="flex items-center hover:underline">
                  Parts
                </Link>
              </li>
              <li>
                <Link href="/office/parts/categories" className="flex items-center hover:underline">
                  Part Categories
                </Link>
              </li>
              <li>
                <Link href="/office/fleets" className="flex items-center hover:underline">
                  Fleets
                </Link>
              </li>
              <li>
                <Link href="/office/vehicles" className="flex items-center hover:underline">
                  Vehicles
                </Link>
              </li>
              <li>
                <Link href="/office/suppliers" className="flex items-center hover:underline">
                  Suppliers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="uppercase text-sm font-semibold mb-2 text-cyan-400">Settings</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/office/company-settings" className="flex items-center hover:underline">
                  Company Settings
                </Link>
              </li>
              <li>
                <Link href="/office/users" className="flex items-center hover:underline">
                  Users
                </Link>
              </li>
              <li>
                <Link href="/office/user-roles" className="flex items-center hover:underline">
                  User Roles
                </Link>
              </li>
              <li>
                <button onClick={() => setShowBug(true)} className="flex items-center w-full text-left hover:underline">
                  Report Bug
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main content area - full width for EPOS */}
      <main className="flex-1 flex flex-col">
        {/* Top bar with search and logout */}
        <header className="bg-blue-800 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Garage Vision</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={term}
                onChange={e => setTerm(e.target.value)}
                className="bg-blue-700 text-white placeholder-blue-300 rounded px-3 py-1 w-64"
              />
              {results && (
                <div className="absolute top-full left-0 right-0 bg-blue-800 border border-blue-600 rounded mt-1 z-10">
                  {results.map(r => (
                    <Link
                      key={r.id}
                      href={r.url}
                      className="block px-3 py-2 hover:bg-blue-700"
                      onClick={() => setTerm('')}
                    >
                      {r.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Logout
          </button>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>

      {/* Bug Report Modal */}
      {showBug && (
        <BugReportModal onSubmit={submitBug} onClose={() => setShowBug(false)} />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
} 