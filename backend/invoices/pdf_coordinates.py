"""
PDF Invoice Coordinates - All positions in ReportLab points
Origin: bottom-left corner of page
Page size: 1190 x 1684 points (large Canva template)

Coordinates based on user-edited test_invoice.pdf (December 2025)
"""

# Page dimensions in points (large template)
PAGE_WIDTH = 1190.0
PAGE_HEIGHT = 1684.0

# Text color (dark brown)
TEXT_COLOR = '#423e3a'

# Font sizes in points (scaled up for large template)
FONT_SIZE_LABEL = 26
FONT_SIZE_NORMAL = 22
FONT_SIZE_ITEM = 22
FONT_SIZE_TOTAL = 28

# =============================================================================
# CLIENT INFO SECTION (left side, below "Facture à :" label)
# =============================================================================
CLIENT_NAME_X = 119.0
CLIENT_NAME_Y = 1305.0     # Below "Facture à:" label

CLIENT_ADDRESS_X = 119.0
CLIENT_ADDRESS_Y = 1272.0  # Below client name

# =============================================================================
# INVOICE METADATA (right side)
# =============================================================================
# Invoice number - after "Facture n° :" label
INVOICE_NUMBER_X = 780.0
INVOICE_NUMBER_Y = 1285.0

# Date - after "Date du :" label (aligned with invoice number)
DATE_X = 780.0
DATE_Y = 1254.0  # aligned with "Date du:" label

# =============================================================================
# LINE ITEMS TABLE
# =============================================================================
# Column X positions
ITEM_DESC_X = 102.0        # Description (left-aligned)
ITEM_QTY_X = 480.0         # Quantity (center-aligned)
ITEM_TOTAL_X = 1000.0       # Total (right-aligned)

# Row Y positions (4 rows maximum)
ITEM_ROW_Y_START = 1020.0  # First item row
ITEM_ROW_SPACING = 95.0    # Space between rows

# Calculate individual row Y positions
ITEM_ROWS_Y = [
    ITEM_ROW_Y_START,                          # Row 1
    ITEM_ROW_Y_START - ITEM_ROW_SPACING,       # Row 2
    ITEM_ROW_Y_START - (ITEM_ROW_SPACING * 2), # Row 3
    ITEM_ROW_Y_START - (ITEM_ROW_SPACING * 3), # Row 4
]

# =============================================================================
# TVA COLUMN IN LINE ITEMS TABLE
# =============================================================================
# TVA value per row (same Y as each item row)
TVA_COLUMN_X = 715.0       # Right edge for TVA values in table

# =============================================================================
# TOTAL SECTION (inside tan/beige box)
# =============================================================================
# Total amount - right edge X position (text will be right-aligned from this point)
TOTAL_AMOUNT_X = 970.0
TOTAL_AMOUNT_Y = 545.0     # Inside "Total à payer:" box
