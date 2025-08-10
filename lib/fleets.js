export async function fetchFleets() {
  const res = await fetch('/api/fleets');
  if (!res.ok) throw new Error('Failed to fetch fleets');
  return res.json();
}

export async function fetchFleetDashboardData() {
  try {
    // Fetch fleet information
    const fleetRes = await fetch('/api/portal/fleet/me');
    if (!fleetRes.ok) throw new Error('Failed to fetch fleet data');
    const fleet = await fleetRes.json();

    // Fetch related data
    const [vehiclesRes, jobsRes, quotesRes, invoicesRes] = await Promise.all([
      fetch(`/api/vehicles?fleet_id=${fleet.id}`),
      fetch(`/api/jobs?fleet_id=${fleet.id}`),
      fetch(`/api/quotes?fleet_id=${fleet.id}`),
      fetch(`/api/invoices?fleet_id=${fleet.id}`)
    ]);

    const [vehicles, jobs, quotes, invoices] = await Promise.all([
      vehiclesRes.json(),
      jobsRes.json(),
      quotesRes.json(),
      invoicesRes.json()
    ]);

    return {
      user: fleet,
      vehicles: vehicles || [],
      jobs: jobs || [],
      quotes: quotes || [],
      invoices: invoices || []
    };
  } catch (error) {
    console.error('Error fetching fleet dashboard data:', error);
    throw error;
  }
}
