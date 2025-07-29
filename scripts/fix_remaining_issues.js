import pool from '../lib/db.js';

async function fixRemainingIssues() {
  console.log('🔧 Fixing remaining database issues...\n');

  try {
    // 1. Fix Quote 5 - it's completely orphaned
    console.log('📄 Fixing Quote 5 (orphaned data)...');
    const [[quote5]] = await pool.query('SELECT * FROM quotes WHERE id = 5');
    
    if (quote5 && quote5.customer_id === null) {
      // Quote 5 is orphaned - let's either delete it or fix it
      console.log('  ⚠️  Quote 5 is completely orphaned (no customer_id, vehicle_id)');
      console.log('  🗑️  Deleting orphaned Quote 5...');
      
      // Delete the associated job first
      await pool.query('DELETE FROM jobs WHERE id = ?', [quote5.job_id]);
      console.log(`  ✅ Deleted job ${quote5.job_id}`);
      
      // Delete the quote
      await pool.query('DELETE FROM quotes WHERE id = 5');
      console.log('  ✅ Deleted orphaned Quote 5');
    }

    // 2. Fix Job 7 - it has null customer_id and vehicle_id
    console.log('\n🔧 Fixing Job 7 (null associations)...');
    const [[job7]] = await pool.query('SELECT * FROM jobs WHERE id = 7');
    
    if (job7 && job7.customer_id === null) {
      // Job 7 was created for Quote 5 which is now deleted, so delete Job 7 too
      console.log('  🗑️  Job 7 was created for deleted Quote 5, deleting...');
      await pool.query('DELETE FROM jobs WHERE id = 7');
      console.log('  ✅ Deleted Job 7');
    }

    // 3. Fix invoices for customer 405 - they have no job associations
    console.log('\n💰 Fixing invoices for customer 405...');
    const [invoices405] = await pool.query('SELECT * FROM invoices WHERE customer_id = 405');
    
    for (const invoice of invoices405) {
      console.log(`  ⚠️  Invoice ${invoice.id} (customer_id=405) has no job association`);
      console.log(`  ℹ️  Customer 405 has no jobs, invoice will remain unlinked`);
    }

    // 4. Verify job associations for remaining quotes
    console.log('\n🔍 Verifying quote-job associations...');
    const [quotes] = await pool.query(`
      SELECT q.id, q.customer_id, q.vehicle_id, q.job_id, q.status,
             j.customer_id as job_customer_id, j.vehicle_id as job_vehicle_id, j.status as job_status
      FROM quotes q
      LEFT JOIN jobs j ON q.job_id = j.id
      WHERE q.status IN ('job-card', 'completed', 'invoiced')
      ORDER BY q.id
    `);
    
    console.log('📄 Quote-Job Associations:');
    quotes.forEach(quote => {
      if (quote.job_id) {
        console.log(`  Quote ${quote.id}: job_id=${quote.job_id}, customer_id=${quote.customer_id}, vehicle_id=${quote.vehicle_id}, status=${quote.status}`);
        console.log(`    Job ${quote.job_id}: customer_id=${quote.job_customer_id}, vehicle_id=${quote.job_vehicle_id}, status=${quote.job_status}`);
      } else {
        console.log(`  Quote ${quote.id}: NO JOB ASSOCIATION (customer_id=${quote.customer_id}, vehicle_id=${quote.vehicle_id}, status=${quote.status})`);
      }
    });

    // 5. Check for any remaining orphaned data
    console.log('\n🧹 Checking for orphaned data...');
    
    const [orphanedQuotes] = await pool.query(`
      SELECT id, customer_id, vehicle_id, job_id, status 
      FROM quotes 
      WHERE customer_id IS NULL AND vehicle_id IS NULL
    `);
    
    if (orphanedQuotes.length > 0) {
      console.log('  ⚠️  Found orphaned quotes:');
      orphanedQuotes.forEach(quote => {
        console.log(`    Quote ${quote.id}: status=${quote.status}, job_id=${quote.job_id}`);
      });
    } else {
      console.log('  ✅ No orphaned quotes found');
    }

    // 6. Final verification
    console.log('\n🔍 Final verification...');
    
    const [finalJobs] = await pool.query('SELECT id, customer_id, vehicle_id, status FROM jobs ORDER BY id');
    console.log('📋 Final Jobs:');
    finalJobs.forEach(job => {
      console.log(`  Job ${job.id}: customer_id=${job.customer_id}, vehicle_id=${job.vehicle_id}, status=${job.status}`);
    });
    
    const [finalInvoices] = await pool.query('SELECT id, job_id, customer_id, amount, status FROM invoices ORDER BY id');
    console.log('\n💰 Final Invoices:');
    finalInvoices.forEach(invoice => {
      console.log(`  Invoice ${invoice.id}: job_id=${invoice.job_id}, customer_id=${invoice.customer_id}, amount=${invoice.amount}, status=${invoice.status}`);
    });

    console.log('\n✅ Database cleanup completed!');

  } catch (error) {
    console.error('❌ Error fixing remaining issues:', error);
  } finally {
    await pool.end();
  }
}

fixRemainingIssues(); 