import pool from '../lib/db.js';

/**
 * Supplier Credit Management Service
 * Handles all credit-related operations for suppliers
 */

// Get current credit balance for a supplier
export async function getSupplierCreditBalance(supplierId) {
  try {
    const [rows] = await pool.query(
      `SELECT 
        s.id, s.name, s.credit_limit, s.current_credit_balance,
        COALESCE(s.credit_limit, 0) - COALESCE(s.current_credit_balance, 0) as available_credit,
        s.last_balance_update
       FROM suppliers s
       WHERE s.id = ?`,
      [supplierId]
    );
    
    if (rows.length === 0) {
      throw new Error('Supplier not found');
    }
    
    return rows[0];
  } catch (error) {
    console.error('Error getting supplier credit balance:', error);
    throw error;
  }
}

// Get all suppliers with their credit information
export async function getAllSuppliersWithCredit() {
  try {
    const [rows] = await pool.query(
      `SELECT 
        s.id, s.name, s.credit_limit, s.current_credit_balance,
        COALESCE(s.credit_limit, 0) - COALESCE(s.current_credit_balance, 0) as available_credit,
        s.last_balance_update,
        CASE 
          WHEN s.credit_limit IS NULL THEN 'No Limit Set'
          WHEN s.current_credit_balance >= s.credit_limit THEN 'At Limit'
          WHEN s.current_credit_balance >= (s.credit_limit * 0.8) THEN 'Near Limit'
          ELSE 'OK'
        END as credit_status
       FROM suppliers s
       ORDER BY s.name`
    );
    
    return rows;
  } catch (error) {
    console.error('Error getting suppliers with credit:', error);
    throw error;
  }
}

