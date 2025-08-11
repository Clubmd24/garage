import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import logout from '../lib/logout.js';
import { fetchSearch } from '../lib/search.js';
import BugReportModal from './BugReportModal.jsx';
import Toast from './Toast.jsx';

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2 flex-shrink-0">
      <path d="M9 5l7 5-7 5V5z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// Navigation section icons
function DashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function SalesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );
}

function OperationsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function ManagementIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export default function OfficeLayout({ children }) {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBug, setShowBug] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!term) return setResults(null);
    let cancel = false;
    
    // Add debouncing to prevent too many API calls
    const timeoutId = setTimeout(() => {
      fetchSearch(term)
        .then(r => {
          if (!cancel && r) setResults(r);
        })
        .catch((error) => {
          console.error('Search error:', error);
          if (!cancel) setResults(null);
        });
    }, 300); // 300ms delay

    return () => {
      cancel = true;
      clearTimeout(timeoutId);
    };
  }, [term]);

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [router.pathname]);

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
    <div className="min-h-screen flex text-white bg-pattern">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-bg-overlay backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 sidebar-glass transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile close button */}
        <div className="flex justify-between items-center lg:hidden p-6 border-b border-border-primary/20">
          <h1 className="text-xl font-bold text-gradient">Garage Vision</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-surface-secondary rounded-xl transition-all duration-200"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Logo Section */}
        <div className="hidden lg:block p-6 border-b border-border-primary/20">
          <h1 className="text-2xl font-bold text-gradient">Garage Vision</h1>
          <p className="text-sm text-text-secondary mt-1">Professional Management System</p>
        </div>

        {/* Enhanced Navigation */}
        <nav className="flex-1 p-6 space-y-8 overflow-y-auto">
          {/* Main Section */}
          <div className="nav-section">
            <div className="nav-section-header">
              <DashboardIcon />
              <h3 className="nav-section-title">Main</h3>
            </div>
            <ul className="nav-section-links">
              <li>
                <Link href="/dashboard" className="nav-link-modern">
                  <ArrowIcon />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/office" className="nav-link-modern">
                  <ArrowIcon />
                  Office Home
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Sales Section */}
          <div className="nav-section">
            <div className="nav-section-header">
              <SalesIcon />
              <h3 className="nav-section-title">Sales</h3>
            </div>
            <ul className="nav-section-links">
              <li>
                <Link href="/office/quotations/new" className="nav-link-modern">
                  <ArrowIcon />
                  New Quotation
                </Link>
              </li>
              <li>
                <Link href="/office/invoices/new" className="nav-link-modern">
                  <ArrowIcon />
                  New Invoice
                </Link>
              </li>
              <li>
                <Link href="/office/invoices" className="nav-link-modern">
                  <ArrowIcon />
                  Invoices
                </Link>
              </li>
              <li>
                <Link href="/office/invoices?status=unpaid" className="nav-link-modern">
                  <ArrowIcon />
                  Pay Invoice
                </Link>
              </li>
              <li>
                <Link href="/office/epos" className="nav-link-modern">
                  <ArrowIcon />
                  EPOS
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Operations Section */}
          <div className="nav-section">
            <div className="nav-section-header">
              <OperationsIcon />
              <h3 className="nav-section-title">Operations</h3>
            </div>
            <ul className="nav-section-links">
              <li>
                <Link href="/office/jobs/new" className="nav-link-modern">
                  <ArrowIcon />
                  New Job
                </Link>
              </li>
              <li>
                <Link href="/office/job-requests" className="nav-link-modern">
                  <ArrowIcon />
                  Job Requests
                </Link>
              </li>
              <li>
                <Link href="/office/job-management" className="nav-link-modern">
                  <ArrowIcon />
                  Job Management
                </Link>
              </li>
              <li>
                <Link href="/office/quotations" className="nav-link-modern">
                  <ArrowIcon />
                  Open Quotes
                </Link>
              </li>
              <li>
                <Link href="/office/scheduling" className="nav-link-modern">
                  <ArrowIcon />
                  Scheduling
                </Link>
              </li>
              <li>
                <Link href="/office/live-screen" className="nav-link-modern">
                  <ArrowIcon />
                  Workshop Live
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Management Section */}
          <div className="nav-section">
            <div className="nav-section-header">
              <ManagementIcon />
              <h3 className="nav-section-title">Management</h3>
            </div>
            <ul className="nav-section-links">
              <li>
                <Link href="/office/clients" className="nav-link-modern">
                  <ArrowIcon />
                  Clients
                </Link>
              </li>
              <li>
                <Link href="/office/vehicles" className="nav-link-modern">
                  <ArrowIcon />
                  Vehicles
                </Link>
              </li>
              <li>
                <Link href="/office/engineers" className="nav-link-modern">
                  <ArrowIcon />
                  Engineers
                </Link>
              </li>
              <li>
                <Link href="/office/parts" className="nav-link-modern">
                  <ArrowIcon />
                  Parts
                </Link>
              </li>
              <li>
                <Link href="/office/suppliers" className="nav-link-modern">
                  <ArrowIcon />
                  Suppliers
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Reports Section */}
          <div className="nav-section">
            <div className="nav-section-header">
              <ReportsIcon />
              <h3 className="nav-section-title">Reports</h3>
            </div>
            <ul className="nav-section-links">
              <li>
                <Link href="/office/reporting" className="nav-link-modern">
                  <ArrowIcon />
                  Business Reports
                </Link>
              </li>
              <li>
                <Link href="/office/reporting/engineer-performance" className="nav-link-modern">
                  <ArrowIcon />
                  Engineer Performance
                </Link>
              </li>
              <li>
                <Link href="/office/reporting/epos" className="nav-link-modern">
                  <ArrowIcon />
                  EPOS Reports
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Enhanced Footer */}
        <div className="p-6 border-t border-border-primary/20 space-y-4">
          <button
            onClick={() => setShowBug(true)}
            className="w-full p-3 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-xl transition-all duration-200 text-center"
          >
            Report Bug
          </button>
          <button
            onClick={handleLogout}
            className="w-full p-3 text-sm text-error hover:text-white hover:bg-error/20 rounded-xl transition-all duration-200 text-center border border-error/20 hover:border-error/40"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Enhanced Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Enhanced Header */}
        <header className="header-glass border-b border-border-primary/20">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-surface-secondary rounded-xl transition-all duration-200"
              >
                <MenuIcon />
              </button>
              
              {/* Enhanced Search */}
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search jobs, clients, vehicles..."
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="input w-80 pl-10 pr-4 py-2"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Enhanced User Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBug(true)}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-xl transition-all duration-200"
                title="Report Bug"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </button>
              
              <div className="w-px h-6 bg-border-primary/30"></div>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-text-secondary hover:text-error hover:bg-error/10 rounded-xl transition-all duration-200 border border-transparent hover:border-error/20"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Enhanced Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Enhanced Search Results Modal */}
      {results && (
        <div className="fixed inset-0 bg-bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="modal-content max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Search Results</h3>
              <button
                onClick={() => setResults(null)}
                className="p-2 hover:bg-surface-secondary rounded-xl transition-all duration-200"
              >
                <CloseIcon />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Clients */}
              {results.clients && results.clients.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary mb-2">Clients</h4>
                  <div className="space-y-2">
                    {results.clients.map((client) => (
                      <Link
                        key={`client-${client.id}`}
                        href={`/office/clients/${client.id}`}
                        className="block p-3 hover:bg-surface-secondary rounded-xl transition-all duration-200"
                        onClick={() => setResults(null)}
                      >
                        <div className="font-medium">{client.first_name} {client.last_name}</div>
                        <div className="text-sm text-text-secondary">{client.email || client.mobile || client.garage_name}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicles */}
              {results.vehicles && results.vehicles.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary mb-2">Vehicles</h4>
                  <div className="space-y-2">
                    {results.vehicles.map((vehicle) => (
                      <Link
                        key={`vehicle-${vehicle.id}`}
                        href={`/office/vehicles/${vehicle.id}`}
                        className="block p-3 hover:bg-surface-secondary rounded-xl transition-all duration-200"
                        onClick={() => setResults(null)}
                      >
                        <div className="font-medium">{vehicle.licence_plate}</div>
                        <div className="text-sm text-text-secondary">{vehicle.make} {vehicle.model}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Quotes */}
              {results.quotes && results.quotes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary mb-2">Quotes</h4>
                  <div className="space-y-2">
                    {results.quotes.map((quote) => (
                      <Link
                        key={`quote-${quote.id}`}
                        href={`/office/quotations/${quote.id}`}
                        className="block p-3 hover:bg-surface-secondary rounded-xl transition-all duration-200"
                        onClick={() => setResults(null)}
                      >
                        <div className="font-medium">Quote #{quote.id}</div>
                        <div className="text-sm text-text-secondary">View quote details</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Jobs */}
              {results.jobs && results.jobs.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary mb-2">Jobs</h4>
                  <div className="space-y-2">
                    {results.jobs.map((job) => (
                      <Link
                        key={`job-${job.id}`}
                        href={`/office/jobs/${job.id}`}
                        className="block p-3 hover:bg-surface-secondary rounded-xl transition-all duration-200"
                        onClick={() => setResults(null)}
                      >
                        <div className="font-medium">Job #{job.id}</div>
                        <div className="text-sm text-text-secondary">View job details</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {results.invoices && results.invoices.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary mb-2">Invoices</h4>
                  <div className="space-y-2">
                    {results.invoices.map((invoice) => (
                      <Link
                        key={`invoice-${invoice.id}`}
                        href={`/office/invoices/${invoice.id}`}
                        className="block p-3 hover:bg-surface-secondary rounded-xl transition-all duration-200"
                        onClick={() => setResults(null)}
                      >
                        <div className="font-medium">Invoice #{invoice.id}</div>
                        <div className="text-sm text-text-secondary">View invoice details</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Parts */}
              {results.parts && results.parts.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary mb-2">Parts</h4>
                  <div className="space-y-2">
                    {results.parts.map((part) => (
                      <Link
                        key={`part-${part.id}`}
                        href={`/office/parts/${part.id}`}
                        className="block p-3 hover:bg-surface-secondary rounded-xl transition-all duration-200"
                        onClick={() => setResults(null)}
                      >
                        <div className="font-medium">{part.part_number}</div>
                        <div className="text-sm text-text-secondary">{part.description}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {(!results.clients || results.clients.length === 0) &&
               (!results.vehicles || results.vehicles.length === 0) &&
               (!results.quotes || results.quotes.length === 0) &&
               (!results.jobs || results.jobs.length === 0) &&
               (!results.invoices || results.invoices.length === 0) &&
               (!results.parts || results.parts.length === 0) && (
                <div className="text-center py-8 text-text-secondary">
                  <div className="text-lg font-medium mb-2">No results found</div>
                  <div className="text-sm">Try searching with different terms</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Bug Report Modal */}
      {showBug && (
        <BugReportModal onSubmit={submitBug} onClose={() => setShowBug(false)} />
      )}

      {/* Enhanced Toast Notifications */}
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
