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
        fixed lg:static inset-y-0 left-0 z-50 w-64 sidebar-glass transform transition-transform duration-300 ease-in-out
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
        <nav className="flex-1 p-6 space-y-8">
          <div>
            <h3 className="uppercase text-xs font-bold mb-4 text-primary/70 tracking-wider">Main</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="nav-link">
                  <ArrowIcon />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/office" className="nav-link">
                  <ArrowIcon />
                  Office Home
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="uppercase text-xs font-bold mb-4 text-accent/70 tracking-wider">Sales</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/office/quotations/new" className="nav-link">
                  <ArrowIcon />
                  New Quotation
                </Link>
              </li>
              <li>
                <Link href="/office/invoices/new" className="nav-link">
                  <ArrowIcon />
                  New Invoice
                </Link>
              </li>
              <li>
                <Link href="/office/invoices" className="nav-link">
                  <ArrowIcon />
                  Invoices
                </Link>
              </li>
              <li>
                <Link href="/office/invoices?status=unpaid" className="nav-link">
                  <ArrowIcon />
                  Pay Invoice
                </Link>
              </li>
              <li>
                <Link href="/office/epos" className="nav-link">
                  <ArrowIcon />
                  EPOS
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="uppercase text-xs font-bold mb-4 text-success/70 tracking-wider">Operations</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/office/jobs/new" className="nav-link">
                  <ArrowIcon />
                  New Job
                </Link>
              </li>
              <li>
                <Link href="/office/job-requests" className="nav-link">
                  <ArrowIcon />
                  Job Requests
                </Link>
              </li>
              <li>
                <Link href="/office/job-management" className="nav-link">
                  <ArrowIcon />
                  Job Management
                </Link>
              </li>
              <li>
                <Link href="/office/quotations" className="nav-link">
                  <ArrowIcon />
                  Open Quotes
                </Link>
              </li>
              <li>
                <Link href="/office/scheduling" className="nav-link">
                  <ArrowIcon />
                  Scheduling
                </Link>
              </li>
              <li>
                <Link href="/office/live-screen" className="nav-link">
                  <ArrowIcon />
                  Workshop Live
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="uppercase text-xs font-bold mb-4 text-warning/70 tracking-wider">Management</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/office/clients" className="nav-link">
                  <ArrowIcon />
                  Clients
                </Link>
              </li>
              <li>
                <Link href="/office/vehicles" className="nav-link">
                  <ArrowIcon />
                  Vehicles
                </Link>
              </li>
              <li>
                <Link href="/office/engineers" className="nav-link">
                  <ArrowIcon />
                  Engineers
                </Link>
              </li>
              <li>
                <Link href="/office/parts" className="nav-link">
                  <ArrowIcon />
                  Parts
                </Link>
              </li>
              <li>
                <Link href="/office/suppliers" className="nav-link">
                  <ArrowIcon />
                  Suppliers
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="uppercase text-xs font-bold mb-4 text-info/70 tracking-wider">Reports</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/office/reporting" className="nav-link">
                  <ArrowIcon />
                  Business Reports
                </Link>
              </li>
              <li>
                <Link href="/office/reporting/engineer-performance" className="nav-link">
                  <ArrowIcon />
                  Engineer Performance
                </Link>
              </li>
              <li>
                <Link href="/office/reporting/epos" className="nav-link">
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
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Search Results</h3>
                <button
                  onClick={() => setResults(null)}
                  className="p-2 hover:bg-surface-secondary rounded-xl transition-all duration-200"
                >
                  <CloseIcon />
                </button>
              </div>
              
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="p-4 bg-surface-secondary rounded-xl border border-border-primary/20 hover:border-border-accent/50 transition-all duration-200">
                    <h4 className="font-medium text-text-primary mb-1">{result.title}</h4>
                    <p className="text-sm text-text-secondary">{result.description}</p>
                    {result.link && (
                      <Link href={result.link} className="text-primary hover:text-primary-light text-sm mt-2 inline-block">
                        View Details →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
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
