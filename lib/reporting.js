export async function fetchFinanceReport(start, end) {
  const res = await fetch(`/api/reporting/finance?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
  if (!res.ok) throw new Error('Failed to fetch finance report');
  return res.json();
}

export async function fetchEngineerPerformance(start, end) {
  const res = await fetch(`/api/reporting/engineer-performance?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
  if (!res.ok) throw new Error('Failed to fetch engineer performance');
  return res.json();
}

export async function fetchBusinessPerformance(start, end) {
  const res = await fetch(`/api/reporting/business-performance?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
  if (!res.ok) throw new Error('Failed to fetch business performance');
  return res.json();
}
