export default async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

