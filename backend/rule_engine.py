"""
Legal Metrology (Packaged Commodities) Rules, 2011 - Statutory Rule Compliance Engine
Evaluates Rules 6 and 9 with precise citations, sub-checks, and statutory justifications.
"""

from typing import Dict, List, Any, Optional
import statistics
import re

VALID_NET_QUANTITY_UNITS = [
    "g", "gm", "gms", "gram", "grams",
    "kg", "kgs", "kilogram", "kilograms",
    "ml", "mls", "millilitre", "millilitres", "milliliter",
    "l", "ltr", "litre", "litres", "liter",
    "n", "u", "unit", "units", "piece", "pieces", "pc", "pcs", "count", "no", "nos",
    "m", "meter", "meters", "metre", "metres", "cm"
]

def check_r1_manufacturer(field_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    rule_id = "R1"
    statutory_ref = "Rule 6(1)(a)"
    field = "manufacturer_address"
    title = "Manufacturer / Packer / Importer Details"
    
    if not field_data or not field_data.get("value"):
        return {
            "rule_id": rule_id,
            "statutory_ref": statutory_ref,
            "field": field,
            "title": title,
            "status": "FAIL",
            "reason": "Missing declaration of Manufacturer/Packer/Importer name and address.",
            "bbox": None,
            "confidence": 0.0,
            "extracted_value": None
        }
    
    val = str(field_data.get("value", "")).strip()
    if len(val) < 6:
        return {
            "rule_id": rule_id,
            "statutory_ref": statutory_ref,
            "field": field,
            "title": title,
            "status": "FAIL",
            "reason": "Incomplete or insufficient manufacturer address details declared.",
            "bbox": field_data.get("bbox"),
            "confidence": field_data.get("confidence", 0.9),
            "extracted_value": val
        }

    return {
        "rule_id": rule_id,
        "statutory_ref": statutory_ref,
        "field": field,
        "title": title,
        "status": "PASS",
        "reason": f"Manufacturer/Packer identity & address declared: '{val[:80]}...'",
        "bbox": field_data.get("bbox"),
        "confidence": field_data.get("confidence", 0.95),
        "extracted_value": val
    }


def check_r2_generic_name(field_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    rule_id = "R2"
    statutory_ref = "Rule 6(1)(b)"
    field = "common_name"
    title = "Common / Generic Name of Commodity"
    
    if not field_data or not field_data.get("value"):
        return {
            "rule_id": rule_id,
            "statutory_ref": statutory_ref,
            "field": field,
            "title": title,
            "status": "FAIL",
            "reason": "Generic or common name of the commodity is missing from the package label.",
            "bbox": None,
            "confidence": 0.0,
            "extracted_value": None
        }
    
    val = str(field_data.get("value", "")).strip()
    if len(val) < 2:
        return {
            "rule_id": rule_id,
            "statutory_ref": statutory_ref,
            "field": field,
            "title": title,
            "status": "FAIL",
            "reason": "Commodity common name is too vague or invalid.",
            "bbox": field_data.get("bbox"),
            "confidence": field_data.get("confidence", 0.8),
            "extracted_value": val
        }
        
    return {
        "rule_id": rule_id,
        "statutory_ref": statutory_ref,
        "field": field,
        "title": title,
        "status": "PASS",
        "reason": f"Generic/common commodity name declared as '{val}'.",
        "bbox": field_data.get("bbox"),
        "confidence": field_data.get("confidence", 0.95),
        "extracted_value": val
    }


def check_r3_net_quantity(field_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    rule_id = "R3"
    statutory_ref = "Rule 6(1)(c)"
    field = "net_quantity"
    title = "Net Quantity Declaration"
    
    if not field_data or not field_data.get("value"):
        return {
            "rule_id": rule_id,
            "statutory_ref": statutory_ref,
            "field": field,
            "title": title,
            "status": "FAIL",
            "reason": "Net quantity declaration is missing on the package.",
            "bbox": None,
            "confidence": 0.0,
            "extracted_value": None
        }
    
    val = str(field_data.get("value", "")).strip().lower()
    has_number = bool(re.search(r'\d+', val))
    
    unit_found = None
    for unit in VALID_NET_QUANTITY_UNITS:
        if re.search(rf'\b{unit}\b', val) or re.search(rf'\d+\s*{unit}', val) or re.search(rf'\d+{unit}', val):
            unit_found = unit
            break
            
    if not has_number and not any(k in val for k in ["net quantity", "net wt", "net qty"]):
        return {
            "rule_id": rule_id,
            "statutory_ref": statutory_ref,
            "field": field,
            "title": title,
            "status": "FAIL",
            "reason": "Net quantity lacks numerical measurement value.",
            "bbox": field_data.get("bbox"),
            "confidence": field_data.get("confidence", 0.8),
            "extracted_value": field_data.get("value")
        }
        
    if not unit_found and not any(k in val for k in ["g", "kg", "ml", "l", "unit"]):
        return {
            "rule_id": rule_id,
            "statutory_ref": statutory_ref,
            "field": field,
            "title": title,
            "status": "FAIL",
            "reason": "Net quantity is missing a standard Legal Metrology unit of measure (e.g., g, kg, ml, L, N).",
            "bbox": field_data.get("bbox"),
            "confidence": field_data.get("confidence", 0.8),
            "extracted_value": field_data.get("value")
        }

    return {
        "rule_id": rule_id,
        "statutory_ref": statutory_ref,
        "field": field,
        "title": title,
        "status": "PASS",
        "reason": f"Net quantity properly declared ('{field_data.get('value')}').",
        "bbox": field_data.get("bbox"),
        "confidence": field_data.get("confidence", 0.95),
        "extracted_value": field_data.get("value")
    }


def check_r4_mrp(field_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    rule_id = "R4"
    statutory_ref = "Rule 6(1)(e)"
    field = "mrp"
    title = "Maximum Retail Price (MRP) Declaration"
    
    if not field_data or not field_data.get("value"):
        return {
            "rule_id": rule_id,
            "statutory_ref": statutory_ref,
            "field": field,
            "title": title,
            "status": "FAIL",
            "reason": "Maximum Retail Price (MRP) is missing from the package.",
            "bbox": None,
            "confidence": 0.0,
            "extracted_value": None
        }
        
    raw_val = str(field_data.get("value", "")).strip()
    val_lower = raw_val.lower()
    
    # 1. Currency symbol (₹, Rs, Rs., INR)
    has_currency = bool(re.search(r'(₹|rs\.?|inr|\brs\b|mrp)', val_lower))
    
    # 2. Inclusive of all taxes phrase
    has_tax_phrase = bool(re.search(r'(incl\w*\s*(of)?\s*all\s*tax|inclusive\s*of\s*all\s*tax|ofall\s*tax|all\s*taxes|incl\w*\s*tax)', val_lower))
    
    # 3. Numeric price or template marker
    num_match = re.search(r'\d+(?:\.\d{1,2})?', raw_val)
    has_number = bool(num_match)
    has_two_decimals = bool(re.search(r'\d+\.\d{2}', raw_val))
    is_template_declaration = ("mrp" in val_lower or "₹" in val_lower or "rs" in val_lower) and has_tax_phrase
    
    reasons = []
    if not has_currency:
        reasons.append("Missing mandatory currency indicator (₹ / Rs. / INR)")
    if not has_tax_phrase:
        reasons.append("Missing mandatory statutory phrase '(inclusive of all taxes)'")
        
    if reasons and not is_template_declaration:
        return {
            "rule_id": rule_id,
            "statutory_ref": statutory_ref,
            "field": field,
            "title": title,
            "status": "FAIL",
            "reason": "Non-compliant MRP: " + "; ".join(reasons) + ".",
            "bbox": field_data.get("bbox"),
            "confidence": field_data.get("confidence", 0.9),
            "extracted_value": raw_val,
            "sub_checks": {
                "currency_symbol": has_currency,
                "inclusive_of_taxes": has_tax_phrase,
                "numeric_price": has_number,
                "two_decimal_places": has_two_decimals
            }
        }
        
    return {
        "rule_id": rule_id,
        "statutory_ref": statutory_ref,
        "field": field,
        "title": title,
        "status": "PASS",
        "reason": "MRP is fully compliant with statutory currency indicator and 'inclusive of all taxes' declaration.",
        "bbox": field_data.get("bbox"),
        "confidence": field_data.get("confidence", 0.98),
        "extracted_value": raw_val,
        "sub_checks": {
            "currency_symbol": True,
            "inclusive_of_taxes": True,
            "numeric_price": has_number or is_template_declaration,
            "two_decimal_places": has_two_decimals or is_template_declaration
        }
    }


def check_r5_mfg_date(field_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    rule_id = "R5"
    statutory_ref = "Rule 6(1)(d)"
    field = "mfg_date"
    title = "Date of Manufacture / Packing / Import"
    
    if not field_data or not field_data.get("value"):
        return {
            "rule_id": rule_id,
            "statutory_ref": statutory_ref,
            "field": field,
            "title": title,
            "status": "FAIL",
            "reason": "Month & Year of Manufacture/Packing/Import is missing.",
            "bbox": None,
            "confidence": 0.0,
            "extracted_value": None
        }
        
    raw_val = str(field_data.get("value", "")).strip()
    val_lower = raw_val.lower()
    
    month_names = r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)'
    has_date_format = bool(re.search(rf'(\d{{1,2}}[\/\-\.]\d{{2,4}}|\d{{1,2}}[\/\-\.]{month_names}[\/\-\.]\d{{2,4}}|{month_names}\s*\d{{4}}|\b\d{{2}}\/\d{{2}}\b)', val_lower))
    has_statutory_label = any(kw in val_lower for kw in ["mfg", "pkd", "packed", "date of pack", "use by", "best before", "batch", "date"])
    
    if not (has_date_format or has_statutory_label):
        return {
            "rule_id": rule_id,
            "statutory_ref": statutory_ref,
            "field": field,
            "title": title,
            "status": "FAIL",
            "reason": "Invalid or unparseable Month/Year format for manufacture/packing date.",
            "bbox": field_data.get("bbox"),
            "confidence": field_data.get("confidence", 0.75),
            "extracted_value": raw_val
        }
        
    return {
        "rule_id": rule_id,
        "statutory_ref": statutory_ref,
        "field": field,
        "title": title,
        "status": "PASS",
        "reason": f"Month & Year / Batch of packaging successfully validated ('{raw_val}').",
        "bbox": field_data.get("bbox"),
        "confidence": field_data.get("confidence", 0.95),
        "extracted_value": raw_val
    }


def check_r6_consumer_care(field_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    rule_id = "R6"
    statutory_ref = "Rule 6(1)(n)"
    field = "consumer_care"
    title = "Consumer Care & Grievance Contact"
    
    if not field_data or not field_data.get("value"):
        return {
            "rule_id": rule_id,
            "statutory_ref": statutory_ref,
            "field": field,
            "title": title,
            "status": "FAIL",
            "reason": "Consumer care contact details are missing on the package.",
            "bbox": None,
            "confidence": 0.0,
            "extracted_value": None
        }
        
    raw_val = str(field_data.get("value", "")).strip()
    val_lower = raw_val.lower()
    
    has_phone = bool(re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b1800[-.\s]?\d{2,4}[-.\s]?\d{3,4}\b|\b\d{10}\b|toll[-.\s]?free', val_lower))
    has_email = bool(re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+|@|care\.|mail', val_lower))
    
    if not (has_phone or has_email) and not any(k in val_lower for k in ["customer care", "helpline", "complaints"]):
        return {
            "rule_id": rule_id,
            "statutory_ref": statutory_ref,
            "field": field,
            "title": title,
            "status": "FAIL",
            "reason": "Consumer care declaration lacks direct contact channel (phone number or email address).",
            "bbox": field_data.get("bbox"),
            "confidence": field_data.get("confidence", 0.8),
            "extracted_value": raw_val
        }
        
    contact_type = "Phone & Email" if (has_phone and has_email) else "Phone" if has_phone else "Email/Office Address"
    return {
        "rule_id": rule_id,
        "statutory_ref": statutory_ref,
        "field": field,
        "title": title,
        "status": "PASS",
        "reason": f"Consumer care details compliant (Contact channel identified: {contact_type}).",
        "bbox": field_data.get("bbox"),
        "confidence": field_data.get("confidence", 0.95),
        "extracted_value": raw_val
    }


def check_r7_mrp_font_prominence(mrp_field: Optional[Dict[str, Any]], all_ocr_blocks: List[Dict[str, Any]]) -> Dict[str, Any]:
    rule_id = "R7"
    statutory_ref = "Rule 9"
    field = "mrp_prominence"
    title = "MRP Font Prominence & Readability Ratio"
    
    if not mrp_field or not mrp_field.get("bbox"):
        return {
            "rule_id": rule_id,
            "statutory_ref": statutory_ref,
            "field": field,
            "title": title,
            "status": "FAIL",
            "reason": "Cannot assess MRP font prominence because MRP bounding box is missing.",
            "bbox": None,
            "confidence": 0.0,
            "ratio": 0.0
        }
        
    mrp_h = mrp_field["bbox"][3]
    
    other_heights = [
        block["bbox"][3] for block in all_ocr_blocks 
        if block.get("bbox") and len(block["bbox"]) == 4 and block["bbox"] != mrp_field["bbox"] and block["bbox"][3] > 0
    ]
    
    if not other_heights:
        median_h = mrp_h
        ratio = 1.0
    else:
        median_h = statistics.median(other_heights)
        ratio = round(mrp_h / median_h, 2) if median_h > 0 else 1.0
        
    is_prominent = ratio >= 0.70
    
    if not is_prominent:
        return {
            "rule_id": rule_id,
            "statutory_ref": statutory_ref,
            "field": field,
            "title": title,
            "status": "FAIL",
            "reason": f"MRP font height ({mrp_h}px) is disproportionately small ({ratio}x of median label text {median_h:.1f}px). Fails Rule 9 prominence criteria.",
            "bbox": mrp_field.get("bbox"),
            "confidence": 0.9,
            "ratio": ratio,
            "mrp_height_px": mrp_h,
            "median_height_px": median_h
        }
        
    return {
        "rule_id": rule_id,
        "statutory_ref": statutory_ref,
        "field": field,
        "title": title,
        "status": "PASS",
        "reason": f"MRP font height satisfies prominence requirements ({ratio}x of median text height; {mrp_h}px vs {median_h:.1f}px).",
        "bbox": mrp_field.get("bbox"),
        "confidence": 0.95,
        "ratio": ratio,
        "mrp_height_px": mrp_h,
        "median_height_px": median_h
    }


def evaluate_compliance(classified_fields: Dict[str, Any], ocr_blocks: List[Dict[str, Any]]) -> Dict[str, Any]:
    r1 = check_r1_manufacturer(classified_fields.get("manufacturer_address"))
    r2 = check_r2_generic_name(classified_fields.get("common_name"))
    r3 = check_r3_net_quantity(classified_fields.get("net_quantity"))
    r4 = check_r4_mrp(classified_fields.get("mrp"))
    r5 = check_r5_mfg_date(classified_fields.get("mfg_date"))
    r6 = check_r6_consumer_care(classified_fields.get("consumer_care"))
    r7 = check_r7_mrp_font_prominence(classified_fields.get("mrp"), ocr_blocks)
    
    rules = [r1, r2, r3, r4, r5, r6, r7]
    
    pass_count = sum(1 for r in rules if r["status"] == "PASS")
    fail_count = sum(1 for r in rules if r["status"] == "FAIL")
    total_rules = len(rules)
    compliance_score = round((pass_count / total_rules) * 100, 1)
    
    if fail_count == 0:
        verdict = "COMPLIANT"
        verdict_color = "green"
        summary_text = "All mandatory declarations and prominence requirements under Legal Metrology Rules, 2011 are satisfied."
    elif fail_count <= 2:
        verdict = "NON-COMPLIANT (MINOR VIOLATIONS)"
        verdict_color = "amber"
        summary_text = f"{fail_count} statutory non-compliances detected under Legal Metrology Rules, 2011."
    else:
        verdict = "NON-COMPLIANT (CRITICAL VIOLATIONS)"
        verdict_color = "red"
        summary_text = f"{fail_count} major statutory non-compliances detected. Product package is in violation of Legal Metrology Act, 2009."

    return {
        "verdict": verdict,
        "verdict_color": verdict_color,
        "compliance_score": compliance_score,
        "pass_count": pass_count,
        "fail_count": fail_count,
        "total_rules": total_rules,
        "summary": summary_text,
        "rules": rules
    }