"""
Deep Learning OCR & Layout Extraction Module
Adapted with Drug Label Extraction Preprocessing:
- Adaptive Lanczos-4 Multi-scale Resizing (preserves fine micro-typography on small packaging labels)
- Contrast-Limited Adaptive Histogram Equalization (CLAHE)
- EasyOCR deep learning text detection with coordinate scaling
- Spatial line grouping
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


def preprocess_label_image(img_cv: np.ndarray) -> Tuple[np.ndarray, float]:
    orig_h, orig_w = img_cv.shape[:2]
    max_dim = max(orig_h, orig_w)
    target_dim = 1200.0
    scale = max(1.0, min(4.0, target_dim / max_dim))
    
    if scale > 1.05:
        new_w = int(orig_w * scale)
        new_h = int(orig_h * scale)
        scaled_img = cv2.resize(img_cv, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
    else:
        scaled_img = img_cv.copy()
        scale = 1.0

    if len(scaled_img.shape) == 3:
        gray = cv2.cvtColor(scaled_img, cv2.COLOR_BGR2GRAY)
    else:
        gray = scaled_img

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    return enhanced, scale


def run_ocr_on_image(image_bytes: bytes) -> Tuple[List[Dict[str, Any]], int, int]:
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_w, img_h = pil_img.size
    
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    ocr_blocks = []

    if img_cv is not None:
        try:
            processed_img, scale = preprocess_label_image(img_cv)
            reader = get_easyocr_reader()
            if reader:
                results = reader.readtext(processed_img)
                for bbox_pts, text, conf in results:
                    text_clean = str(text).strip()
                    if text_clean and conf > 0.12:
                        xs = [p[0] / scale for p in bbox_pts]
                        ys = [p[1] / scale for p in bbox_pts]
                        x = max(0, int(min(xs)))
                        y = max(0, int(min(ys)))
                        w = max(6, int(max(xs) - min(xs)))
                        h = max(6, int(max(ys) - min(ys)))

                        ocr_blocks.append({
                            "text": text_clean,
                            "bbox": [x, y, w, h],
                            "confidence": round(float(conf), 2)
                        })
        except Exception as e:
            print(f"EasyOCR execution error: {e}")

    if ocr_blocks:
        grouped = group_ocr_lines(ocr_blocks, img_w=img_w, y_tolerance=max(10, int(img_h * 0.028)))
        return grouped, img_w, img_h

    return [], img_w, img_h


def group_ocr_lines(blocks: List[Dict[str, Any]], img_w: int = 500, y_tolerance: int = 15) -> List[Dict[str, Any]]:
    if not blocks:
        return []
    
    sorted_blocks = sorted(blocks, key=lambda b: (b['bbox'][1], b['bbox'][0]))
    lines = []
    curr = [sorted_blocks[0]]
    max_horizontal_gap = max(30, int(img_w * 0.15))
    
    for b in sorted_blocks[1:]:
        prev = curr[-1]
        vert_aligned = abs(b['bbox'][1] - prev['bbox'][1]) <= y_tolerance
        prev_end_x = prev['bbox'][0] + prev['bbox'][2]
        horiz_gap = b['bbox'][0] - prev_end_x
        
        if vert_aligned and horiz_gap <= max_horizontal_gap:
            curr.append(b)
        else:
            lines.append(merge_line_blocks(curr))
            curr = [b]
            
    if curr:
        lines.append(merge_line_blocks(curr))
        
    return lines


def merge_line_blocks(line_blocks: List[Dict[str, Any]]) -> Dict[str, Any]:
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