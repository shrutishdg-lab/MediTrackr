const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

function getInitialData() {
  const today = new Date();
  const addDays = (d, days) => {
    const res = new Date(d);
    res.setDate(res.getDate() + days);
    return res.toISOString().split('T')[0];
  };

  return {
    pharmacy: {
      name: "MediTrackr Health Pharmacy",
      tagline: "Smart Healthcare & Inter-Hospital Exchange",
      phone: "+91 98765 43210",
      email: "billing@meditrackr.in",
      address: "Shop 12-14, Green Park Medical Enclave, Andheri West, Mumbai, Maharashtra 400053",
      gstin: "27AABCM8821K1ZP",
      dlNo: "MH-MZ4-20B-184920 / 21B-184921",
      upiId: "meditrackr@okhdfcbank",
      currency: "INR",
      currencySymbol: "₹"
    },
    users: [
      {
        id: "usr_1",
        name: "Dr. Shruti Shedge",
        phone: "9876543210",
        email: "shruti@meditrackr.in",
        role: "Head Pharmacist & Administrator",
        pin: "1234",
        hospitalId: "hosp_1"
      },
      {
        id: "usr_2",
        name: "Counter Staff (Billing)",
        phone: "9123456780",
        email: "counter@meditrackr.in",
        role: "Billing Executive",
        pin: "0000",
        hospitalId: "hosp_1"
      }
    ],
    hospitals: [
      {
        id: "hosp_1",
        name: "MediTrackr Health Pharmacy & Hospital",
        city: "Mumbai",
        state: "Maharashtra",
        contactPerson: "Dr. Shruti Shedge",
        phone: "+91 98765 43210",
        isCurrent: true,
        type: "Private Super-Speciality",
        verified: true
      },
      {
        id: "hosp_2",
        name: "Apex Charitable Hospital & Dispensary",
        city: "Pune",
        state: "Maharashtra",
        contactPerson: "Dr. R. K. Joshi",
        phone: "+91 98220 11223",
        isCurrent: false,
        type: "Charitable Trust",
        verified: true
      },
      {
        id: "hosp_3",
        name: "LifeLine Multi-Care Hospital",
        city: "Thane",
        state: "Maharashtra",
        contactPerson: "Dr. Ananya Roy",
        phone: "+91 97690 44556",
        isCurrent: false,
        type: "District Hospital",
        verified: true
      },
      {
        id: "hosp_4",
        name: "Sanjeevani Gramin Healthcare Center",
        city: "Satara",
        state: "Maharashtra",
        contactPerson: "Dr. V. Patil",
        phone: "+91 94220 88990",
        isCurrent: false,
        type: "Rural Primary Health Center",
        verified: true
      }
    ],
    medicines: [
      {
        id: "med_1",
        name: "Dolo 650 Tablet",
        composition: "Paracetamol 650mg",
        manufacturer: "Micro Labs Ltd",
        category: "Analgesic / Antipyretic",
        hsn: "30049060",
        gstRate: 12,
        shelfLocation: "Rack A-01",
        unitsPerStrip: 15,
        batches: [
          {
            batchNo: "DL650-B92",
            expiryDate: addDays(today, 420),
            mrp: 34.00,
            costPrice: 24.50,
            sellingPrice: 32.00,
            stockStrips: 45,
            stockTablets: 675
          },
          {
            batchNo: "DL650-B88",
            expiryDate: addDays(today, 45),
            mrp: 32.00,
            costPrice: 22.00,
            sellingPrice: 28.00,
            stockStrips: 12,
            stockTablets: 180
          }
        ]
      },
      {
        id: "med_2",
        name: "Augmentin 625 Duo Tablet",
        composition: "Amoxicillin 500mg + Clavulanic Acid 125mg",
        manufacturer: "GlaxoSmithKline Pharmaceuticals",
        category: "Antibiotic",
        hsn: "30041010",
        gstRate: 12,
        shelfLocation: "Rack B-04",
        unitsPerStrip: 10,
        batches: [
          {
            batchNo: "AUG-7721",
            expiryDate: addDays(today, 320),
            mrp: 201.50,
            costPrice: 155.00,
            sellingPrice: 190.00,
            stockStrips: 25,
            stockTablets: 250
          },
          {
            batchNo: "AUG-7104",
            expiryDate: addDays(today, 38),
            mrp: 198.00,
            costPrice: 140.00,
            sellingPrice: 175.00,
            stockStrips: 8,
            stockTablets: 80
          }
        ]
      },
      {
        id: "med_3",
        name: "Pantocid 40 Tablet",
        composition: "Pantoprazole Gastro-Resistant 40mg",
        manufacturer: "Sun Pharma Laboratories",
        category: "Antacid / PPI",
        hsn: "30049099",
        gstRate: 12,
        shelfLocation: "Rack A-08",
        unitsPerStrip: 15,
        batches: [
          {
            batchNo: "PTC-4091",
            expiryDate: addDays(today, 540),
            mrp: 168.00,
            costPrice: 118.00,
            sellingPrice: 155.00,
            stockStrips: 60,
            stockTablets: 900
          }
        ]
      },
      {
        id: "med_4",
        name: "Azithral 500 Tablet",
        composition: "Azithromycin IP 500mg",
        manufacturer: "Alembic Pharmaceuticals",
        category: "Antibiotic",
        hsn: "30042039",
        gstRate: 12,
        shelfLocation: "Rack B-02",
        unitsPerStrip: 5,
        batches: [
          {
            batchNo: "AZT-8812",
            expiryDate: addDays(today, 25),
            mrp: 125.00,
            costPrice: 90.00,
            sellingPrice: 115.00,
            stockStrips: 5,
            stockTablets: 25
          }
        ]
      },
      {
        id: "med_5",
        name: "Telma 40 Tablet",
        composition: "Telmisartan IP 40mg",
        manufacturer: "Glenmark Pharmaceuticals",
        category: "Antihypertensive",
        hsn: "30049099",
        gstRate: 12,
        shelfLocation: "Rack C-01",
        unitsPerStrip: 15,
        batches: [
          {
            batchNo: "TLM-3320",
            expiryDate: addDays(today, 400),
            mrp: 220.00,
            costPrice: 165.00,
            sellingPrice: 205.00,
            stockStrips: 30,
            stockTablets: 450
          }
        ]
      },
      {
        id: "med_6",
        name: "Glycomet 500 SR Tablet",
        composition: "Metformin Hydrochloride Sustained Release 500mg",
        manufacturer: "USV Private Limited",
        category: "Antidiabetic",
        hsn: "30049099",
        gstRate: 12,
        shelfLocation: "Rack C-05",
        unitsPerStrip: 20,
        batches: [
          {
            batchNo: "GLY-9014",
            expiryDate: addDays(today, 18),
            mrp: 52.00,
            costPrice: 35.00,
            sellingPrice: 48.00,
            stockStrips: 4,
            stockTablets: 80
          }
        ]
      },
      {
        id: "med_7",
        name: "Cetirizine 10mg (Cetzine)",
        composition: "Cetirizine Hydrochloride 10mg",
        manufacturer: "Dr. Reddy's Laboratories",
        category: "Antihistamine / Allergy",
        hsn: "30049099",
        gstRate: 12,
        shelfLocation: "Rack A-03",
        unitsPerStrip: 10,
        batches: [
          {
            batchNo: "CTZ-2210",
            expiryDate: addDays(today, 380),
            mrp: 24.50,
            costPrice: 15.00,
            sellingPrice: 22.00,
            stockStrips: 8,
            stockTablets: 80
          }
        ]
      }
    ],
    bills: [
      {
        id: "bill_1001",
        invoiceNo: "INV-2026-0001",
        date: addDays(today, -2),
        customerName: "Rajesh Sharma",
        customerPhone: "+91 98200 45678",
        doctorName: "Dr. V. K. Mehta (MD)",
        items: [
          {
            medicineId: "med_1",
            name: "Dolo 650 Tablet",
            batchNo: "DL650-B92",
            expiryDate: addDays(today, 420),
            unit: "strip",
            quantity: 2,
            rate: 32.00,
            gstRate: 12,
            total: 64.00
          },
          {
            medicineId: "med_3",
            name: "Pantocid 40 Tablet",
            batchNo: "PTC-4091",
            expiryDate: addDays(today, 540),
            unit: "strip",
            quantity: 1,
            rate: 155.00,
            gstRate: 12,
            total: 155.00
          }
        ],
        subtotal: 219.00,
        discountPercent: 5,
        discountAmount: 10.95,
        taxableAmount: 208.05,
        cgst: 12.48,
        sgst: 12.48,
        roundOff: 0.99,
        grandTotal: 234.00,
        paymentMethod: "UPI",
        paymentStatus: "PAID",
        createdBy: "Dr. Shruti Shedge"
      },
      {
        id: "bill_1002",
        invoiceNo: "INV-2026-0002",
        date: addDays(today, -1),
        customerName: "Pooja Deshmukh",
        customerPhone: "+91 99300 78912",
        doctorName: "Dr. S. Patil (MBBS)",
        items: [
          {
            medicineId: "med_2",
            name: "Augmentin 625 Duo Tablet",
            batchNo: "AUG-7721",
            expiryDate: addDays(today, 320),
            unit: "strip",
            quantity: 1,
            rate: 190.00,
            gstRate: 12,
            total: 190.00
          }
        ],
        subtotal: 190.00,
        discountPercent: 0,
        discountAmount: 0,
        taxableAmount: 169.64,
        cgst: 10.18,
        sgst: 10.18,
        roundOff: 0.00,
        grandTotal: 190.00,
        paymentMethod: "Cash",
        paymentStatus: "PAID",
        createdBy: "Counter Staff"
      }
    ],
    exchangeListings: [
      {
        id: "ex_1",
        hospitalId: "hosp_2",
        hospitalName: "Apex Charitable Hospital & Dispensary",
        city: "Pune",
        medicineName: "Augmentin 625 Duo Tablet",
        composition: "Amoxicillin 500mg + Clavulanic Acid 125mg",
        batchNo: "AUG-6610",
        manufacturer: "GlaxoSmithKline",
        expiryDate: addDays(today, 55),
        quantityStrips: 40,
        unitsPerStrip: 10,
        originalMrp: 201.50,
        type: "DONATION",
        listingPricePerStrip: 0.00,
        urgency: "HIGH",
        notes: "Surplus lot from ICU ward. Available for immediate pickup or courier by any rural trust or clinic.",
        status: "AVAILABLE",
        listedDate: addDays(today, -3)
      },
      {
        id: "ex_2",
        hospitalId: "hosp_3",
        hospitalName: "LifeLine Multi-Care Hospital",
        city: "Thane",
        medicineName: "Azithral 500 Tablet",
        composition: "Azithromycin IP 500mg",
        batchNo: "AZT-7190",
        manufacturer: "Alembic Pharma",
        expiryDate: addDays(today, 60),
        quantityStrips: 35,
        unitsPerStrip: 5,
        originalMrp: 125.00,
        type: "SALE",
        discountPercent: 70,
        listingPricePerStrip: 37.50,
        urgency: "MEDIUM",
        notes: "Liquidating excess stock due to seasonal shift. Great value for high footfall outpatient OPDs.",
        status: "AVAILABLE",
        listedDate: addDays(today, -2)
      },
      {
        id: "ex_3",
        hospitalId: "hosp_4",
        hospitalName: "Sanjeevani Gramin Healthcare Center",
        city: "Satara",
        medicineName: "Human Actrapid Insulin 100IU/ml 10ml Vial",
        composition: "Soluble Insulin (rDNA origin)",
        batchNo: "ACT-8842",
        manufacturer: "Novo Nordisk",
        expiryDate: addDays(today, 40),
        quantityStrips: 15,
        unitsPerStrip: 1,
        originalMrp: 165.00,
        type: "DONATION",
        listingPricePerStrip: 0.00,
        urgency: "CRITICAL",
        notes: "Free for diabetic patient welfare camp. Maintained under cold chain (2-8°C).",
        status: "AVAILABLE",
        listedDate: addDays(today, -1)
      },
      {
        id: "ex_4",
        hospitalId: "hosp_1",
        hospitalName: "MediTrackr Health Pharmacy & Hospital",
        city: "Mumbai",
        medicineName: "Glycomet 500 SR Tablet",
        composition: "Metformin Hydrochloride SR 500mg",
        batchNo: "GLY-9014",
        manufacturer: "USV Ltd",
        expiryDate: addDays(today, 18),
        quantityStrips: 4,
        unitsPerStrip: 20,
        originalMrp: 52.00,
        type: "DONATION",
        listingPricePerStrip: 0.00,
        urgency: "CRITICAL",
        notes: "Expiring in 18 days. Free for immediate dispense to patients in need.",
        status: "AVAILABLE",
        listedDate: addDays(today, 0)
      }
    ],
    exchangeClaims: [
      {
        id: "clm_1",
        listingId: "ex_1",
        claimedByHospitalId: "hosp_4",
        claimedByHospitalName: "Sanjeevani Gramin Healthcare Center (Satara)",
        contactPhone: "+91 94220 88990",
        requestDate: addDays(today, -1),
        status: "APPROVED_DISPATCHED",
        dispatchWaybill: "VRL-LOGISTICS-778812",
        message: "Claimed for our weekly rural free health camp."
      }
    ]
  };
}

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    this.data = getInitialData();
    this.save();
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error("Failed to write db.json:", err);
      return false;
    }
  }

  getPharmacy() {
    return this.data.pharmacy;
  }

  updatePharmacy(info) {
    this.data.pharmacy = { ...this.data.pharmacy, ...info };
    this.save();
    return this.data.pharmacy;
  }

  getUsers() {
    return this.data.users;
  }

  getHospitals() {
    return this.data.hospitals;
  }

  getMedicines() {
    return this.data.medicines;
  }

  getMedicineById(id) {
    return this.data.medicines.find(m => m.id === id);
  }

  addMedicine(med) {
    const newMed = {
      id: "med_" + Date.now(),
      name: med.name,
      composition: med.composition || "",
      manufacturer: med.manufacturer || "",
      category: med.category || "General",
      hsn: med.hsn || "30049099",
      gstRate: Number(med.gstRate) || 12,
      shelfLocation: med.shelfLocation || "Unassigned",
      unitsPerStrip: Number(med.unitsPerStrip) || 10,
      batches: med.batches || []
    };
    this.data.medicines.push(newMed);
    this.save();
    return newMed;
  }

  addBatch(medId, batch) {
    const med = this.getMedicineById(medId);
    if (!med) return null;
    const newBatch = {
      batchNo: batch.batchNo,
      expiryDate: batch.expiryDate,
      mrp: Number(batch.mrp) || 0,
      costPrice: Number(batch.costPrice) || 0,
      sellingPrice: Number(batch.sellingPrice) || Number(batch.mrp) || 0,
      stockStrips: Number(batch.stockStrips) || 0,
      stockTablets: (Number(batch.stockStrips) || 0) * (med.unitsPerStrip || 10)
    };
    med.batches.push(newBatch);
    this.save();
    return med;
  }

  getBills() {
    return this.data.bills.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  createBill(billData) {
    const nextNum = (this.data.bills.length + 1).toString().padStart(4, '0');
    const invoiceNo = `INV-2026-${nextNum}`;
    const newBill = {
      id: "bill_" + Date.now(),
      invoiceNo,
      date: new Date().toISOString(),
      ...billData
    };

    if (Array.isArray(billData.items)) {
      billData.items.forEach(item => {
        const med = this.getMedicineById(item.medicineId);
        if (med) {
          const batch = med.batches.find(b => b.batchNo === item.batchNo);
          if (batch) {
            if (item.unit === 'strip') {
              batch.stockStrips = Math.max(0, batch.stockStrips - item.quantity);
              batch.stockTablets = Math.max(0, batch.stockTablets - (item.quantity * med.unitsPerStrip));
            } else {
              batch.stockTablets = Math.max(0, batch.stockTablets - item.quantity);
              batch.stockStrips = Math.floor(batch.stockTablets / med.unitsPerStrip);
            }
          }
        }
      });
    }

    this.data.bills.push(newBill);
    this.save();
    return newBill;
  }

  getExchangeListings() {
    return this.data.exchangeListings.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }

  createExchangeListing(listing) {
    const newListing = {
      id: "ex_" + Date.now(),
      hospitalId: listing.hospitalId || "hosp_1",
      hospitalName: listing.hospitalName || this.data.pharmacy.name,
      city: listing.city || "Mumbai",
      medicineName: listing.medicineName,
      composition: listing.composition || "",
      batchNo: listing.batchNo,
      manufacturer: listing.manufacturer || "",
      expiryDate: listing.expiryDate,
      quantityStrips: Number(listing.quantityStrips) || 1,
      unitsPerStrip: Number(listing.unitsPerStrip) || 10,
      originalMrp: Number(listing.originalMrp) || 0,
      type: listing.type || "DONATION",
      discountPercent: Number(listing.discountPercent) || 0,
      listingPricePerStrip: Number(listing.listingPricePerStrip) || 0,
      urgency: listing.urgency || "HIGH",
      notes: listing.notes || "",
      status: "AVAILABLE",
      listedDate: new Date().toISOString()
    };
    this.data.exchangeListings.unshift(newListing);
    this.save();
    return newListing;
  }

  claimExchangeListing(listingId, claimData) {
    const listing = this.data.exchangeListings.find(l => l.id === listingId);
    if (!listing) return null;
    
    listing.status = "CLAIMED";
    const claim = {
      id: "clm_" + Date.now(),
      listingId,
      claimedByHospitalId: claimData.claimedByHospitalId || "hosp_1",
      claimedByHospitalName: claimData.claimedByHospitalName || this.data.pharmacy.name,
      contactPhone: claimData.contactPhone || this.data.pharmacy.phone,
      requestDate: new Date().toISOString(),
      status: "APPROVED_DISPATCHED",
      dispatchWaybill: "VRL-EXPRESS-" + Math.floor(100000 + Math.random() * 900000),
      message: claimData.message || (listing.type === 'DONATION' ? 'Claimed for charitable healthcare donation.' : 'Purchased at discounted near-expiry liquidation rate.')
    };
    this.data.exchangeClaims.unshift(claim);
    this.save();
    return { listing, claim };
  }

  getExchangeClaims() {
    return this.data.exchangeClaims;
  }
}

module.exports = new Database();
