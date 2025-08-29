import pool from '../lib/db-local.js';

export async function getEposReport(start, end) {
  const [rows] = await pool.query(
    `SELECT s.id, s.started_at, s.ended_at,
            s.cash_total AS declared_cash,
            s.card_total AS declared_card,
            COALESCE(SUM(CASE WHEN ps.payment_type='cash' THEN ps.total_amount END),0) AS sales_cash,
            COALESCE(SUM(CASE WHEN ps.payment_type='card' THEN ps.total_amount END),0) AS sales_card
       FROM pos_sessions s
       LEFT JOIN pos_sales ps ON ps.session_id = s.id
      WHERE s.started_at >= ? AND s.started_at < ?
   GROUP BY s.id
   ORDER BY s.started_at`,
    [start, end]
  );

  const sessions = rows.map(row => ({
    id: row.id,
    started_at: row.started_at,
    ended_at: row.ended_at,
    declared_cash: Number(row.declared_cash),
    declared_card: Number(row.declared_card),
    sales_cash: Number(row.sales_cash),
    sales_card: Number(row.sales_card),
    cash_difference: Number(row.sales_cash) - Number(row.declared_cash),
    card_difference: Number(row.sales_card) - Number(row.declared_card),
  }));

  const totals = sessions.reduce(
    (acc, s) => {
      acc.sales_cash += s.sales_cash;
      acc.sales_card += s.sales_card;
      acc.declared_cash += s.declared_cash;
      acc.declared_card += s.declared_card;
      return acc;
    },
    { sales_cash: 0, sales_card: 0, declared_cash: 0, declared_card: 0 }
  );
  totals.cash_difference = totals.sales_cash - totals.declared_cash;
  totals.card_difference = totals.sales_card - totals.declared_card;

  return { sessions, totals };
}
