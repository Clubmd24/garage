import Link from 'next/link';

export function DashboardCard({ href, title, Icon }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-blue-400 text-white font-bold rounded-full py-6 px-6 shadow-2xl transform hover:scale-105 transition-transform duration-300"
    >
      <Icon />
      <span className="text-lg">{title}</span>
    </Link>
  );
}
