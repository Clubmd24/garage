import Link from 'next/link';

export function NavLink({ href, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="bg-gray-200 text-black rounded-full px-4 py-2 shadow hover:bg-gray-300 block text-center w-full"
    >
      {children}
    </Link>
  );
}
