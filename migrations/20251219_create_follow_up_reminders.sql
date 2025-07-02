CREATE TABLE IF NOT EXISTS follow_up_reminders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quote_id INT,
  invoice_id INT,
  reminder_ts DATETIME,
  sent_ts DATETIME,
  status VARCHAR(50),
  CONSTRAINT fk_follow_up_quote FOREIGN KEY (quote_id) REFERENCES quotes(id),
  CONSTRAINT fk_follow_up_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);
