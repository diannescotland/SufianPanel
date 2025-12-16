"""
PDF Invoice Generator - Uses PDF template with text overlay

This generator creates invoices by:
1. Creating a text overlay with ReportLab
2. Merging the overlay onto a PDF template using pypdf

Template: static/templates/invoice_template.pdf (A4 size, exported from Canva)
"""

import os
from io import BytesIO
from django.conf import settings

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from . import pdf_coordinates as coords

try:
    from pypdf import PdfReader, PdfWriter
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False
    print("Warning: pypdf not installed. Run: pip install pypdf")


def register_fonts():
    """Register custom Quicksand fonts if available."""
    fonts_registered = {}
    try:
        font_dir = os.path.join(settings.BASE_DIR, 'static', 'fonts')

        font_files = {
            'Quicksand': 'Quicksand-Regular.ttf',
            'Quicksand-Bold': 'Quicksand-Bold.ttf',
            'Quicksand-Medium': 'Quicksand-Medium.ttf',
            'Quicksand-Light': 'Quicksand-Light.ttf',
        }

        for font_name, font_file in font_files.items():
            font_path = os.path.join(font_dir, font_file)
            if os.path.exists(font_path):
                pdfmetrics.registerFont(TTFont(font_name, font_path))
                fonts_registered[font_name] = True
    except Exception as e:
        print(f"Font registration error: {e}")

    return fonts_registered


FONTS = register_fonts()
BODY_FONT = 'Quicksand' if 'Quicksand' in FONTS else 'Helvetica'
BOLD_FONT = 'Quicksand-Bold' if 'Quicksand-Bold' in FONTS else 'Helvetica-Bold'


def create_text_overlay(invoice):
    """
    Create a transparent PDF with just the invoice text.
    Returns PDF bytes that can be merged onto the template.
    """
    buffer = BytesIO()
    # Use same page size as template (596 x 842 points)
    c = canvas.Canvas(buffer, pagesize=(coords.PAGE_WIDTH, coords.PAGE_HEIGHT))

    # Set text color
    text_color = colors.HexColor(coords.TEXT_COLOR)
    c.setFillColor(text_color)

    client = invoice.client

    # ==========================================================================
    # CLIENT INFO
    # ==========================================================================
    c.setFont(BODY_FONT, coords.FONT_SIZE_NORMAL)

    # Client name (company or personal name)
    client_name = client.company or client.name
    c.drawString(coords.CLIENT_NAME_X, coords.CLIENT_NAME_Y, client_name)

    # Client address
    address_parts = []
    if hasattr(client, 'address_line1') and client.address_line1:
        address_parts.append(client.address_line1)
    if hasattr(client, 'address_line2') and client.address_line2:
        address_parts.append(client.address_line2)
    if hasattr(client, 'city') and client.city:
        address_parts.append(client.city)

    if address_parts:
        full_address = ", ".join(address_parts)
        c.drawString(coords.CLIENT_ADDRESS_X, coords.CLIENT_ADDRESS_Y, full_address)

    # ==========================================================================
    # INVOICE METADATA
    # ==========================================================================
    c.setFont(BODY_FONT, coords.FONT_SIZE_NORMAL)

    # Invoice number
    c.drawString(coords.INVOICE_NUMBER_X, coords.INVOICE_NUMBER_Y, invoice.invoice_number)

    # Date
    c.drawString(coords.DATE_X, coords.DATE_Y, invoice.issued_date.strftime("%d-%m-%Y"))

    # ==========================================================================
    # LINE ITEMS
    # ==========================================================================
    items = list(invoice.items.all())[:4]  # Max 4 items

    for idx, item in enumerate(items):
        if idx >= len(coords.ITEM_ROWS_Y):
            break

        row_y = coords.ITEM_ROWS_Y[idx]

        # Item title (left-aligned)
        c.setFont(BODY_FONT, coords.FONT_SIZE_ITEM)
        title = getattr(item, 'title', None) or item.description
        c.drawString(coords.ITEM_DESC_X, row_y, title[:50])

        # Quantity (center-aligned)
        qty_text = str(item.quantity)
        qty_width = c.stringWidth(qty_text, BODY_FONT, coords.FONT_SIZE_ITEM)
        c.drawString(coords.ITEM_QTY_X - qty_width / 2, row_y, qty_text)

        # Total (right-aligned, bold)
        c.setFont(BOLD_FONT, coords.FONT_SIZE_ITEM)
        total_text = f"{item.total_price:.0f}"
        total_width = c.stringWidth(total_text, BOLD_FONT, coords.FONT_SIZE_ITEM)
        c.drawString(coords.ITEM_TOTAL_X - total_width, row_y, total_text)

        # TVA per row (right-aligned)
        c.setFont(BODY_FONT, coords.FONT_SIZE_ITEM)
        tva_row_text = f"{int(invoice.tva_rate)}%"
        tva_row_width = c.stringWidth(tva_row_text, BODY_FONT, coords.FONT_SIZE_ITEM)
        c.drawString(coords.TVA_COLUMN_X - tva_row_width, row_y, tva_row_text)

    # ==========================================================================
    # TOTAL AMOUNT
    # ==========================================================================
    c.setFont(BOLD_FONT, coords.FONT_SIZE_TOTAL)

    # Format: "7 500 dhs" with space thousands separator
    total_formatted = f"{int(invoice.total_amount):,} dhs".replace(',', ' ')
    total_width = c.stringWidth(total_formatted, BOLD_FONT, coords.FONT_SIZE_TOTAL)

    c.drawString(coords.TOTAL_AMOUNT_X - total_width, coords.TOTAL_AMOUNT_Y, total_formatted)

    # Finalize
    c.save()
    buffer.seek(0)
    return buffer.getvalue()


def generate_invoice_pdf(invoice):
    """
    Generate a PDF invoice by merging text onto the PDF template.

    Args:
        invoice: Invoice model instance

    Returns:
        bytes: PDF file content
    """
    # Create the text overlay
    overlay_bytes = create_text_overlay(invoice)

    # Path to PDF template
    template_path = os.path.join(settings.BASE_DIR, 'static', 'templates', 'invoice_template.pdf')

    # If pypdf is available and template exists, merge them
    if PYPDF_AVAILABLE and os.path.exists(template_path):
        try:
            # Load template
            template_pdf = PdfReader(template_path)
            template_page = template_pdf.pages[0]

            # Load overlay
            overlay_pdf = PdfReader(BytesIO(overlay_bytes))
            overlay_page = overlay_pdf.pages[0]

            # Merge overlay onto template
            template_page.merge_page(overlay_page)

            # Write to buffer
            writer = PdfWriter()
            writer.add_page(template_page)

            result_buffer = BytesIO()
            writer.write(result_buffer)
            result_buffer.seek(0)

            return result_buffer.getvalue()

        except Exception as e:
            print(f"PDF merge error: {e}")
            # Fall back to overlay-only

    # Fallback: return just the text overlay (no template background)
    # This can happen if template is missing or pypdf is not installed
    if not os.path.exists(template_path):
        print(f"Warning: PDF template not found at {template_path}")
        print("Please export your Canva template as PDF and save it there.")

    return overlay_bytes
