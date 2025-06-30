export default async function logout() {
  const cookies = document.cookie.split(';').map(c => c.trim());
  const calls = [fetch('/api/auth/logout', { credentials: 'include' })];
  if (cookies.some(c => c.startsWith('fleet_token='))) {
    calls.push(fetch('/api/portal/fleet/logout', { credentials: 'include' }));
  }
  if (cookies.some(c => c.startsWith('local_token='))) {
    calls.push(fetch('/api/portal/local/logout', { credentials: 'include' }));
  }
  await Promise.all(calls);
}
