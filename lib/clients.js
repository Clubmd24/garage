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

export async function fetchLocalDashboardData() {
  try {
    // Fetch client information
    const clientRes = await fetch('/api/portal/local/me');
    if (!clientRes.ok) throw new Error('Failed to fetch client data');
    const client = await clientRes.json();

    // Fetch related data
    const [vehiclesRes, jobsRes, quotesRes, invoicesRes] = await Promise.all([
      fetch(`/api/vehicles?customer_id=${client.id}`),
      fetch(`/api/jobs?customer_id=${client.id}`),
      fetch(`/api/quotes?customer_id=${client.id}`),
      fetch(`/api/invoices?customer_id=${client.id}`)
    ]);

    const [vehicles, jobs, quotes, invoices] = await Promise.all([
      vehiclesRes.json(),
      jobsRes.json(),
      quotesRes.json(),
      invoicesRes.json()
    ]);

    return {
      client,
      vehicles: vehicles || [],
      jobs: jobs || [],
      quotes: quotes || [],
      invoices: invoices || []
    };
  } catch (error) {
    console.error('Error fetching local dashboard data:', error);
    throw error;
  }
}