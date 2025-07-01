# Garage-Vision Dev Portal

## Setup

1. Copy `.env.example` to `.env.local` and fill in secrets. The required variables are `DATABASE_URL` and `JWT_SECRET`.
2. Select the Node.js version defined in `.nvmrc`: `nvm use`
3. Install dependencies: `npm install`
4. Make the bootstrap script executable and run it to scaffold the portal:
   `chmod +x bootstrap_dev_portal.sh && ./bootstrap_dev_portal.sh`
5. Run migrations: `npm run migrate`
   - This command executes every `.sql` file in the `migrations/` directory in
     order and records which have been run.
   - Running the script again safely skips already-applied migrations.
6. Run tests and lint checks: `npm test` and `npm run lint`
7. Start dev server: `npm run dev`

## Database

All database schema changes are stored as `.sql` files in the `migrations/`
directory. The migration script executes them sequentially and records the
results so it can be run repeatedly without errors.

## New Endpoints

- `/api/suppliers` - list and create suppliers.
- `/api/suppliers/[id]` - view, update and delete a supplier.
- `/api/purchase-orders` - create purchase orders with items.
- `/api/quote-items` - create or fetch quote items.

## Invoice Generation

An invoice template lives in `templates/invoice_template.docx`. Use the helper
script `generate_invoice.py` to render this template with data in JSON format
and produce a PDF invoice. Example usage:

```bash
pip install docxtpl python-docx2pdf
python generate_invoice.py invoice_data.json
```

The resulting files are written to the `output/` directory as
`invoice_<invoice_number>.docx` and `invoice_<invoice_number>.pdf`.
