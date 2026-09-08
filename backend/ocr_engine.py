"""
Deep Learning OCR & Layout Extraction Module
Uses EasyOCR / PyTesseract / Computer Vision for real image text block and bbox extraction.
"""

import io
import cv2
import numpy as np
from PIL import Image
from typing import List, Dict, Any, Tuple

_EASYOCR_READER = None

def get_easyocr_reader():
    global _EASYOCR_READER
    if _EASYOCR_READER is None:
        try:
            import easyocr
            print("Initializing EasyOCR Reader (English)...")
            _EASYOCR_READER = easyocr.Reader(['en'], gpu=False, verbose=False)
            print("EasyOCR Reader ready!")
        except Exception as e:
            print(f"EasyOCR initialization error: {e}")
            _EASYOCR_READER = False
    return _EASYOCR_READER if _EASYOCR_READER is not False else None


def run_ocr_on_image(image_bytes: bytes) -> Tuple[List[Dict[str, Any]], int, int]:
    """
    Performs real deep learning OCR on uploaded image bytes.
    Returns: (ocr_blocks, image_width, image_height)
    """
    # Open with PIL to get original dimensions
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_w, img_h = pil_img.size
    
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    ocr_blocks = []

    # Method 1: EasyOCR (Deep Learning)
    reader = get_easyocr_reader()
    if reader and img_cv is not None:
        try:
            # easyocr returns [ (bbox_pts, text, confidence) ]
            results = reader.readtext(img_cv, paragraph=False)
            for bbox_pts, text, conf in results:
                text_clean = str(text).strip()
                if text_clean and conf > 0.15:
                    # bbox_pts is 4 points: [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
                    xs = [p[0] for p in bbox_pts]
                    ys = [p[1] for p in bbox_pts]
                    x = max(0, int(min(xs)))
                    y = max(0, int(min(ys)))
                    w = max(10, int(max(xs) - min(xs)))
                    h = max(8, int(max(ys) - min(ys)))

                    ocr_blocks.append({
                        "text": text_clean,
                        "bbox": [x, y, w, h],
                        "confidence": round(float(conf), 2)
                    })
        except Exception as e:
            print(f"EasyOCR execution error: {e}")

    # Method 2: Fallback PyTesseract if EasyOCR didn't yield results
    if not ocr_blocks:
        try:
            import pytesseract
            data = pytesseract.image_to_data(pil_img, output_type=pytesseract.Output.DICT)
            n_boxes = len(data['text'])
            for i in range(n_boxes):
                text = data['text'][i].strip()
                conf = float(data['conf'][i])
                if text and conf > 20:
                    ocr_blocks.append({
                        "text": text,
                        "bbox": [int(data['left'][i]), int(data['top'][i]), int(data['width'][i]), int(data['height'][i])],
                        "confidence": round(conf / 100.0, 2)
                    })
        except Exception as e:
            print(f"PyTesseract fallback warning: {e}")

    # Method 3: Line grouping & deduplication
    if ocr_blocks:
        grouped = group_ocr_lines(ocr_blocks, y_tolerance=int(img_h * 0.025))
        return grouped, img_w, img_h

    # Emergency fallback (should rarely happen)
    return [], img_w, img_h


def group_ocr_lines(blocks: List[Dict[str, Any]], y_tolerance: int = 15) -> List[Dict[str, Any]]:
    """Group close horizontal words into cohesive declaration lines."""
    if not blocks:
        return []
    
    sorted_blocks = sorted(blocks, key=lambda b: (b['bbox'][1], b['bbox'][0]))
    lines = []
    curr = [sorted_blocks[0]]
    
    for b in sorted_blocks[1:]:
        prev = curr[-1]
        # Check vertical alignment
        if abs(b['bbox'][1] - prev['bbox'][1]) <= y_tolerance:
            curr.append(b)
        else:
            lines.append(merge_line_blocks(curr))
            curr = [b]
            
    if curr:
        lines.append(merge_line_blocks(curr))
        
    return lines


def merge_line_blocks(line_blocks: List[Dict[str, Any]]) -> Dict[str, Any]:
    # Sort left-to-right
    line_blocks = sorted(line_blocks, key=lambda b: b['bbox'][0])
    text = " ".join(b['text'] for b in line_blocks)
    x = min(b['bbox'][0] for b in line_blocks)
    y = min(b['bbox'][1] for b in line_blocks)
    max_x = max(b['bbox'][0] + b['bbox'][2] for b in line_blocks)
    max_y = max(b['bbox'][1] + b['bbox'][3] for b in line_blocks)
    w = max_x - x
    h = max_y - y
    avg_conf = sum(b['confidence'] for b in line_blocks) / len(line_blocks)
    
    return {
        "text": text,
        "bbox": [x, y, w, h],
        "confidence": round(avg_conf, 2)
    }