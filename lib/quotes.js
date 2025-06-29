export async function fetchQuotes() {
  const res = await fetch('/api/quotes');
  if (!res.ok) throw new Error('Failed to fetch quotes');
  return res.json();
}

export async function createQuote(data) {
  const res = await fetch('/api/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create quote');
  return res.json();
}

export async function updateQuote(id, data) {
  const res = await fetch(`/api/quotes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update quote');
  return res.json();
}
