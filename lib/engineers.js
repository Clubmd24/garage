export async function fetchEngineers() {
  const res = await fetch('/api/engineers');
  if (!res.ok) throw new Error('Failed to fetch engineers');
  return res.json();
}
