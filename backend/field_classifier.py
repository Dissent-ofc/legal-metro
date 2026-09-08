"""
Field Classification Module (LLM & Robust Fuzzy OCR Pattern Extraction)
"""

import os
import re
from typing import List, Dict, Any

def classify_ocr_blocks(ocr_blocks: List[Dict[str, Any]]) -> Dict[str, Any]:
    classified: Dict[str, Any] = {
        "manufacturer_address": None,
        "common_name": None,
        "net_quantity": None,
        "mrp": None,
        "mfg_date": None,
        "consumer_care": None,
        "other": []
    }
    
    for block in ocr_blocks:
        text = block.get("text", "").strip()
        lower = text.lower()
        bbox = block.get("bbox")
        conf = block.get("confidence", 0.9)
        
        # 1. MRP Check
        if not classified["mrp"] and (
            re.search(r'(mrp|m\.r\.p|rs\.?|inr|₹|retail\s*price|max\s*retail)', lower) or 
            ("incl" in lower and any(char.isdigit() for char in text)) or
            re.search(r'rs\s*\d+', lower)
        ):
            classified["mrp"] = {
                "value": text,
                "bbox": bbox,
                "confidence": conf,
                "raw_text": text
            }
            continue

        # 2. Consumer Care
        if not classified["consumer_care"] and (
            any(k in lower for k in ["consumer", "customer", "helpline", "toll-free", "toll free", "feedback", "care@", "support@"]) or
            re.search(r'1800[-.\s]?\d{2,4}[-.\s]?\d{3,4}', lower) or
            "@" in lower
        ):
            classified["consumer_care"] = {
                "value": text,
                "bbox": bbox,
                "confidence": conf,
                "raw_text": text
            }
            continue

        # 3. Manufacturer Address
        if not classified["manufacturer_address"] and (
            re.search(r'(manu[fl]actur|mfd|pkd|packed|imported|marketed|mfg\s*by|pvt\s*l[td]|ltd|industrial|estate)', lower)
        ):
            classified["manufacturer_address"] = {
                "value": text,
                "bbox": bbox,
                "confidence": conf,
                "raw_text": text
            }
            continue

        # 4. Net Quantity
        if not classified["net_quantity"] and (
            any(k in lower for k in ["net qty", "net wt", "net weight", "net quantity", "net content", "net vol"]) or
            re.search(r'\b\d+(\.\d+)?\s*(g|gm|gms|gram|grams|kg|kgs|ml|mls|l|ltr|n|pcs)\b', lower) or
            re.search(r'\d+\s*(g|gm|kg|ml|l)\b', lower)
        ) and not any(k in lower for k in ["mrp", "rs", "₹", "date", "mfg"]):
            classified["net_quantity"] = {
                "value": text,
                "bbox": bbox,
                "confidence": conf,
                "raw_text": text
            }
            continue

        # 5. Month & Year of Mfg
        if not classified["mfg_date"] and (
            any(k in lower for k in ["mfg", "pkd", "packed", "date of", "best before", "use by", "exp", "batch"]) or
            re.search(r'\b(0[1-9]|1[0-2])[\/\-\.](20\d\d|\d\d)\b', lower)
        ):
            classified["mfg_date"] = {
                "value": text,
                "bbox": bbox,
                "confidence": conf,
                "raw_text": text
            }
            continue

        # 6. Common / Generic Name
        if not classified["common_name"] and (
            any(k in lower for k in ["generic", "common", "product", "commodity", "name:"]) or
            any(k in lower for k in ["biscuit", "shampoo", "snack", "oil", "soap", "toothpaste", "cashew", "nuts", "flour", "salt", "tea", "coffee"])
        ):
            classified["common_name"] = {
                "value": text,
                "bbox": bbox,
                "confidence": conf,
                "raw_text": text
            }
            continue

        classified["other"].append({
            "value": text,
            "bbox": bbox,
            "confidence": conf,
            "raw_text": text
        })

    return classified