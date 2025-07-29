import pool from '../lib/db.js';

async function fixDatabaseIssues() {
  console.log('🔧 Fixing database issues...\n');

  try {
    // 1. Add missing foreign key constraints
    console.log('📋 Adding missing foreign key constraints...');
    try {
      await pool.query(`
        ALTER TABLE jobs 
        ADD CONSTRAINT fk_jobs_vehicle 
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
      `);
      console.log('  ✅ Added fk_jobs_vehicle constraint');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('  ℹ️  fk_jobs_vehicle constraint already exists');
      } else {
        console.log('  ⚠️  Could not add fk_jobs_vehicle constraint:', error.message);
      }
    }

    // 2. Fix Quote 5 - create job for it
    console.log('\n📄 Fixing Quote 5 (missing job_id)...');
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
    } else {
      console.log('  ℹ️  Quote 5 already has a job or doesn\'t exist');
    }

    // 3. Fix vehicle associations for jobs 5 & 6
    console.log('\n🚗 Fixing vehicle associations for jobs 5 & 6...');
    
    // Get the vehicle_id from quotes for jobs 5 & 6
    const [[quote11]] = await pool.query('SELECT vehicle_id FROM quotes WHERE job_id = 5');
    const [[quote12]] = await pool.query('SELECT vehicle_id FROM quotes WHERE job_id = 6');
    
    if (quote11 && quote11.vehicle_id) {
      await pool.query('UPDATE jobs SET vehicle_id = ? WHERE id = 5', [quote11.vehicle_id]);
      console.log(`  ✅ Updated job 5 with vehicle_id = ${quote11.vehicle_id}`);
    }
    
    if (quote12 && quote12.vehicle_id) {
      await pool.query('UPDATE jobs SET vehicle_id = ? WHERE id = 6', [quote12.vehicle_id]);
      console.log(`  ✅ Updated job 6 with vehicle_id = ${quote12.vehicle_id}`);
    }

    // 4. Fix invoice job associations
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

    // 5. Clean up orphaned data
    console.log('\n🧹 Cleaning up orphaned data...');
    
    // Find quotes with no customer_id, vehicle_id, or job_id
    const [orphanedQuotes] = await pool.query(`
      SELECT id FROM quotes 
      WHERE customer_id IS NULL 
        AND vehicle_id IS NULL 
        AND job_id IS NULL
    `);
    
    if (orphanedQuotes.length > 0) {
      console.log(`  ⚠️  Found ${orphanedQuotes.length} orphaned quotes:`, orphanedQuotes.map(q => q.id));
    }

    // 6. Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    
    const [jobs] = await pool.query('SELECT id, customer_id, vehicle_id, status FROM jobs ORDER BY id');
    console.log('📋 Jobs with associations:');
    jobs.forEach(job => {
      console.log(`  Job ${job.id}: customer_id=${job.customer_id}, vehicle_id=${job.vehicle_id}, status=${job.status}`);
    });
    
    const [quotes] = await pool.query('SELECT id, job_id, status FROM quotes WHERE status IN ("job-card", "completed", "invoiced") ORDER BY id');
    console.log('\n📄 Quotes with job associations:');
    quotes.forEach(quote => {
      console.log(`  Quote ${quote.id}: job_id=${quote.job_id}, status=${quote.status}`);
    });
    
    const [fixedInvoices] = await pool.query('SELECT id, job_id, customer_id, amount, status FROM invoices ORDER BY id');
    console.log('\n💰 Invoices with job associations:');
    fixedInvoices.forEach(invoice => {
      console.log(`  Invoice ${invoice.id}: job_id=${invoice.job_id}, customer_id=${invoice.customer_id}, amount=${invoice.amount}, status=${invoice.status}`);
    });

    console.log('\n✅ Database fixes completed!');

  } catch (error) {
    console.error('❌ Error fixing database issues:', error);
  } finally {
    await pool.end();
  }
}

fixDatabaseIssues(); 