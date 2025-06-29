export async function fetchVehicles(customer_id, fleet_id) {
  let url = '/api/vehicles';
  const params = new URLSearchParams();
  if (customer_id) params.set('customer_id', customer_id);
  if (fleet_id) params.set('fleet_id', fleet_id);
  const q = params.toString();
  if (q) url += `?${q}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch vehicles');
  return res.json();
}
