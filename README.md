# Legal Metrology Compliance Inspector (Packaged Commodities)
### SIH Problem Statement 26034 | Ministry of Consumer Affairs, Food & Public Distribution (DoCA)

An automated AI/OCR software system to check compliance of packaged commodities under the **Legal Metrology Act, 2009** and the **Legal Metrology (Packaged Commodities) Rules, 2011** by scanning products, labels, and packaging.

---

## 🏛️ Statutory Rule Engine (Rule 6 & Rule 9)

| Rule ID | Statutory Reference | Mandatory Field | Requirement Description |
| :--- | :--- | :--- | :--- |
| **R1** | Rule 6(1)(a) | Manufacturer / Packer / Importer | Name and complete address of the manufacturer, packer or importer. |
| **R2** | Rule 6(1)(b) | Common / Generic Commodity Name | Generic or common name of the commodity contained in the package. |
| **R3** | Rule 6(1)(c) & Rule 11/12 | Net Quantity Declaration | Numerical value with standardized metric unit (`g`, `kg`, `ml`, `l`, `N`, `units`). |
| **R4** | Rule 6(1)(e) | Maximum Retail Price (MRP) | Must display ₹ / Rs. / INR, must state *"inclusive of all taxes"*, and valid price format. |
| **R5** | Rule 6(1)(d) | Month & Year of Mfg / Packing | Month & Year of manufacture, packing or import (`MM/YYYY` or text format). |
| **R6** | Rule 6(1)(n) | Consumer Care Grievance Details | Name, address, telephone number OR email address for consumer feedback. |
| **R7** | Rule 9 | MRP Font Prominence Ratio | MRP font height must be prominent relative to surrounding text (relative bounding box comparison). |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Start Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*Backend runs on `http://127.0.0.1:8000` with Swagger docs at `http://127.0.0.1:8000/docs`.*

### 3. Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://127.0.0.1:5173`.*

---

## 🧪 Benchmark Test Dataset

The system includes preloaded real-world benchmark packages demonstrating full compliance and violation detection:
1. **Parle-G Gluco Biscuits (250g)**: 100% Fully Compliant.
2. **Dove Daily Shine Shampoo (180ml)**: 100% Fully Compliant.
3. **Crunchy Masala Munch Snack (90g)**: Non-compliant (Missing mandatory *"inclusive of all taxes"* phrase, missing ₹ symbol, compressed font).
4. **Pure Gold Refined Sunflower Oil**: Non-compliant (Missing consumer phone/email grievance mechanism, missing metric unit in net quantity).

---

## 📄 PDF Compliance Export
Official digital compliance inspection reports can be exported directly via the UI or using the endpoint `POST /api/export-pdf`.