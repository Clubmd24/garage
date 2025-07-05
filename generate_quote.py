import json
import os
import sys
from typing import Any

try:
    from docxtpl import DocxTemplate
except ImportError:
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
        'quote_number', 'garage', 'client', 'vehicle',
        'defect', 'items', 'totals', 'terms'
    ]
    for key in required_top:
        if key not in data:
            raise KeyError(f"Missing top-level key: {key}")


def render_docx(data: dict) -> str:
    template_path = os.path.join('templates', 'quotation_template.docx')
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template not found: {template_path}")

    doc = DocxTemplate(template_path)
    doc.render(data)

    os.makedirs('output', exist_ok=True)
    out_docx = os.path.join('output', f"quote_{data['quote_number']}.docx")
    doc.save(out_docx)
    return out_docx


def convert_to_pdf(docx_path: str) -> str:
    pdf_path = docx_path.replace('.docx', '.pdf')
    if DOCX2PDF_AVAILABLE:
        docx2pdf_convert(docx_path, pdf_path)
    else:
        import subprocess
        try:
            subprocess.run(['unoconv', '-f', 'pdf', '-o', pdf_path, docx_path], check=True)
        except FileNotFoundError:
            raise RuntimeError('Neither docx2pdf nor unoconv is available for PDF conversion.')
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f'PDF conversion failed: {e}')
    return pdf_path


def main() -> int:
    if len(sys.argv) != 2:
        sys.stderr.write('Usage: python generate_quote.py <data.json>|-\n')
        return 1

    data_path = sys.argv[1]
    try:
        data = load_data(data_path)
        validate_data(data)
        docx_path = render_docx(data)
        pdf_path = convert_to_pdf(docx_path)
        print(f"Generated: {pdf_path}")
        return 0
    except Exception as e:
        sys.stderr.write(f"Error: {e}\n")
        return 2


if __name__ == '__main__':
    sys.exit(main())
