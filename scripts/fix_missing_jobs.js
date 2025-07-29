import pool from '../lib/db.js';

async function fixMissingJobs() {
  console.log('🔧 Fixing missing job associations...\n');

  try {
    // 1. Fix Quote 5 - create a job for it
    console.log('📋 Fixing Quote 5 (missing job_id)...');
    const [[quote5]] = await pool.query('SELECT * FROM quotes WHERE id = 5');
    
    if (quote5 && !quote5.job_id) {
      // Create a job for quote 5
      const [jobResult] = await pool.query(
        `INSERT INTO jobs (customer_id, vehicle_id, status) VALUES (?, ?, ?)`,
        [quote5.customer_id, quote5.vehicle_id, 'unassigned']
      );
      
      const jobId = jobResult.insertId;
      console.log(`  ✅ Created job ${jobId} for quote 5`);
      
      // Update quote 5 with the job_id
      await pool.query('UPDATE quotes SET job_id = ? WHERE id = 5', [jobId]);
      console.log(`  ✅ Updated quote 5 with job_id = ${jobId}`);
    }

    // 2. Fix invoices - link them to their associated jobs
    console.log('\n💰 Fixing invoice job associations...');
    
    // Get all invoices
    const [invoices] = await pool.query('SELECT * FROM invoices ORDER BY id');
    
    for (const invoice of invoices) {
      if (!invoice.job_id) {
        // Try to find a job for this invoice based on customer_id
        const [[job]] = await pool.query(
          'SELECT id FROM jobs WHERE customer_id = ? ORDER BY id DESC LIMIT 1',
          [invoice.customer_id]
        );
        
        if (job) {
          await pool.query('UPDATE invoices SET job_id = ? WHERE id = ?', [job.id, invoice.id]);
          console.log(`  ✅ Linked invoice ${invoice.id} to job ${job.id}`);
        } else {
          console.log(`  ⚠️  Could not find job for invoice ${invoice.id} (customer_id: ${invoice.customer_id})`);
        }
      }
    }

    // 3. Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    
    const [quotes] = await pool.query('SELECT id, job_id, status FROM quotes WHERE status IN ("job-card", "completed", "invoiced") ORDER BY id');
    console.log('📄 Quotes with job associations:');
    quotes.forEach(quote => {
      console.log(`  Quote ${quote.id}: job_id=${quote.job_id}, status=${quote.status}`);
    });
    
    const [fixedInvoices] = await pool.query('SELECT id, job_id, customer_id, amount, status FROM invoices ORDER BY id');
    console.log('\n💰 Invoices with job associations:');
    fixedInvoices.forEach(invoice => {
      console.log(`  Invoice ${invoice.id}: job_id=${invoice.job_id}, customer_id=${invoice.customer_id}, amount=${invoice.amount}, status=${invoice.status}`);
    });

    console.log('\n✅ Job association fixes completed!');

  } catch (error) {
    console.error('❌ Error fixing missing jobs:', error);
  } finally {
    await pool.end();
  }
}

fixMissingJobs(); 