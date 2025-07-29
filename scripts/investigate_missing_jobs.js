import pool from '../lib/db.js';

async function investigateMissingJobs() {
  console.log('🔍 Investigating missing jobs 5 and 6...\n');

  try {
    // Check all jobs
    const [jobs] = await pool.query('SELECT * FROM jobs ORDER BY id');
    console.log('📋 Current jobs in database:');
    jobs.forEach(job => {
      console.log(`  Job ${job.id}: customer_id=${job.customer_id}, vehicle_id=${job.vehicle_id}, status=${job.status}`);
    });

    // Check all quotes and their job associations
    const [quotes] = await pool.query(`
      SELECT 
        q.id, 
        q.customer_id, 
        q.job_id, 
        q.status, 
        q.total_amount,
        c.first_name,
        c.last_name,
        v.licence_plate
      FROM quotes q
      LEFT JOIN clients c ON q.customer_id = c.id
      LEFT JOIN vehicles v ON q.vehicle_id = v.id
      ORDER BY q.id
    `);
    
    console.log('\n📄 Quotes and their job associations:');
    quotes.forEach(quote => {
      console.log(`  Quote ${quote.id}: job_id=${quote.job_id}, status=${quote.status}, customer=${quote.first_name} ${quote.last_name}, vehicle=${quote.licence_plate}`);
    });

    // Check invoices and their job associations
    const [invoices] = await pool.query('SELECT * FROM invoices ORDER BY id');
    console.log('\n💰 Invoices and their job associations:');
    invoices.forEach(invoice => {
      console.log(`  Invoice ${invoice.id}: job_id=${invoice.job_id}, customer_id=${invoice.customer_id}, amount=${invoice.amount}, status=${invoice.status}`);
    });

    // Find quotes that should have jobs but don't
    const quotesNeedingJobs = quotes.filter(q => 
      (q.status === 'approved' || q.status === 'accepted' || q.status === 'job-card' || q.status === 'completed' || q.status === 'invoiced') && 
      !q.job_id
    );

    if (quotesNeedingJobs.length > 0) {
      console.log('\n⚠️  Quotes that should have jobs but don\'t:');
      quotesNeedingJobs.forEach(quote => {
        console.log(`  Quote ${quote.id}: status=${quote.status}, customer=${quote.first_name} ${quote.last_name}, vehicle=${quote.licence_plate}`);
      });
    }

    // Check if there are any orphaned job assignments
    const [assignments] = await pool.query(`
      SELECT ja.*, j.id as job_exists 
      FROM job_assignments ja 
      LEFT JOIN jobs j ON ja.job_id = j.id
      WHERE j.id IS NULL
    `);

    if (assignments.length > 0) {
      console.log('\n⚠️  Orphaned job assignments (referencing non-existent jobs):');
      assignments.forEach(assignment => {
        console.log(`  Assignment ${assignment.id}: job_id=${assignment.job_id}, user_id=${assignment.user_id}`);
      });
    }

  } catch (error) {
    console.error('❌ Error investigating missing jobs:', error);
  } finally {
    await pool.end();
  }
}

investigateMissingJobs(); 