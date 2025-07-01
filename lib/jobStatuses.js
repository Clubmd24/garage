export async function fetchJobStatuses() {
  const res = await fetch('/api/job-statuses');
  if (!res.ok) throw new Error('Failed to fetch job statuses');
  return res.json();
}

export async function createJobStatus(name) {
  const res = await fetch('/api/job-statuses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create job status');
  return res.json();
}

export async function deleteJobStatus(id) {
  await fetch(`/api/job-statuses/${id}`, { method: 'DELETE' });
}
