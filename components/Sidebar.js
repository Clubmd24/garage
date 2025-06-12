export function Sidebar() {
  return (
    <nav className="w-64 bg-[var(--color-surface)] h-screen p-4 space-y-2">
      <a href="/" className="block font-bold mb-4">Garage Vision</a>
      <a href="/dev/projects" className="block hover:underline">Dev → Projects</a>
      <a href="/chat" className="block hover:underline">Dev → Chat</a>
    </nav>
  );
}
