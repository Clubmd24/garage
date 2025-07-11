import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import logout from '../lib/logout.js';
import { fetchSearch } from '../lib/search.js';

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2 flex-shrink-0">
      <path d="M9 5l7 5-7 5V5z" />
    </svg>
  );
}

export default function OfficeLayout({ children }) {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState(null);

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

  return (
    <div className="min-h-screen flex text-white bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <aside className="w-64 bg-blue-900 p-6 space-y-6">
        <nav className="space-y-4">
          <div>
            <h3 className="uppercase text-sm font-semibold mb-2 text-cyan-400">Main</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/dashboard" className="flex items-center hover:underline">
                  <ArrowIcon />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/office" className="flex items-center hover:underline">
                  <ArrowIcon />
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
                  <ArrowIcon />
                  New Quotation
                </Link>
              </li>
              <li>
                <Link href="/office/invoices/new" className="flex items-center hover:underline">
                  <ArrowIcon />
                  New Invoice
                </Link>
              </li>
              <li>
                <Link href="/office/invoices" className="flex items-center hover:underline">
                  <ArrowIcon />
                  Invoices
                </Link>
              </li>
              <li>
                <Link href="/office/invoices?status=unpaid" className="flex items-center hover:underline">
                  <ArrowIcon />
                  Pay Invoice
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="uppercase text-sm font-semibold mb-2 text-cyan-400">Operations</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/office/jobs/new" className="flex items-center hover:underline">
                  <ArrowIcon />
                  New Job
                </Link>
              </li>
              <li>
                <Link href="/office/job-requests" className="flex items-center hover:underline">
                  <ArrowIcon />
                  Job Requests
                </Link>
              </li>
              <li>
                <Link href="/office/job-management" className="flex items-center hover:underline">
                  <ArrowIcon />
                  Job Management
                </Link>
              </li>
              <li>
                <Link href="/office/quotations" className="flex items-center hover:underline">
                  <ArrowIcon />
                  Open Quotes
                </Link>
              </li>
              {/*
              <li>
                <Link href="/office/job-cards" className="flex items-center hover:underline">
                  <ArrowIcon />
                  Job Cards
                </Link>
              </li>
              */}
              <li>
                <Link href="/office/scheduling" className="flex items-center hover:underline">
                  <ArrowIcon />
                  Scheduling
                </Link>
              </li>
              <li>
                <Link href="/office/live-screen" className="flex items-center hover:underline">
                  <ArrowIcon />
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
                  <ArrowIcon />
                  Clients
                </Link>
              </li>
              <li>
                <Link href="/office/engineers" className="flex items-center hover:underline">
                  <ArrowIcon />
                  Engineers
                </Link>
              </li>
              <li>
                <Link href="/office/crm" className="flex items-center hover:underline">
                  <ArrowIcon />
                  CRM
                </Link>
              </li>
              <li>
                <Link href="/office/reporting" className="flex items-center hover:underline">
                  <ArrowIcon />
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
                  <ArrowIcon />
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
                  <ArrowIcon />
                  Parts
                </Link>
              </li>
              <li>
                <Link href="/office/fleets" className="flex items-center hover:underline">
                  <ArrowIcon />
                  Fleets
                </Link>
              </li>
              <li>
                <Link href="/office/vehicles" className="flex items-center hover:underline">
                  <ArrowIcon />
                  Vehicles
                </Link>
              </li>
              <li>
                <Link href="/office/suppliers" className="flex items-center hover:underline">
                  <ArrowIcon />
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
                  <ArrowIcon />
                  Company Settings
                </Link>
              </li>
              <li>
                <Link href="/office/smtp-settings" className="flex items-center hover:underline">
                  <ArrowIcon />
                  SMTP Settings
                </Link>
              </li>
              <li>
                <Link href="/office/email-templates" className="flex items-center hover:underline">
                  <ArrowIcon />
                  Email Templates
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="flex items-center w-full text-left hover:underline">
                  <ArrowIcon />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-blue-700 p-6 space-y-4 relative">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Garage Vision" className="w-10 h-10 rounded-full" />
            <h1 className="text-2xl font-bold">Garage Vision</h1>
          </div>
          <div className="mt-4 relative">
            <input
              className="input w-full md:w-96 text-black"
              placeholder="Search"
              value={term}
              onChange={e => setTerm(e.target.value)}
            />
            {term && results && (
              <div className="absolute bg-white text-black shadow rounded w-full mt-1 z-10 p-2 space-y-1 max-h-64 overflow-y-auto">
                {results.clients?.length > 0 && (
                  <div>
                    <div className="font-semibold">Clients</div>
                    {results.clients.map(c => (
                      <Link key={`c${c.id}`} href={`/office/clients/view/${c.id}`} className="block hover:underline">
                        {(c.first_name || '') + ' ' + (c.last_name || '')}
                      </Link>
                    ))}
                  </div>
                )}
                {results.vehicles?.length > 0 && (
                  <div>
                    <div className="font-semibold mt-2">Vehicles</div>
                    {results.vehicles.map(v => (
                      <Link key={`v${v.id}`} href={`/office/vehicles/view/${v.id}`} className="block hover:underline">
                        {v.licence_plate}
                      </Link>
                    ))}
                  </div>
                )}
                {results.parts?.length > 0 && (
                  <div>
                    <div className="font-semibold mt-2">Parts</div>
                    {results.parts.map(p => (
                      <Link key={`p${p.id}`} href={`/office/parts`} className="block hover:underline">
                        {p.part_number} - {p.description}
                      </Link>
                    ))}
                  </div>
                )}
                {results.quotes?.length > 0 && (
                  <div>
                    <div className="font-semibold mt-2">Quotes</div>
                    {results.quotes.map(q => (
                      <Link key={`q${q.id}`} href={`/office/quotations/${q.id}/edit`} className="block hover:underline">
                        Quote #{q.id}
                      </Link>
                    ))}
                  </div>
                )}
                {results.jobs?.length > 0 && (
                  <div>
                    <div className="font-semibold mt-2">Jobs</div>
                    {results.jobs.map(j => (
                      <Link key={`j${j.id}`} href={`/office/jobs/${j.id}`} className="block hover:underline">
                        Job #{j.id}
                      </Link>
                    ))}
                  </div>
                )}
                {results.invoices?.length > 0 && (
                  <div>
                    <div className="font-semibold mt-2">Invoices</div>
                    {results.invoices.map(i => (
                      <Link key={`i${i.id}`} href="/office/invoices" className="block hover:underline">
                        Invoice #{i.id}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
