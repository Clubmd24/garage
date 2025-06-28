import { useEffect, useState } from "react";

export function Sidebar() {
  const [userRole, setUserRole] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setUserRole(u?.role?.toLowerCase()))
      .catch(() => null);
  }, []);

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
        className={`rounded-r-3xl shadow-lg bg-gradient-to-r from-gray-200 via-gray-100 to-transparent text-[var(--color-text-primary)] space-y-4 p-4 sm:h-screen sm:block ${open ? "block" : "hidden"}`}
      >
        <a
          href="/"
          className="block font-bold mb-4 text-center"
          onClick={() => setOpen(false)}
        >
          Garage Vision
        </a>
        <a href="/dev/projects" {...linkProps}>
          Projects
        </a>
        <a href="/dev/dashboard" {...linkProps}>
          Dashboard
        </a>
        <a href="/chat" {...linkProps}>
          Chat
        </a>
        {["admin", "developer"].includes(userRole) && (
          <a href="/admin/users" {...linkProps}>
            Users
          </a>
        )}
      </nav>
    </div>
  );
}
