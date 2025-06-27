export async function fetchVehicles(customer_id) {
  const url = customer_id ? `/api/vehicles?customer_id=${customer_id}` : '/api/vehicles';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch vehicles');
  return res.json();
}
