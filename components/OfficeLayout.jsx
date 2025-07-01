import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import logout from '../lib/logout.js';

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2 flex-shrink-0">
      <path d="M9 5l7 5-7 5V5z" />
    </svg>
  );
}

export default function OfficeLayout({ children }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

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
                <Link href="/office/job-cards" className="flex items-center hover:underline">
                  <ArrowIcon />
                  Job Cards
                </Link>
              </li>
              <li>
                <Link href="/office/scheduling" className="flex items-center hover:underline">
                  <ArrowIcon />
                  Scheduling
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
        <header className="bg-blue-700 p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Garage Vision" className="w-10 h-10 rounded-full" />
            <h1 className="text-2xl font-bold">Garage Vision</h1>
          </div>
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input w-full"
          />
        </header>
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
