"""
Field Classification Module (Multi-Line Spatial & Statutory Heuristics)
Classifies OCR blocks into mandatory Legal Metrology declarations:
- Manufacturer / Packer / Importer name & complete address
- Common / Generic name of commodity
- Net quantity with standardized unit
- Maximum Retail Price (MRP) & statutory tax phrase
- Date of manufacture / packaging / use by
- Consumer care / grievance mechanism (phone / email / address)
"""

import re
from typing import List, Dict, Any, Optional

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
    
    if not ocr_blocks:
        return classified

    # Spatial sort: top to bottom, left to right
    sorted_blocks = sorted(ocr_blocks, key=lambda b: (b.get("bbox", [0, 0, 0, 0])[1], b.get("bbox", [0, 0, 0, 0])[0]))

    # Join full text to detect overarching document context
    full_text = " ".join(b.get("text", "") for b in sorted_blocks).lower()

    for i, block in enumerate(sorted_blocks):
        text = block.get("text", "").strip()
        lower = text.lower()
        bbox = block.get("bbox", [0, 0, 100, 20])
        conf = block.get("confidence", 0.9)
        
        if not text or len(text) < 2:
            continue

        # 1. Consumer Care Details (Rule 6(1)(n))
        if not classified["consumer_care"] and (
            any(k in lower for k in ["consumer", "customer care", "customer", "helpline", "toll-free", "toll free", "complaints", "suggestions", "care@", "support@", "care."]) or
            re.search(r'1800[-.\s]?\d{2,4}[-.\s]?\d{3,4}', lower) or
            re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', lower) or
            ("care" in lower and "@" in lower) or
            ("e-mail" in lower and "awl" in lower)
        ):
            # Also capture adjacent email / phone line if split
            val_text = text
            if i + 1 < len(sorted_blocks):
                nxt = sorted_blocks[i+1].get("text", "")
                if ("@" in nxt.lower() or re.search(r'\d{4}', nxt)) and not any(k in nxt.lower() for k in ["net", "mrp", "batch"]):
                    val_text += " " + nxt
                    
            classified["consumer_care"] = {
                "value": val_text,
                "bbox": bbox,
                "confidence": conf,
                "raw_text": val_text
            }
            continue

        # 2. Maximum Retail Price (MRP) (Rule 6(1)(e))
        if not classified["mrp"] and (
            re.search(r'(mrp|m\.r\.p|₹|inr|\brs\b|\brs\.|\bretail\s*price|max\s*retail)', lower) or 
            ("incl" in lower and ("tax" in lower or "all" in lower)) or
            "inclusive of all taxes" in lower or
            re.search(r'₹\s*\d+', lower) or
            re.search(r'rs\.?\s*\d+', lower)
        ):
            val_text = text
            # Check if next block has "INCLUSIVE OF ALL TAXES" or price
            if i + 1 < len(sorted_blocks):
                nxt = sorted_blocks[i+1].get("text", "")
                if any(k in nxt.lower() for k in ["incl", "tax", "taxes", "₹", "rs", ".00"]) and not any(k in nxt.lower() for k in ["net", "batch", "date"]):
                    val_text += " " + nxt
            
            classified["mrp"] = {
                "value": val_text,
                "bbox": bbox,
                "confidence": conf,
                "raw_text": val_text
            }
            continue

        # 3. Net Quantity (Rule 6(1)(c))
        if not classified["net_quantity"] and (
            any(k in lower for k in ["net quantity", "net qty", "net wt", "net weight", "net content", "net vol"]) or
            re.search(r'\b\d+(\.\d+)?\s*(g|gm|gms|gram|grams|kg|kgs|ml|mls|l|ltr|litre|litres|liter|n|pcs|units)\b', lower) or
            re.search(r'(qty|quantity)\s*:?\s*\d+', lower)
        ) and not any(k in lower for k in ["mrp", "price", "taxes", "energy", "serving", "fat", "table"]):
            classified["net_quantity"] = {
                "value": text,
                "bbox": bbox,
                "confidence": conf,
                "raw_text": text
            }
            continue

        # 4. Date of Manufacture / Packaging / Expiry (Rule 6(1)(d))
        if not classified["mfg_date"] and (
            any(k in lower for k in ["mfg", "pkd", "packed", "date of packing", "date of packaging", "use by", "best before", "expiry", "exp date", "batch no"]) or
            re.search(r'\b(0[1-9]|1[0-2])[\/\-\.](20\d\d|\d\d)\b', lower)
        ) and not any(k in lower for k in ["fssai", "license", "serving"]):
            classified["mfg_date"] = {
                "value": text,
                "bbox": bbox,
                "confidence": conf,
                "raw_text": text
            }
            continue

        # 5. Manufacturer / Packer / Importer Details (Rule 6(1)(a))
        if not classified["manufacturer_address"] and (
            re.search(r'(manu[fl]actur|marketed\s*by|mfd\s*by|pkd\s*by|packed\s*by|imported\s*by|corporate\s*office|adani\s*wilmar|awl\s*agri|fortune\s*house|pvt\s*l[td]|ltd|industrial|estate|ahmedabad|gujarat|mumbai|delhi)', lower) or
            re.search(r'\b\d{6}\b', lower) # 6-digit Indian PIN code
        ):
            # Aggregate multi-line manufacturer block
            addr_lines = [text]
            for j in range(i + 1, min(i + 5, len(sorted_blocks))):
                sub_text = sorted_blocks[j].get("text", "")
                sub_lower = sub_text.lower()
                if any(stop_k in sub_lower for stop_k in ["nutrition", "energy", "barcode", "net qty", "mrp", "customer care"]):
                    break
                if any(addr_k in sub_lower for addr_k in ["house", "crossing", "road", "street", "ahmedabad", "gujarat", "india", "pincode", "380009", "limited", "ltd", "address"]):
                    addr_lines.append(sub_text)
            
            combined_addr = " ".join(addr_lines)
            classified["manufacturer_address"] = {
                "value": combined_addr,
                "bbox": bbox,
                "confidence": conf,
                "raw_text": combined_addr
            }
            continue

        # 6. Common / Generic Name (Rule 6(1)(b))
        if not classified["common_name"] and (
            any(k in lower for k in ["refined", "sunflower", "seed oil", "edible oil", "biscuit", "shampoo", "snack", "cashew", "flour", "soap", "toothpaste", "tea", "coffee", "commodity", "generic"]) or
            # Or prominent top banner text
            (bbox[1] < 60 and len(text) > 5 and not any(k in lower for k in ["nutrition", "fssai", "fortified", "serving"]))
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

    # Post-processing heuristics: if generic name not found, check top OCR blocks
    if not classified["common_name"]:
        top_candidates = [b for b in sorted_blocks if b.get("bbox", [0, 0, 0, 0])[1] < 100 and len(b.get("text", "")) > 4]
        for cand in top_candidates:
            cand_text = cand.get("text", "")
            if not any(k in cand_text.lower() for k in ["nutrition", "table", "energy", "fssai"]):
                classified["common_name"] = {
                    "value": cand_text,
                    "bbox": cand.get("bbox"),
                    "confidence": cand.get("confidence", 0.8),
                    "raw_text": cand_text
                }
                break

    return classified