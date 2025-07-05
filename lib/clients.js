export async function fetchClients() {
  const res = await fetch('/api/clients');
  if (!res.ok) throw new Error('Failed to fetch clients');
  return res.json();
}

export async function fetchClient(id) {
  const res = await fetch(`/api/clients/${id}`);
  if (!res.ok) throw new Error('Failed to fetch client');
  return res.json();
}