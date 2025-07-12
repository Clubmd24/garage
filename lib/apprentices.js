export async function fetchApprentices() {
  const res = await fetch('/api/apprentices');
  if (!res.ok) throw new Error('Failed to fetch apprentices');
  return res.json();
}
