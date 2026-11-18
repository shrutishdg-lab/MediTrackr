// ========================================================
// MediTrackr Automated Integration Test Suite
// ========================================================

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=================================================");
  console.log("  Running MediTrackr Automated Feature Tests");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. AUTHENTICATION & PROFILE
    console.log("[1] Testing Authentication & Store Profile...");
    const loginRes = await request('POST', '/api/auth/login', { phone: '9876543210', pin: '1234' });
    assert(loginRes.status === 200 && loginRes.data.success === true, "User login with Phone/PIN");
    assert(loginRes.data.user.name === "Dr. Shruti Shedge", "Correct user profile returned");

    const pharmacyRes = await request('GET', '/api/pharmacy');
    assert(pharmacyRes.status === 200 && pharmacyRes.data.name.includes("MediTrackr"), "Pharmacy name is MediTrackr");
    assert(pharmacyRes.data.gstin.startsWith("27"), "Pharmacy profile has valid GSTIN");

    // 2. DASHBOARD
    console.log("\n[2] Testing Dashboard Metrics & Telemetry...");
    const dashRes = await request('GET', '/api/dashboard/stats');
    assert(dashRes.status === 200, "Dashboard stats endpoint returns 200");
    assert(dashRes.data.totalMedicinesCount > 0, "Dashboard tracks medicine catalog count");
    assert(typeof dashRes.data.todayRevenue === 'number', "Dashboard computes today's revenue");
    assert(Array.isArray(dashRes.data.nearExpiryList), "Dashboard includes near-expiry alert cards");

    // 3. INVENTORY & BATCH MANAGEMENT
    console.log("\n[3] Testing Inventory & Batches...");
    const invRes = await request('GET', '/api/inventory');
    assert(invRes.status === 200 && invRes.data.length >= 7, "Inventory returns catalog medicines with batch data");
    
    // Add new medicine
    const newMedRes = await request('POST', '/api/inventory', {
      name: "Amoxyclav 625mg",
      composition: "Amoxicillin + Clavulanate Potassium",
      manufacturer: "Alkem Laboratories",
      category: "Antibiotic",
      shelfLocation: "Rack B-09",
      gstRate: 12,
      unitsPerStrip: 10,
      initialBatch: {
        batchNo: "AMX-9901",
        expiryDate: "2027-06-30",
        mrp: 180.00,
        costPrice: 130.00,
        stockStrips: 20
      }
    });
    assert(newMedRes.status === 200 && newMedRes.data.success === true, "New medicine added to inventory");
    const createdMedId = newMedRes.data.medicine.id;

    // Add new batch to medicine
    const addBatchRes = await request('POST', `/api/inventory/${createdMedId}/batch`, {
      batchNo: "AMX-9902",
      expiryDate: "2027-09-30",
      mrp: 185.00,
      costPrice: 135.00,
      stockStrips: 15
    });
    assert(addBatchRes.status === 200 && addBatchRes.data.success === true, "New batch attached to medicine");

    // 4. COUNTER BILLING & PRINT INVOICE & UPI QR
    console.log("\n[4] Testing POS Billing Counter & Invoicing...");
    const billRes = await request('POST', '/api/billing', {
      customerName: "Sunil Gavaskar",
      customerPhone: "+91 98200 99881",
      doctorName: "Dr. B. C. Roy (MD)",
      items: [
        {
          medicineId: "med_1",
          name: "Dolo 650 Tablet",
          batchNo: "DL650-B92",
          expiryDate: "2027-01-15",
          unit: "strip",
          quantity: 2,
          rate: 32.00,
          gstRate: 12
        }
      ],
      discountPercent: 10,
      paymentMethod: "UPI"
    });
    assert(billRes.status === 200 && billRes.data.success === true, "POS Bill generated with GST & discount");
    assert(billRes.data.bill.invoiceNo.startsWith("INV-2026"), "Formatted invoice number generated");
    assert(billRes.data.bill.paymentMethod === "UPI", "Payment method correctly stored");

    // Test dynamic UPI QR code generator
    const upiRes = await request('GET', `/api/billing/upi-qr?amount=${billRes.data.bill.grandTotal}&invoiceNo=${billRes.data.bill.invoiceNo}`);
    assert(upiRes.status === 200 && upiRes.data.qrDataUrl.startsWith("data:image/png;base64"), "Dynamic UPI QR code generated");

    // 5. SCAN PHOTO (OCR) FEATURE
    console.log("\n[5] Testing Prescription & Bill Photo OCR Scanner...");
    const ocrRes = await request('POST', '/api/ocr/scan', {
      text: "Rx:\n1. Tab Dolo 650mg - 2 strips\n2. Tab Pantocid 40mg - 1 strip\nDr. V. K. Mehta"
    });
    assert(ocrRes.status === 200 && ocrRes.data.success === true, "OCR engine processes prescription text");
    assert(ocrRes.data.extractedItems.length >= 2, "OCR extracts detected medicine entities");

    // 6. INTER-HOSPITAL EARLY-EXPIRY MEDICINE DONATION & EXCHANGE HUB
    console.log("\n[6] Testing Inter-Hospital Medicine Donation & Exchange Hub...");
    const listingsRes = await request('GET', '/api/exchange/listings');
    assert(listingsRes.status === 200 && listingsRes.data.length >= 4, "Exchange listings loaded across hospitals");

    // Post a surplus near-expiry donation lot
    const postListingRes = await request('POST', '/api/exchange/listings', {
      medicineName: "Pantocid 40 Injection",
      composition: "Pantoprazole IV 40mg",
      batchNo: "PTC-IV-229",
      manufacturer: "Sun Pharma",
      expiryDate: "2026-12-31",
      quantityStrips: 50,
      originalMrp: 55.00,
      type: "DONATION",
      urgency: "HIGH",
      notes: "Surplus OT lot donated free for charitable use."
    });
    assert(postListingRes.status === 200 && postListingRes.data.success === true, "Surplus near-expiry lot published for Donation");
    const listingId = postListingRes.data.listing.id;

    // Claim the donation lot
    const claimRes = await request('POST', `/api/exchange/listings/${listingId}/claim`, {
      hospitalName: "Apex Charitable Hospital & Dispensary (Pune)",
      contactPhone: "+91 98220 11223",
      message: "Claimed for our free charitable dispensary camp."
    });
    assert(claimRes.status === 200 && claimRes.data.success === true, "Donation lot claimed by recipient hospital");
    assert(claimRes.data.claim.dispatchWaybill.startsWith("VRL-EXPRESS"), "Dispatch waybill generated for transport");

    console.log("\n=================================================");
    console.log(`  Tests Completed: ${passed} Passed, ${failed} Failed`);
    console.log("=================================================");

    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  }
}

runTests();
