"""
Unit Tests for Legal Metrology (Packaged Commodities) Rules, 2011 Compliance Engine
"""

from rule_engine import (
    check_r1_manufacturer,
    check_r2_generic_name,
    check_r3_net_quantity,
    check_r4_mrp,
    check_r5_mfg_date,
    check_r6_consumer_care,
    check_r7_mrp_font_prominence,
    evaluate_compliance
)

def test_r1_manufacturer():
    # Pass
    res = check_r1_manufacturer({"value": "Mfd. by: Tata Consumer Products Ltd, Kirloskar Business Park, Bengaluru 560024"})
    assert res["status"] == "PASS"
    
    # Fail missing
    res_fail = check_r1_manufacturer(None)
    assert res_fail["status"] == "FAIL"

def test_r2_generic_name():
    res = check_r2_generic_name({"value": "Iodised Salt"})
    assert res["status"] == "PASS"
    
    res_fail = check_r2_generic_name({"value": ""})
    assert res_fail["status"] == "FAIL"

def test_r3_net_quantity():
    # Valid metric units
    assert check_r3_net_quantity({"value": "1 kg"})["status"] == "PASS"
    assert check_r3_net_quantity({"value": "500 g"})["status"] == "PASS"
    assert check_r3_net_quantity({"value": "750 ml"})["status"] == "PASS"
    assert check_r3_net_quantity({"value": "2 L"})["status"] == "PASS"
    assert check_r3_net_quantity({"value": "10 N"})["status"] == "PASS"
    
    # Invalid missing unit
    assert check_r3_net_quantity({"value": "500"})["status"] == "FAIL"

def test_r4_mrp():
    # Compliant MRP
    res_pass = check_r4_mrp({"value": "MRP Rs. 45.00 (inclusive of all taxes)"})
    assert res_pass["status"] == "PASS"
    
    res_pass_rupee = check_r4_mrp({"value": "MRP ₹ 99.00 (incl. of all taxes)"})
    assert res_pass_rupee["status"] == "PASS"
    
    # Missing tax phrase
    res_fail_tax = check_r4_mrp({"value": "MRP Rs. 50.00"})
    assert res_fail_tax["status"] == "FAIL"
    
    # Missing currency symbol
    res_fail_curr = check_r4_mrp({"value": "50.00 (incl. of all taxes)"})
    assert res_fail_curr["status"] == "FAIL"

def test_r5_mfg_date():
    assert check_r5_mfg_date({"value": "Mfg Date: 03/2026"})["status"] == "PASS"
    assert check_r5_mfg_date({"value": "Pkd: MARCH 2026"})["status"] == "PASS"
    assert check_r5_mfg_date({"value": ""})["status"] == "FAIL"

def test_r6_consumer_care():
    assert check_r6_consumer_care({"value": "Toll Free: 1800-22-4020, email: care@company.com"})["status"] == "PASS"
    assert check_r6_consumer_care({"value": "Contact us at HQ"})["status"] == "FAIL"

def test_r7_prominence():
    mrp_field = {"bbox": [10, 10, 200, 36]}
    ocr_blocks = [
        {"bbox": [10, 50, 200, 24]},
        {"bbox": [10, 80, 200, 26]},
        {"bbox": [10, 110, 200, 24]}
    ]
    res = check_r7_mrp_font_prominence(mrp_field, ocr_blocks)
    assert res["status"] == "PASS"
    assert res["ratio"] > 1.0

if __name__ == "__main__":
    test_r1_manufacturer()
    test_r2_generic_name()
    test_r3_net_quantity()
    test_r4_mrp()
    test_r5_mfg_date()
    test_r6_consumer_care()
    test_r7_prominence()
    print("All Legal Metrology Rule Unit Tests Passed (7/7)!")