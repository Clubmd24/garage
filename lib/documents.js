export async function fetchDocuments(entity_type, entity_id) {
  const res = await fetch(`/api/documents?entity_type=${entity_type}&entity_id=${entity_id}`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}
