export async function fetchInvoiceStatuses() {
  const res = await fetch('/api/invoice-statuses');
  if (!res.ok) throw new Error('Failed to fetch invoice statuses');
  return res.json();
}

export async function createInvoiceStatus(name) {
  const res = await fetch('/api/invoice-statuses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create invoice status');
  return res.json();
}

export async function deleteInvoiceStatus(id) {
  await fetch(`/api/invoice-statuses/${id}`, { method: 'DELETE' });
}
