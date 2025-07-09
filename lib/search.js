export async function fetchSearch(q) {
  const params = new URLSearchParams({ q });
  const res = await fetch(`/api/search?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to search');
  return res.json();
}
