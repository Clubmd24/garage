// lib/quotations.js

/**
 * Fetch all quote line items for a given job.
 * @param {string|number} jobId
 * @returns {Promise<Array>}  An array of quote item objects
 */
export async function fetchQuotesForJob(jobId) {
  const res = await fetch(`/api/quotes?job_id=${jobId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch quote items');
  }
  return res.json();
}
