import pool from '../lib/db.js';

async function updateQuoteStatuses() {
  try {
    console.log('🔍 Updating quote statuses to match job statuses...\n');
    
    // Get all jobs with their associated quotes
    const [jobsWithQuotes] = await pool.query(`
      SELECT 
        j.id as job_id,
        j.status as job_status,
        q.id as quote_id,
        q.status as quote_status
      FROM jobs j
      LEFT JOIN quotes q ON j.id = q.job_id
      WHERE q.id IS NOT NULL
      ORDER BY j.id
    `);
    
    console.log('📋 Jobs and their associated quotes:');
    jobsWithQuotes.forEach(row => {
      console.log(`  - Job ${row.job_id} (${row.job_status}) -> Quote ${row.quote_id} (${row.quote_status})`);
    });
    
    // Update quotes to match job statuses
    let updatedCount = 0;
    for (const row of jobsWithQuotes) {
      if (row.job_status === 'ready for completion' && row.quote_status === 'job-card') {
        await pool.query('UPDATE quotes SET status = ? WHERE id = ?', ['ready for completion', row.quote_id]);
        console.log(`✅ Updated Quote ${row.quote_id} status from "job-card" to "ready for completion"`);
        updatedCount++;
      }
    }
    
    console.log(`\n🎉 Updated ${updatedCount} quotes to match job statuses`);
    
    // Verify the changes
    const [updatedJobsWithQuotes] = await pool.query(`
      SELECT 
        j.id as job_id,
        j.status as job_status,
        q.id as quote_id,
        q.status as quote_status
      FROM jobs j
      LEFT JOIN quotes q ON j.id = q.job_id
      WHERE q.id IS NOT NULL
      ORDER BY j.id
    `);
    
    console.log('\n📋 Updated jobs and their associated quotes:');
    updatedJobsWithQuotes.forEach(row => {
      console.log(`  - Job ${row.job_id} (${row.job_status}) -> Quote ${row.quote_id} (${row.quote_status})`);
    });
    
  } catch (error) {
    console.error('❌ Error updating quote statuses:', error);
  } finally {
    await pool.end();
  }
}

updateQuoteStatuses(); 