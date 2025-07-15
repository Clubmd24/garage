export async function fetchJobs({ fleet_id, customer_id, status } = {}) {
  let url = '/api/jobs';
  const params = new URLSearchParams();
  if (fleet_id) params.set('fleet_id', fleet_id);
  if (customer_id) params.set('customer_id', customer_id);
  if (status) params.set('status', status);
  const q = params.toString();
  if (q) url += `?${q}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function fetchJobsForDate(date) {
  const params = new URLSearchParams({ date });
  const res = await fetch(`/api/jobs?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function fetchJob(id) {
  const res = await fetch(`/api/jobs/${id}`);
  if (!res.ok) throw new Error('Failed to fetch job');
  return res.json();
}

export async function fetchJobsInRange(start, end, engineer_id, status) {
  const params = new URLSearchParams({ start, end });
  if (engineer_id) params.set('engineer_id', engineer_id);
  if (status) params.set('status', status);
  const res = await fetch(`/api/jobs?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function assignJob(id, data) {
  const res = await fetch(`/api/jobs/${id}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to assign job');
  return res.json();
}

export async function markPartsArrived(id) {
  const res = await fetch(`/api/jobs/${id}/parts-arrived`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to update job');
  return res.json();
}

