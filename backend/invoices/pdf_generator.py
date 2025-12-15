import os
from io import BytesIO
from django.conf import settings

# Try to import WeasyPrint, fall back to ReportLab if not available
WEASYPRINT_AVAILABLE = False
try:
    from weasyprint import HTML
    from weasyprint.text.fonts import FontConfiguration
    from django.template.loader import render_to_string
    WEASYPRINT_AVAILABLE = True
except (ImportError, OSError):
    # WeasyPrint not available or GTK libraries missing
    pass

# ReportLab imports for fallback
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def generate_invoice_pdf_weasyprint(invoice):
    """
    Generate a PDF invoice using WeasyPrint with the Canva template.
    Uses Quicksand font and the SB logo.
    """
    font_config = FontConfiguration()

    # Paths
    static_dir = os.path.join(settings.BASE_DIR, 'static')
    font_path = os.path.join(static_dir, 'fonts')
    logo_path = os.path.join(static_dir, 'images', 'logo.svg')

    # Calculate remaining amount after deposit
    remaining_amount = 0
    if invoice.deposit_amount:
        remaining_amount = invoice.total_amount - invoice.deposit_amount

    # Get items with proper titles
    items = []
    for item in invoice.items.all():
        items.append({
            'title': getattr(item, 'title', None) or item.description,
            'subtitle': item.description if getattr(item, 'title', None) else None,
            'quantity': item.quantity,
            'total_price': item.total_price,
        })

    context = {
        'invoice': invoice,
        'client': invoice.client,
        'items': items,
        'font_path': font_path,
        'logo_path': logo_path,
        'remaining_amount': remaining_amount,
    }

    html_string = render_to_string('invoices/invoice_template.html', context)

    html = HTML(string=html_string, base_url=str(settings.BASE_DIR))
    pdf = html.write_pdf(font_config=font_config)

    return pdf


def generate_invoice_pdf_reportlab(invoice):
    """
    Generate a PDF invoice using ReportLab (fallback).
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)

    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=24, spaceAfter=20)
    heading_style = ParagraphStyle('Heading', parent=styles['Heading2'], fontSize=14, spaceAfter=10)
    normal_style = styles['Normal']

    elements = []

    # Header
    elements.append(Paragraph("FACTURE", title_style))
    elements.append(Spacer(1, 10))

    # Invoice details
    invoice_info = [
        ['Facture n°:', invoice.invoice_number],
        ['Date:', invoice.issued_date.strftime('%d-%m-%Y')],
        ['Échéance:', invoice.due_date.strftime('%d-%m-%Y')],
        ['Statut:', invoice.get_payment_status_display()],
    ]
    info_table = Table(invoice_info, colWidths=[1.5*inch, 3*inch])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 20))

    # Client info
    elements.append(Paragraph("Facturé à:", heading_style))
    elements.append(Paragraph(invoice.client.company or invoice.client.name, normal_style))
    if invoice.client.address_line1:
        elements.append(Paragraph(invoice.client.address_line1, normal_style))
    if invoice.client.ice_number:
        elements.append(Paragraph(f"ICE: {invoice.client.ice_number}", normal_style))
    elements.append(Spacer(1, 20))

    # Line items
    elements.append(Paragraph("Détails:", heading_style))
    items_data = [['Description', 'Qté', 'Prix U.', 'Total']]
    for item in invoice.items.all():
        title = getattr(item, 'title', None) or item.description
        items_data.append([
            title,
            str(item.quantity),
            f"{item.unit_price:.0f} MAD",
            f"{item.total_price:.0f} MAD",
        ])

    items_table = Table(items_data, colWidths=[3.5*inch, 0.75*inch, 1*inch, 1*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2A7B88')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 20))

    # Totals
    tva_rate = getattr(invoice, 'tva_rate', 0) or 0
    totals_data = [
        ['', '', 'Total HT:', f"{invoice.total_amount:.0f} MAD"],
        ['', '', f'TVA ({tva_rate:.0f}%):', f"{float(invoice.total_amount) * float(tva_rate) / 100:.0f} MAD"],
        ['', '', 'Payé:', f"{invoice.amount_paid:.0f} MAD"],
        ['', '', 'Reste à payer:', f"{float(invoice.total_amount) - float(invoice.amount_paid):.0f} MAD"],
    ]
    totals_table = Table(totals_data, colWidths=[3.5*inch, 0.75*inch, 1*inch, 1*inch])
    totals_table.setStyle(TableStyle([
        ('FONTNAME', (2, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
        ('LINEABOVE', (2, -1), (-1, -1), 1, colors.black),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(totals_table)

    # Notes
    if invoice.notes:
        elements.append(Spacer(1, 30))
        elements.append(Paragraph("Notes:", heading_style))
        elements.append(Paragraph(invoice.notes, normal_style))

    # Footer
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("Soufian BOUHRARA - Auto-Entrepreneur", normal_style))
    elements.append(Paragraph("ICE: 003747242000025", normal_style))
    elements.append(Paragraph("Banque: Al Barid Bank", normal_style))
    elements.append(Paragraph("RIB: 350810000000001304811290", normal_style))

    # Build PDF
    doc.build(elements)

    buffer.seek(0)
    return buffer.getvalue()


def generate_invoice_pdf(invoice):
    """
    Generate a PDF invoice. Uses WeasyPrint if available, otherwise ReportLab.
    """
    if WEASYPRINT_AVAILABLE:
        return generate_invoice_pdf_weasyprint(invoice)
    else:
        return generate_invoice_pdf_reportlab(invoice)
