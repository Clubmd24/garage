import pool from '../../lib/db.js';
import { encryptJSON, decryptJSON } from '../../lib/cryptoVault.js';

export async function loadSession(tenantId: number, supplierId: number) {
  const [rows]: any = await pool.query(
    'SELECT encrypted_session FROM supplier_accounts WHERE tenant_id=? AND supplier_id=?',
    [tenantId, supplierId]
  );
  if (!rows.length || !rows[0].encrypted_session) return null;
  return decryptJSON(rows[0].encrypted_session);
}

export async function saveSession(tenantId: number, supplierId: number, sessionObj: any) {
  const encrypted = encryptJSON(sessionObj);
  await pool.query(
    `INSERT INTO supplier_accounts (tenant_id, supplier_id, encrypted_session, last_session_at, consent_automated_fetch, consent_at)
     VALUES (?, ?, ?, NOW(), 1, NOW())
     ON DUPLICATE KEY UPDATE encrypted_session=VALUES(encrypted_session), last_session_at=NOW(), consent_automated_fetch=1, consent_at=NOW()`,
    [tenantId, supplierId, encrypted]
  );
} 