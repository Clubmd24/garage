export async function fetchInvoices() {
  const res = await fetch('/api/invoices');
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
}

export async function createInvoice(data) {
  const res = await fetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create invoice');
  return res.json();
}
