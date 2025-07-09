# Garage-Vision Dev Portal

## Setup

1. Copy `.env.example` to `.env.local` and fill in secrets. The required variables are `DATABASE_URL` and `JWT_SECRET`.
2. Configure AWS S3 to enable uploading logos and other files. Add the following environment variables from `.env.example`:
   - `S3_BUCKET`
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `NEXT_PUBLIC_S3_BUCKET`
   - `NEXT_PUBLIC_AWS_REGION`
   
   The S3 bucket must already exist and permit uploads.
3. Install the Python dependencies:
   `pip install -r requirements.txt`
4. Run `./setup.sh` to install Node.js and all JavaScript dependencies. This script installs `nvm` if necessary, runs `nvm install 22` then `nvm use 22`, and executes `npm ci`.
5. Make the bootstrap script executable and run it to scaffold the portal:
   `chmod +x bootstrap_dev_portal.sh && ./bootstrap_dev_portal.sh`
6. Run migrations: `npm run migrate`
   - This command executes every `.sql` file in the `migrations/` directory in
     order and records which have been run.
   - Running the script again safely skips already-applied migrations.
7. Run tests and lint checks: `npm test` and `npm run lint`
8. Start dev server: `npm run dev`

## Database

All database schema changes are stored as `.sql` files in the `migrations/`
directory. The migration script executes them sequentially and records the
results so it can be run repeatedly without errors.

## New Endpoints

- `/api/suppliers` - list and create suppliers.
- `/api/suppliers/[id]` - view, update and delete a supplier.
- `/api/purchase-orders` - create purchase orders with items.
- `/api/quote-items` - create or fetch quote items.
- `/api/search` - search across clients, vehicles, jobs, quotes, invoices and parts.

## Invoice Generation

An invoice template lives in `templates/invoice_template_final.docx`. Use the helper
script `generate_invoice.py` to render this template with data in JSON format
and produce a PDF invoice. Example usage:

```bash
pip install -r requirements.txt  # or run ./setup.sh beforehand
python generate_invoice.py invoice_data.json
```

The resulting files are written to the `output/` directory as
`invoice_<invoice_number>.docx` and `invoice_<invoice_number>.pdf`.

## Quotation Generation

An editable quotation template lives in `templates/quotation_template_final.docx`.
Use the helper script `generate_quote.py` to fill this template with JSON data
and produce a PDF quote. Example usage:

```bash
pip install -r requirements.txt  # or run ./setup.sh beforehand
python generate_quote.py quote_data.json
```

The resulting files are written to the `output/` directory as
`quote_<quote_number>.docx` and `quote_<quote_number>.pdf`.

## Viewing Quotes

From the office interface you can view any quotes linked to a client or vehicle.
Open a client or vehicle record and all associated quotes will appear beneath
their documents list.

## Master Search

The header on the office layout includes a search bar that queries multiple
entities at once. Results are grouped by type and link to the relevant
view or edit pages. Behind the scenes the `/api/search` endpoint performs
`LIKE` searches across clients, vehicles, jobs, quotes, invoices and parts.