// Record credit usage when parts are sold
export async function recordCreditUsage(supplierId, amount, referenceType, referenceId, description, createdBy) {
  try {
    // Start transaction
    await pool.query('START TRANSACTION');
    
    try {
      // Insert credit transaction
      await pool.query(
        `INSERT INTO supplier_credit_transactions 
         (supplier_id, transaction_type, amount, description, reference_type, reference_id, created_by)
         VALUES (?, 'credit_used', ?, ?, ?, ?, ?)`,
        [supplierId, amount, description, referenceType, referenceId, createdBy]
      );
      
      // Update supplier's current credit balance
      await pool.query(
        `UPDATE suppliers 
         SET current_credit_balance = COALESCE(current_credit_balance, 0) + ?,
             last_balance_update = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [amount, supplierId]
      );
      
      await pool.query('COMMIT');
      
      return { success: true, message: 'Credit usage recorded successfully' };
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error recording credit usage:', error);
    throw error;
  }
}

// Record supplier payment
export async function recordSupplierPayment(supplierId, paymentData, createdBy) {
  try {
    const { payment_amount, payment_date, payment_method, reference_number, description } = paymentData;
    
    // Start transaction
    await pool.query('START TRANSACTION');
    
    try {
      // Insert payment record
      const [paymentResult] = await pool.query(
        `INSERT INTO supplier_payments 
         (supplier_id, payment_amount, payment_date, payment_method, reference_number, description, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [supplierId, payment_amount, payment_date, payment_method, reference_number, description, createdBy]
      );
      
      // Insert credit transaction for payment
      await pool.query(
        `INSERT INTO supplier_credit_transactions 
         (supplier_id, transaction_type, amount, description, reference_type, reference_id, created_by)
         VALUES (?, 'payment_made', ?, ?, 'payment', ?, ?)`,
        [supplierId, payment_amount, `Payment: ${description || 'Supplier payment'}`, paymentResult.insertId, createdBy]
      );
      
      // Update supplier's current credit balance (reduce it)
      await pool.query(
        `UPDATE suppliers 
         SET current_credit_balance = GREATEST(0, COALESCE(current_credit_balance, 0) - ?),
             last_balance_update = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [payment_amount, supplierId]
      );
      
      await pool.query('COMMIT');
      
      return { success: true, message: 'Payment recorded successfully', payment_id: paymentResult.insertId };
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error recording supplier payment:', error);
    throw error;
  }
}

// Get credit transaction history for a supplier
export async function getSupplierCreditHistory(supplierId, limit = 50) {
  try {
    const [rows] = await pool.query(
      `SELECT 
        sct.id, sct.transaction_type, sct.amount, sct.description,
        sct.reference_type, sct.reference_id, sct.transaction_date,
        sct.notes, u.username as created_by_name
       FROM supplier_credit_transactions sct
       LEFT JOIN users u ON sct.created_by = u.id
       WHERE sct.supplier_id = ?
       ORDER BY sct.transaction_date DESC
       LIMIT ?`,
      [supplierId, limit]
    );
    
    return rows;
  } catch (error) {
    console.error('Error getting supplier credit history:', error);
    throw error;
  }
}

// Get payment history for a supplier
export async function getSupplierPaymentHistory(supplierId, limit = 50) {
  try {
    const [rows] = await pool.query(
      `SELECT 
        sp.id, sp.payment_amount, sp.payment_date, sp.payment_method,
        sp.reference_number, sp.description, sp.created_at,
        u.username as created_by_name
       FROM supplier_payments sp
       LEFT JOIN users u ON sp.created_by = u.id
       WHERE sp.supplier_id = ?
       ORDER BY sp.payment_date DESC
       LIMIT ?`,
      [supplierId, limit]
    );
    
    return rows;
  } catch (error) {
    console.error('Error getting supplier payment history:', error);
    throw error;
  }
}

// Calculate credit usage from existing sales data
export async function calculateExistingCreditUsage() {
  try {
    // Get all parts sold through quotes and invoices
    const [rows] = await pool.query(
      `SELECT 
        p.supplier_id,
        p.unit_cost,
        COALESCE(qi.qty, 1) as quantity,
        (p.unit_cost * COALESCE(qi.qty, 1)) as total_cost,
        'quote' as source_type,
        qi.id as source_id
       FROM parts p
       JOIN quote_items qi ON p.id = qi.part_id
       WHERE p.supplier_id IS NOT NULL
       
       UNION ALL
       
       SELECT 
        p.supplier_id,
        p.unit_cost,
        COALESCE(ii.qty, 1) as quantity,
        (p.unit_cost * COALESCE(ii.qty, 1)) as total_cost,
        'invoice' as source_type,
        ii.id as source_id
       FROM parts p
       JOIN invoice_items ii ON p.id = ii.part_id
       WHERE p.supplier_id IS NOT NULL`
    );
    
    // Group by supplier and calculate total usage
    const supplierUsage = {};
    rows.forEach(row => {
      if (!supplierUsage[row.supplier_id]) {
        supplierUsage[row.supplier_id] = 0;
      }
      supplierUsage[row.supplier_id] += parseFloat(row.total_cost);
    });
    
    // Update supplier credit balances
    for (const [supplierId, totalUsage] of Object.entries(supplierUsage)) {
      await pool.query(
        `UPDATE suppliers 
         SET current_credit_balance = ?,
             last_balance_update = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [totalUsage, supplierId]
      );
    }
    
    return { success: true, message: 'Existing credit usage calculated and updated' };
  } catch (error) {
    console.error('Error calculating existing credit usage:', error);
    throw error;
  }
}

// Get credit summary for dashboard
export async function getCreditSummary() {
  try {
    const [rows] = await pool.query(
      `SELECT 
        COUNT(*) as total_suppliers,
        COUNT(CASE WHEN credit_limit IS NOT NULL THEN 1 END) as suppliers_with_limits,
        COUNT(CASE WHEN current_credit_balance >= credit_limit THEN 1 END) as at_limit,
        COUNT(CASE WHEN current_credit_balance >= (credit_limit * 0.8) AND current_credit_balance < credit_limit THEN 1 END) as near_limit,
        SUM(COALESCE(credit_limit, 0)) as total_credit_limit,
        SUM(COALESCE(current_credit_balance, 0)) as total_credit_used,
        SUM(COALESCE(credit_limit, 0) - COALESCE(current_credit_balance, 0)) as total_available_credit
       FROM suppliers`
    );
    
    return rows[0];
  } catch (error) {
    console.error('Error getting credit summary:', error);
    throw error;
  }
}
