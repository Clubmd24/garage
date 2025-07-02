# Garage App Email Feature Spec

This document describes the email system used by Garage App for delivering quotes and invoices.

## Database Tables

### smtp_settings
Holds SMTP credentials used when sending mail.

- `id` INT primary key
- `host` VARCHAR
- `port` INT
- `username` VARCHAR
- `password` VARCHAR
- `secure` TINYINT
- `from_name` VARCHAR
- `from_email` VARCHAR

### email_templates
Stores reusable templates for various mail types.

- `id` INT primary key
- `name` VARCHAR
- `subject` VARCHAR
- `body` TEXT
- `type` VARCHAR (e.g. `quote` or `invoice`)

### follow_up_reminders
Automatically created reminders for staff to follow up on sent quotes or invoices.

- `id` INT primary key
- `quote_id` INT FK quotes.id
- `invoice_id` INT FK invoices.id
- `reminder_ts` DATETIME when reminder should trigger
- `sent_ts` DATETIME when reminder email was sent
- `status` VARCHAR

## API Endpoints

### /api/company/smtp-settings
- `GET` – fetch current SMTP settings
- `PUT` – create or update settings

### /api/company/email-templates
- `GET` – list templates
- `POST` – create template

### /api/company/email-templates/[id]
- `GET` – fetch single template
- `PUT` – update template
- `DELETE` – remove template

### /api/reminders
- `GET` – list follow-up reminders
- `POST` – create reminder manually

### /api/reminders/[id]
- `GET` – fetch reminder
- `PUT` – update reminder
- `DELETE` – delete reminder

## Email Sending

When a quote or invoice is created the system generates a PDF attachment and sends it to the client using Nodemailer and the configured SMTP credentials.

## Follow‑Up Scheduler

A scheduled job runs daily to populate new `follow_up_reminders` for quotes older than seven days that have not yet received a reminder.
