"""
PDF Report Generator for Legal Metrology Inspection Audits
Generates standard Adobe-compliant statutory inspection reports.
Uses standard ASCII/Latin-1 safe characters and safe XML escaping to ensure 100% compatibility across Adobe Acrobat, Edge, Chrome, Preview, and Foxit.
"""

import io
import html
import re
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def sanitize_pdf_string(val: any) -> str:
    """Safely sanitizes and escapes text for standard ReportLab XML PDF output."""
    if val is None:
        return ""
    text_str = str(val)
    # Replace Indian Rupee symbol with Rs. for standard Helvetica Type-1 font compatibility
    text_str = text_str.replace("₹", "Rs. ")
    text_str = text_str.replace("–", "-").replace("—", "-")
    text_str = text_str.replace("“", '"').replace("”", '"').replace("’", "'").replace("‘", "'")
    # Clean non-ascii characters if any
    text_str = re.sub(r'[^\x00-\x7F]+', ' ', text_str)
    # Escape HTML/XML entities (&, <, >, ", ')
    return html.escape(text_str)


def generate_pdf_report(scan_data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontSize=14, textColor=colors.HexColor("#0f2744"), spaceAfter=3, alignment=1)
    subtitle_style = ParagraphStyle('DocSub', parent=styles['Normal'], fontSize=8.5, textColor=colors.HexColor("#475569"), alignment=1, leading=11)
    section_style = ParagraphStyle('SecHead', parent=styles['Heading2'], fontSize=10.5, textColor=colors.HexColor("#0f2744"), spaceBefore=6, spaceAfter=4)
    body_style = ParagraphStyle('BodyText', parent=styles['Normal'], fontSize=8, leading=10.5)
    bold_style = ParagraphStyle('BoldText', parent=styles['Normal'], fontSize=8, leading=10.5, fontName="Helvetica-Bold")
    
    story = []
    
    # 1. Official Header
    story.append(Paragraph("GOVERNMENT OF INDIA", subtitle_style))
    story.append(Paragraph("MINISTRY OF CONSUMER AFFAIRS, FOOD &amp; PUBLIC DISTRIBUTION", subtitle_style))
    story.append(Paragraph("Department of Consumer Affairs - Legal Metrology Division", subtitle_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph("LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011", title_style))
    story.append(Paragraph("Statutory Package Compliance &amp; Verification Inspection Report", ParagraphStyle('ReportSub', parent=styles['Normal'], fontSize=9.5, fontName="Helvetica-Bold", textColor=colors.HexColor("#1e3a8a"), alignment=1)))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1e3a8a"), spaceAfter=6))
    
    # 2. Metadata Table
    verdict = scan_data.get("verdict", "NON-COMPLIANT")
    score = scan_data.get("compliance_score", 0.0)
    is_fully_compliant = "COMPLIANT" in verdict and "NON" not in verdict
    verdict_hex = "#16a34a" if is_fully_compliant else "#dc2626"
    
    prod_name_safe = sanitize_pdf_string(scan_data.get("product_name", "Packaged Commodity"))
    category_safe = sanitize_pdf_string(scan_data.get("category", "Packaged Commodity"))
    verdict_safe = sanitize_pdf_string(verdict)
    
    meta_data = [
        [
            Paragraph("<b>Inspection Date:</b> " + datetime.now().strftime("%d-%b-%Y %H:%M:%S"), body_style),
            Paragraph("<b>Inspection ID:</b> LM-DOCA-" + datetime.now().strftime("%Y%m%d%H%M"), body_style)
        ],
        [
            Paragraph(f"<b>Commodity:</b> {prod_name_safe} ({category_safe})", body_style),
            Paragraph(f"<b>Compliance Score:</b> <b>{score}%</b>", body_style)
        ],
        [
            Paragraph(f"<b>Inspection Verdict:</b> <font color='{verdict_hex}'><b>{verdict_safe}</b></font>", body_style),
            Paragraph(f"<b>Statutory Rules Passed:</b> {scan_data.get('pass_count', 0)} / {scan_data.get('total_rules', 7)}", body_style)
        ]
    ]
    
    meta_table = Table(meta_data, colWidths=[270, 270])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8))
    
    # 3. Rule Breakdown Table
    story.append(Paragraph("Statutory Rule Compliance Breakdown (Rules 6 &amp; 9)", section_style))
    
    table_headers = [
        Paragraph("<b>Rule &amp; Citation</b>", bold_style),
        Paragraph("<b>Mandatory Field</b>", bold_style),
        Paragraph("<b>Status</b>", bold_style),
        Paragraph("<b>Extracted Value &amp; Inspection Findings</b>", bold_style),
    ]
    
    table_rows = [table_headers]
    for r in scan_data.get("rules", []):
        is_pass = r.get("status") == "PASS"
        st_color_hex = "#16a34a" if is_pass else "#dc2626"
        status_safe = sanitize_pdf_string(r.get("status", "FAIL"))
        status_cell = Paragraph(f"<font color='{st_color_hex}'><b>{status_safe}</b></font>", bold_style)
        
        rule_id_safe = sanitize_pdf_string(r.get("rule_id", ""))
        stat_ref_safe = sanitize_pdf_string(r.get("statutory_ref", ""))
        rule_desc = f"<b>{rule_id_safe}</b><br/><font size=6.5 color='#64748b'>{stat_ref_safe}</font>"
        
        title_safe = sanitize_pdf_string(r.get("title", ""))
        field_desc = f"<b>{title_safe}</b>"
        
        reason_safe = sanitize_pdf_string(r.get("reason", ""))
        finding_desc = f"{reason_safe}"
        if r.get("extracted_value"):
            extracted_safe = sanitize_pdf_string(str(r.get("extracted_value"))[:90])
            finding_desc += f"<br/><font color='#0284c7'><i>Extracted: {extracted_safe}</i></font>"
            
        table_rows.append([
            Paragraph(rule_desc, body_style),
            Paragraph(field_desc, body_style),
            status_cell,
            Paragraph(finding_desc, body_style),
        ])
        
    rules_table = Table(table_rows, colWidths=[65, 135, 55, 285])
    rules_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#94a3b8")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(rules_table)
    story.append(Spacer(1, 8))
    
    # 4. Legal Metrology Statutory Authority Sign-off
    story.append(Paragraph("<b>Statutory Notice:</b> This digital compliance audit is generated pursuant to the Legal Metrology Act, 2009 and Legal Metrology (Packaged Commodities) Rules, 2011, Ministry of Consumer Affairs, Government of India.", ParagraphStyle('Notice', parent=styles['Italic'], fontSize=7, textColor=colors.HexColor("#475569"))))
    story.append(Spacer(1, 6))
    
    sign_data = [
        [
            Paragraph("<b>Inspecting Subsystem:</b> Automated AI / DoCA Inspection Subsystem", body_style),
            Paragraph("<b>Verification Officer:</b> ___________________________", body_style)
        ]
    ]
    sign_table = Table(sign_data, colWidths=[270, 270])
    sign_table.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(sign_table)
    
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()