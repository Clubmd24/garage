import { useEffect, useState } from "react";
import { NavLink } from "./NavLink.js";

export function Sidebar() {
  const [userRole, setUserRole] = useState(null);
  const [open, setOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [entry, setEntry] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setUserRole(u?.role?.toLowerCase()))
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (userRole !== 'engineer') return;
    async function loadJobs() {
      try {
        const r = await fetch('/api/engineer/jobs', { credentials: 'include' });
        if (!r.ok) throw new Error('Failed to load jobs');
        const data = await r.json();
        setJobs(Array.isArray(data) ? data : []);
        if (data.length) setSelectedJob(data[0].id);
      } catch {
        /* ignore */
      }
    }
    loadJobs();
  }, [userRole]);

  async function clockIn() {
    if (!selectedJob) return;
    try {
      const r = await fetch('/api/engineer/time-entries?action=clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ job_id: selectedJob })
      });
      if (r.ok) {
        const e = await r.json();
        setEntry(e);
        setMessage('Clocked in');
      }
    } catch {
      setMessage('Clock in failed');
    }
  }

  async function clockOut() {
    if (!entry) return;
    try {
      const r = await fetch('/api/engineer/time-entries?action=clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ entry_id: entry.id })
      });
      if (r.ok) {
        await r.json();
        setEntry(null);
        setMessage('Clocked out');
      }
    } catch {
      setMessage('Clock out failed');
    }
  }

  async function requestHoliday() {
    const start = prompt('Start date (YYYY-MM-DD)');
    const end = start ? prompt('End date (YYYY-MM-DD)') : null;
    if (!start || !end) return;
    try {
      await fetch('/api/engineer/holiday-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ start_date: start, end_date: end })
      });
      setMessage('Holiday request submitted');
    } catch {
      setMessage('Request failed');
    }
  }

  const linkProps = {
    className:
      "bg-gray-200 text-black rounded-full px-4 py-2 shadow hover:bg-gray-300 block text-center w-full",
    onClick: () => setOpen(false),
  };

  return (
    <div className="sm:w-64">
      <button
        className="sm:hidden p-4"
        aria-label="Toggle navigation"
        onClick={() => setOpen((o) => !o)}
      >
        <svg
          className="w-6 h-6 text-[var(--color-text-primary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <nav
        className={`rounded-r-3xl shadow-lg bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 text-[var(--color-text-primary)] space-y-4 p-4 sm:h-screen sm:block ${open ? "block" : "hidden"}`}
      >
        <a
          href="/dashboard"
          className="block font-bold mb-4 text-center"
          onClick={() => setOpen(false)}
        >
          Garage Vision
        </a>
        {userRole === "engineer" && (
          <>
            <a
              href="/engineer"
              className="bg-red-800 text-white font-bold rounded-full px-4 py-2 shadow hover:bg-red-900 block text-center w-full"
              onClick={() => setOpen(false)}
            >
              Engineer Portal
            </a>
            <a href="/engineer/wiki" {...linkProps}>
              Wiki
            </a>
            <div className="space-y-2 action-buttons mt-4">
              <button onClick={clockIn} className="w-full">Clock In</button>
              <button onClick={clockOut} className="w-full">Clock Out</button>
              <button onClick={requestHoliday} className="w-full">
                Request Holiday
              </button>
            </div>
            {message && (
              <p className="text-center text-green-600 dark:text-green-400 text-sm">
                {message}
              </p>
            )}
          </>
        )}
        {(userRole === "developer" || userRole === "admin") && (
          <>
            <a
              href="/dev"
              className="bg-red-800 text-white font-bold rounded-full px-4 py-2 shadow hover:bg-red-900 block text-center w-full"
              onClick={() => setOpen(false)}
            >
              Dev Portal
            </a>
            <a href="/dev/projects" {...linkProps}>
              Projects
            </a>
            <a href="/dev/dashboard" {...linkProps}>
              Dashboard
            </a>
            <a href="/office" {...linkProps}>
              Office
            </a>
            <a href="/office/hr" {...linkProps}>
              HR
            </a>
            <a href="/chat" {...linkProps}>
              Chat
            </a>
            <a href="/admin/users" {...linkProps}>
              Users
            </a>
            {process.env.NODE_ENV === 'development' && (
              <NavLink href="/dev/error-log" onClick={() => setOpen(false)}>
                Error Log
              </NavLink>
            )}
          </>
        )}
      </nav>
    </div>
  );
}
