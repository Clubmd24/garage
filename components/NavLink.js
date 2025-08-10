import Link from 'next/link';

export function NavLink({ href, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="bg-slate-700 text-white rounded-full px-4 py-2 shadow hover:bg-slate-600 block text-center w-full transition-colors duration-200"
    >
      {children}
    </Link>
  );
}
