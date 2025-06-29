export async function fetchFleets() {
  const res = await fetch('/api/fleets');
  if (!res.ok) throw new Error('Failed to fetch fleets');
  return res.json();
}
