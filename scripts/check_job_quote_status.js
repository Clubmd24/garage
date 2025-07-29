import pool from '../lib/db.js';

async function checkJobQuoteStatus() {
  try {
    console.log('🔍 Checking job and quote status relationships...\n');
    
    // Check jobs with 'ready for completion' status
    const [readyJobs] = await pool.query(`
      SELECT id, customer_id, vehicle_id, status 
      FROM jobs 
      WHERE status = 'ready for completion'
    `);
    
    console.log('📋 Jobs with "ready for completion" status:');
    readyJobs.forEach(job => console.log(`  - Job ${job.id}: customer_id=${job.customer_id}, vehicle_id=${job.vehicle_id}`));
    
    // Check quotes associated with these jobs
    for (const job of readyJobs) {
      const [quotes] = await pool.query(`
        SELECT id, status, job_id, customer_id, vehicle_id
        FROM quotes 
        WHERE job_id = ?
        ORDER BY revision DESC
      `, [job.id]);
      
      console.log(`\n📋 Quotes for Job ${job.id}:`);
      quotes.forEach(quote => console.log(`  - Quote ${quote.id}: status="${quote.status}", customer_id=${quote.customer_id}, vehicle_id=${quote.vehicle_id}`));
    }
    
    // Check all quotes with 'ready for completion' status
    const [readyQuotes] = await pool.query(`
      SELECT id, job_id, status, customer_id, vehicle_id
      FROM quotes 
      WHERE status = 'ready for completion'
    `);
    
    console.log('\n📋 Quotes with "ready for completion" status:');
    readyQuotes.forEach(quote => console.log(`  - Quote ${quote.id}: job_id=${quote.job_id}, customer_id=${quote.customer_id}, vehicle_id=${quote.vehicle_id}`));
    
    // Check job cards filter
    const [jobCardQuotes] = await pool.query(`
      SELECT id, job_id, status, customer_id, vehicle_id
      FROM quotes 
      WHERE status IN ('job-card', 'completed', 'invoiced', 'ready for completion')
    `);
    
    console.log('\n📋 Quotes that should appear in job cards:');
    jobCardQuotes.forEach(quote => console.log(`  - Quote ${quote.id}: job_id=${quote.job_id}, status="${quote.status}"`));
    
  } catch (error) {
    console.error('❌ Error checking job quote status:', error);
  } finally {
    await pool.end();
  }
}

checkJobQuoteStatus(); 