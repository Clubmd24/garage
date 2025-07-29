import json
import os
import sys
from typing import Any

try:
    from docxtpl import DocxTemplate
except ImportError as e:
    sys.stderr.write("Missing dependency: docxtpl. Install with 'pip install docxtpl'.\n")
    sys.exit(1)

try:
    from docx2pdf import convert as docx2pdf_convert
    DOCX2PDF_AVAILABLE = True
except ImportError:
    DOCX2PDF_AVAILABLE = False


def load_data(path: str) -> Any:
    if path == '-':
        return json.load(sys.stdin)
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def validate_data(data: dict) -> None:
    required_top = [
        'invoice_number', 'garage', 'client', 'vehicle',
        'defect_description', 'items', 'totals', 'terms'
    ]
    for key in required_top:
        if key not in data:
            raise KeyError(f"Missing top-level key: {key}")


def calculate_totals(data: dict) -> None:
    items = data.get("items", [])
    total_cost = sum(it.get("qty", 0) * it.get("unit_cost", 0) for it in items)
    total_price = round(total_cost, 2)
    data["totals"] = {"total": total_price}


def render_docx(data: dict) -> str:
    template_path = os.path.join('templates', 'invoice_template_final.docx')
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template not found: {template_path}")

    doc = DocxTemplate(template_path)
    doc.render(data)

    os.makedirs('output', exist_ok=True)
    out_docx = os.path.join('output', f"invoice_{data['invoice_number']}.docx")
    doc.save(out_docx)
    return out_docx


def convert_to_pdf(docx_path: str) -> str:
    pdf_path = docx_path.replace('.docx', '.pdf')
    if DOCX2PDF_AVAILABLE:
        docx2pdf_convert(docx_path, pdf_path)
    else:
        # Fallback to unoconv or leave as DOCX
        pdf_path = docx_path  # No PDF conversion
    return pdf_path


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else '-'
    data = load_data(path)
    validate_data(data)
    calculate_totals(data)
    docx_file = render_docx(data)
    pdf_file = convert_to_pdf(docx_file)
    print(f"Invoice generated at: {pdf_file}")


if __name__ == "__main__":
    main()
