import pool from '../lib/db.js';

async function fixJob10Vehicle() {
  console.log('🔧 Checking Job 10 vehicle data...\n');

  try {
    // Check Job 10 details
    const [[job10]] = await pool.query('SELECT * FROM jobs WHERE id = 10');
    console.log('📋 Job 10 details:');
    console.log(`  - customer_id: ${job10?.customer_id}`);
    console.log(`  - vehicle_id: ${job10?.vehicle_id}`);
    console.log(`  - status: ${job10?.status}`);

    if (!job10) {
      console.log('❌ Job 10 does not exist');
      return;
    }

    // Check if Job 10 has a quote
    const [[quote10]] = await pool.query('SELECT * FROM quotes WHERE job_id = 10');
    console.log('\n📄 Quote for Job 10:');
    console.log(`  - quote_id: ${quote10?.id}`);
    console.log(`  - vehicle_id: ${quote10?.vehicle_id}`);
    console.log(`  - customer_id: ${quote10?.customer_id}`);

    if (quote10 && quote10.vehicle_id && !job10.vehicle_id) {
      console.log('\n🔧 Fixing Job 10 vehicle_id...');
      await pool.query('UPDATE jobs SET vehicle_id = ? WHERE id = 10', [quote10.vehicle_id]);
      console.log(`  ✅ Updated Job 10 with vehicle_id = ${quote10.vehicle_id}`);
    }

    // Check vehicle data
    if (job10.vehicle_id) {
      const [[vehicle]] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [job10.vehicle_id]);
      console.log('\n🚗 Vehicle data:');
      console.log(`  - licence_plate: ${vehicle?.licence_plate}`);
      console.log(`  - make: ${vehicle?.make}`);
      console.log(`  - model: ${vehicle?.model}`);
      console.log(`  - color: ${vehicle?.color}`);
    } else {
      console.log('\n❌ Job 10 has no vehicle_id');
    }

    // Check all jobs for missing vehicle data
    console.log('\n🔍 Checking all jobs for missing vehicle data...');
    const [jobsWithoutVehicle] = await pool.query(`
      SELECT j.id, j.customer_id, j.vehicle_id, j.status,
             q.vehicle_id as quote_vehicle_id
      FROM jobs j
      LEFT JOIN quotes q ON j.job_id = q.job_id
      WHERE j.vehicle_id IS NULL
      ORDER BY j.id
    `);

    if (jobsWithoutVehicle.length > 0) {
      console.log('⚠️  Jobs with missing vehicle data:');
      jobsWithoutVehicle.forEach(job => {
        console.log(`  Job ${job.id}: customer_id=${job.customer_id}, status=${job.status}, quote_vehicle_id=${job.quote_vehicle_id}`);
      });

      // Fix jobs with missing vehicle data
      console.log('\n🔧 Fixing jobs with missing vehicle data...');
      for (const job of jobsWithoutVehicle) {
        if (job.quote_vehicle_id) {
          await pool.query('UPDATE jobs SET vehicle_id = ? WHERE id = ?', [job.quote_vehicle_id, job.id]);
          console.log(`  ✅ Updated Job ${job.id} with vehicle_id = ${job.quote_vehicle_id}`);
        }
      }
    } else {
      console.log('✅ All jobs have vehicle data');
    }

    console.log('\n✅ Job 10 vehicle check completed!');

  } catch (error) {
    console.error('❌ Error fixing Job 10 vehicle:', error);
  } finally {
    await pool.end();
  }
}

fixJob10Vehicle(); 