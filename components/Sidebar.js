import Link from 'next/link';
export function Sidebar() {
  return (
    <aside className="w-64 bg-[var(--color-primary)] text-white h-screen p-4 space-y-4">
      <Link href="/admin/users"><a className="block rounded-lg p-2 hover:bg-[var(--color-primary-light)]">Users</a></Link>
      <Link href="/admin/settings"><a className="block rounded-lg p-2 hover:bg-[var(--color-primary-light)]">Settings</a></Link>
      <Link href="/dev/projects"><a className="block rounded-lg p-2 hover:bg-[var(--color-primary-light)]">Dev Portal</a></Link>
    </aside>
  );
}