"""
PDF Report Generator for Legal Metrology Inspection Audits
Generates formal inspection sheets with statutory citations and pass/fail summary.
"""

import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

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
    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontSize=16, textColor=colors.HexColor("#0f2744"), spaceAfter=4, alignment=1)
    subtitle_style = ParagraphStyle('DocSub', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor("#4a5568"), alignment=1)
    section_style = ParagraphStyle('SecHead', parent=styles['Heading2'], fontSize=12, textColor=colors.HexColor("#0f2744"), spaceBefore=10, spaceAfter=6)
    body_style = ParagraphStyle('BodyText', parent=styles['Normal'], fontSize=9, leading=12)
    bold_style = ParagraphStyle('BoldText', parent=styles['Normal'], fontSize=9, leading=12, fontName="Helvetica-Bold")
    
    story = []
    
    # 1. Header
    story.append(Paragraph("GOVERNMENT OF INDIA", subtitle_style))
    story.append(Paragraph("MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION", subtitle_style))
    story.append(Paragraph("Department of Consumer Affairs — Legal Metrology Division", subtitle_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011", title_style))
    story.append(Paragraph("Statutory Package Compliance & Inspection Audit Report", ParagraphStyle('ReportSub', parent=styles['Normal'], fontSize=11, fontName="Helvetica-Bold", textColor=colors.HexColor("#1e3a8a"), alignment=1)))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1e3a8a"), spaceAfter=10))
    
    # 2. Metadata Table
    verdict = scan_data.get("verdict", "UNKNOWN")
    score = scan_data.get("compliance_score", 0.0)
    verdict_color = colors.HexColor("#15803d") if "COMPLIANT" in verdict and "NON" not in verdict else colors.HexColor("#b91c1c")
    
    meta_data = [
        [
            Paragraph("<b>Inspection Date:</b> " + datetime.now().strftime("%d-%b-%Y %H:%M:%S"), body_style),
            Paragraph("<b>Inspection ID:</b> LM-DOCA-" + datetime.now().strftime("%Y%m%d%H%M"), body_style)
        ],
        [
            Paragraph("<b>Product Category:</b> " + scan_data.get("category", "Packaged Commodity"), body_style),
            Paragraph(f"<b>Overall Score:</b> {score}%", body_style)
        ],
        [
            Paragraph("<b>Inspection Verdict:</b> " + f"<font color='{verdict_color.hexval()}'><b>{verdict}</b></font>", body_style),
            Paragraph(f"<b>Rules Passed:</b> {scan_data.get('pass_count', 0)} / {scan_data.get('total_rules', 7)}", body_style)
        ]
    ]
    
    meta_table = Table(meta_data, colWidths=[270, 270])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))
    
    # 3. Rule Breakdown Table
    story.append(Paragraph("Statutory Rule Compliance Breakdown (Rules 6 & 9)", section_style))
    
    table_headers = [
        Paragraph("<b>Rule & Citation</b>", bold_style),
        Paragraph("<b>Mandatory Field</b>", bold_style),
        Paragraph("<b>Status</b>", bold_style),
        Paragraph("<b>Extracted Value / Findings</b>", bold_style),
    ]
    
    table_rows = [table_headers]
    for r in scan_data.get("rules", []):
        is_pass = r.get("status") == "PASS"
        st_color = colors.HexColor("#16a34a") if is_pass else colors.HexColor("#dc2626")
        status_cell = Paragraph(f"<font color='{st_color.hexval()}'><b>{r.get('status')}</b></font>", bold_style)
        
        rule_desc = f"<b>{r.get('rule_id')}</b><br/><font size=7.5 color='#64748b'>{r.get('statutory_ref', '')}</font>"
        field_desc = f"<b>{r.get('title', '')}</b>"
        finding_desc = f"{r.get('reason', '')}"
        if r.get("extracted_value"):
            finding_desc += f"<br/><font color='#0284c7'><i>Extracted: {str(r.get('extracted_value'))[:80]}</i></font>"
            
        table_rows.append([
            Paragraph(rule_desc, body_style),
            Paragraph(field_desc, body_style),
            status_cell,
            Paragraph(finding_desc, body_style),
        ])
        
    rules_table = Table(table_rows, colWidths=[75, 145, 60, 260])
    rules_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#94a3b8")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(rules_table)
    story.append(Spacer(1, 14))
    
    # 4. Legal Metrology Statutory Authority Sign-off
    story.append(Paragraph("<b>Statutory Reference Notice:</b> This audit report is generated in accordance with the standards prescribed under the Legal Metrology Act, 2009 and the Legal Metrology (Packaged Commodities) Rules, 2011, Ministry of Consumer Affairs, Government of India.", ParagraphStyle('Notice', parent=styles['Italic'], fontSize=8, textColor=colors.HexColor("#475569"))))
    story.append(Spacer(1, 10))
    
    sign_data = [
        [
            Paragraph("<b>Inspecting Authority:</b> Automated AI / DoCA Inspection Subsystem", body_style),
            Paragraph("<b>Verification Officer:</b> ___________________________", body_style)
        ]
    ]
    sign_table = Table(sign_data, colWidths=[270, 270])
    sign_table.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(sign_table)
    
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()