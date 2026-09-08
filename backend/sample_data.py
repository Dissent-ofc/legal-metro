"""
Preloaded sample dataset of real packaged commodities with Ground Truth annotations
for testing Legal Metrology compliance checks.
"""

SAMPLES = [
    {
        "id": "sample_1_parle_biscuit",
        "name": "Parle-G Gluco Biscuits (250g)",
        "category": "Packaged Food / Biscuits",
        "description": "Standard retail packaged biscuit wrapper with fully compliant Legal Metrology Rule 6 & 9 declarations.",
        "image_filename": "sample_biscuit_compliant.png",
        "expected_verdict": "COMPLIANT",
        "ocr_blocks": [
            {"text": "Manufactured by: Parle Products Pvt Ltd, V.S. Khandekar Marg, Vile Parle East, Mumbai - 400057, Maharashtra", "bbox": [35, 45, 620, 30], "confidence": 0.98},
            {"text": "Generic Name: Glucose Biscuits", "bbox": [35, 95, 340, 26], "confidence": 0.99},
            {"text": "Net Quantity: 250 g", "bbox": [35, 140, 210, 28], "confidence": 0.97},
            {"text": "MRP: Rs. 25.00 (inclusive of all taxes)", "bbox": [35, 190, 480, 38], "confidence": 0.99},
            {"text": "Mfg Date: 02/2026 | Best Before 6 Months", "bbox": [35, 245, 420, 26], "confidence": 0.96},
            {"text": "Consumer Care: Contact Consumer Care Cell at 1800-22-7799 or email cs@parle.biz, Mumbai 400057", "bbox": [35, 290, 640, 32], "confidence": 0.97}
        ]
    },
    {
        "id": "sample_2_dove_shampoo",
        "name": "Dove Daily Shine Shampoo (180ml)",
        "category": "Cosmetics / Personal Care",
        "description": "Compliant personal care bottle label containing all statutory declarations under Rule 6(1).",
        "image_filename": "sample_shampoo_compliant.png",
        "expected_verdict": "COMPLIANT",
        "ocr_blocks": [
            {"text": "Mfd. by: Hindustan Unilever Limited, B-9, Industrial Area, Haridwar, Uttarakhand - 249403", "bbox": [40, 50, 610, 32], "confidence": 0.97},
            {"text": "Common Name: Hair Cleanser / Shampoo", "bbox": [40, 100, 390, 26], "confidence": 0.98},
            {"text": "Net Content: 180 ml", "bbox": [40, 145, 220, 28], "confidence": 0.96},
            {"text": "MRP: ₹ 165.00 (incl. of all taxes)", "bbox": [40, 190, 430, 40], "confidence": 0.99},
            {"text": "Pkd. Date: 01/2026 | Use Before 24 Months", "bbox": [40, 250, 440, 26], "confidence": 0.95},
            {"text": "Consumer Care: Call 1800-10-22-221 or write to lever.care@unilever.com, PO Box 14760, Mumbai", "bbox": [40, 295, 630, 32], "confidence": 0.98}
        ]
    },
    {
        "id": "sample_3_kurkure_violation_mrp",
        "name": "Crunchy Masala Munch Snack (90g)",
        "category": "Extruded Snacks",
        "description": "NON-COMPLIANT: MRP lacks mandatory 'inclusive of all taxes' phrase and currency indicator; MRP text font size is compressed.",
        "image_filename": "sample_chips_noncompliant_mrp.png",
        "expected_verdict": "NON-COMPLIANT (MINOR VIOLATIONS)",
        "ocr_blocks": [
            {"text": "Manufactured by: PepsiCo India Holdings Pvt Ltd, Village Channo, Patiala - 147001, Punjab", "bbox": [35, 45, 610, 32], "confidence": 0.97},
            {"text": "Generic Name: Ready to Eat Extruded Snack", "bbox": [35, 95, 420, 26], "confidence": 0.98},
            {"text": "Net Quantity: 90 g", "bbox": [35, 140, 200, 28], "confidence": 0.96},
            {"text": "MRP: 20", "bbox": [35, 190, 120, 18], "confidence": 0.94},  # Tiny font + missing currency & tax
            {"text": "Date of Pkg: 04/2026", "bbox": [35, 235, 240, 26], "confidence": 0.95},
            {"text": "Consumer Feedback: Helpline 1800-22-4020, email feedback@pepsico.com", "bbox": [35, 280, 580, 28], "confidence": 0.96}
        ]
    },
    {
        "id": "sample_4_edible_oil_critical",
        "name": "Pure Gold Refined Sunflower Oil",
        "category": "Edible Oils",
        "description": "NON-COMPLIANT (CRITICAL): Missing consumer care contact mechanism (no phone/email) and missing metric unit in net quantity.",
        "image_filename": "sample_oil_noncompliant_consumercare.png",
        "expected_verdict": "NON-COMPLIANT (CRITICAL VIOLATIONS)",
        "ocr_blocks": [
            {"text": "Manufactured by: Adani Wilmar Ltd, Fortune House, Near Navrangpura Railway Crossing, Ahmedabad - 380009", "bbox": [35, 45, 630, 32], "confidence": 0.97},
            {"text": "Common Name: Refined Sunflower Edible Oil", "bbox": [35, 95, 430, 26], "confidence": 0.98},
            {"text": "Net Quantity: 1000", "bbox": [35, 140, 200, 28], "confidence": 0.92}, # Missing unit (e.g. ml / l / g)
            {"text": "MRP: Rs. 145.00 (inclusive of all taxes)", "bbox": [35, 190, 460, 36], "confidence": 0.99},
            {"text": "Packed on: 03/2026", "bbox": [35, 245, 220, 26], "confidence": 0.95},
            {"text": "Customer Care: Write to Manager at Corporate Office", "bbox": [35, 290, 520, 28], "confidence": 0.88} # No phone/email
        ]
    }
]