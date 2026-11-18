// ========================================================
// MediTrackr Client Application Logic
// ========================================================

// App State
const state = {
  activeTab: 'dashboard',
  pharmacy: {},
  inventory: [],
  bills: [],
  exchangeListings: [],
  exchangeClaims: [],
  currentBillItems: [],
  activeBillForPrint: null,
  ocrParsedItems: [],
  exchangeFilter: 'ALL'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  loadPharmacy();
  loadDashboard();
  loadInventory();
  loadBillsHistory();
  loadExchangeListings();
  setupKeyboardShortcuts();
});

function initIcons() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

// -------------------------------------------------------------
// NAVIGATION & TABS
// -------------------------------------------------------------
function switchTab(tabId) {
  state.activeTab = tabId;

  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('bg-brand-50', 'dark:bg-brand-950/50', 'text-brand-800', 'dark:text-brand-400');
    btn.classList.add('text-slate-600', 'dark:text-slate-300');
  });

  const activeBtn = document.getElementById(`tabBtn-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.remove('text-slate-600', 'dark:text-slate-300');
    activeBtn.classList.add('bg-brand-50', 'dark:bg-brand-950/50', 'text-brand-800', 'dark:text-brand-400');
  }

  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.add('hidden');
  });

  const activeContent = document.getElementById(`tab-${tabId}`);
  if (activeContent) {
    activeContent.classList.remove('hidden');
  }

  initIcons();

  if (tabId === 'dashboard') loadDashboard();
  if (tabId === 'inventory') loadInventory();
  if (tabId === 'history') loadBillsHistory();
  if (tabId === 'exchange') loadExchangeListings();
}

function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
}

function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F2') {
      e.preventDefault();
      switchTab('billing');
    }
  });
}

// -------------------------------------------------------------
// 1. PHARMACY PROFILE & SETTINGS
// -------------------------------------------------------------
async function loadPharmacy() {
  try {
    const res = await fetch('/api/pharmacy');
    const data = await res.json();
    state.pharmacy = data;

    document.getElementById('headerStoreName').textContent = `${data.name} · ${data.address.split(',')[1] || 'Main Branch'}`;
    document.getElementById('dashGstin').textContent = data.gstin;
    document.getElementById('dashDlNo').textContent = data.dlNo;
    document.getElementById('dashUpiId').textContent = data.upiId;

    document.getElementById('setPharmacyName').value = data.name || '';
    document.getElementById('setDlNo').value = data.dlNo || '';
    document.getElementById('setGstin').value = data.gstin || '';
    document.getElementById('setPhone').value = data.phone || '';
    document.getElementById('setUpiId').value = data.upiId || '';
    document.getElementById('setAddress').value = data.address || '';
  } catch (err) {
    console.error("Failed to load pharmacy profile:", err);
  }
}

async function saveStoreSettings(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('setPharmacyName').value,
    dlNo: document.getElementById('setDlNo').value,
    gstin: document.getElementById('setGstin').value,
    phone: document.getElementById('setPhone').value,
    upiId: document.getElementById('setUpiId').value,
    address: document.getElementById('setAddress').value
  };

  try {
    const res = await fetch('/api/pharmacy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      alert("Pharmacy details updated successfully!");
      loadPharmacy();
    }
  } catch (err) {
    alert("Failed to save settings: " + err.message);
  }
}

// -------------------------------------------------------------
// 2. DASHBOARD
// -------------------------------------------------------------
async function loadDashboard() {
  try {
    const res = await fetch('/api/dashboard/stats');
    const data = await res.json();

    document.getElementById('statTodayRevenue').textContent = `₹${data.todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById('statTodayBills').textContent = `${data.todayBillsCount} Invoices Generated`;
    document.getElementById('statStockRetail').textContent = `₹${data.totalStockValueRetail.toLocaleString('en-IN')}`;
    document.getElementById('statStockCost').textContent = `Cost: ₹${data.totalStockValueCost.toLocaleString('en-IN')}`;
    document.getElementById('statMedicinesCount').textContent = `${data.totalMedicinesCount} Formulations`;
    document.getElementById('statNearExpiryCount').textContent = `${data.nearExpiryCount90} Batches`;
    document.getElementById('statLowStockCount').textContent = `${data.lowStockCount} Items`;

    const tbody = document.getElementById('dashNearExpiryTable');
    if (!data.nearExpiryList.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-400">All current stocks have safe expiry dates (>90 days).</td></tr>`;
    } else {
      tbody.innerHTML = data.nearExpiryList.map(item => `
        <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
          <td class="p-2.5 font-bold text-slate-900 dark:text-white">${item.name}</td>
          <td class="p-2.5 mono">${item.batchNo}</td>
          <td class="p-2.5">${item.expiryDate}</td>
          <td class="p-2.5">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${item.daysLeft <= 30 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}">
              ${item.daysLeft} days left
            </span>
          </td>
          <td class="p-2.5 font-semibold">${item.stockStrips} strips</td>
          <td class="p-2.5 text-right">
            <button onclick="prefillDonateModal('${item.name}', '${item.batchNo}', '${item.expiryDate}', ${item.stockStrips}, ${item.mrp})" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded text-[10px] font-bold shadow-sm">
              Donate / Exchange &rarr;
            </button>
          </td>
        </tr>
      `).join('');
    }

    initIcons();
  } catch (err) {
    console.error("Failed to load dashboard:", err);
  }
}

// -------------------------------------------------------------
// 3. COUNTER BILLING (POS)
// -------------------------------------------------------------
function handleMedicineSearch(query) {
  const container = document.getElementById('posSearchResults');
  if (!query || query.trim().length < 1) {
    container.classList.add('hidden');
    return;
  }

  const q = query.toLowerCase().trim();
  const matched = state.inventory.filter(m => 
    m.name.toLowerCase().includes(q) || 
    (m.composition && m.composition.toLowerCase().includes(q))
  );

  if (!matched.length) {
    container.innerHTML = `<div class="p-3 text-xs text-slate-400 text-center">No matching medicines found in catalog.</div>`;
    container.classList.remove('hidden');
    return;
  }

  container.innerHTML = matched.map(m => `
    <div class="p-3 hover:bg-brand-50/60 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition"
         onclick="selectMedicineForBill('${m.id}')">
      <div>
        <p class="text-xs font-bold text-slate-900 dark:text-white">${m.name}</p>
        <p class="text-[10px] text-slate-500">${m.composition || 'General'} · Location: ${m.shelfLocation}</p>
      </div>
      <div class="text-right">
        <p class="text-xs font-bold text-brand-800 dark:text-brand-400">Stock: ${m.totalStrips} strips</p>
        <p class="text-[10px] text-slate-400">${m.batches.length} batch(es)</p>
      </div>
    </div>
  `).join('');

  container.classList.remove('hidden');
}

function selectMedicineForBill(medId) {
  const med = state.inventory.find(m => m.id === medId);
  if (!med) return;

  document.getElementById('posSearchResults').classList.add('hidden');
  document.getElementById('posMedicineSearch').value = '';

  const batch = med.batches[0] || {
    batchNo: "GEN-" + Math.floor(1000 + Math.random() * 9000),
    expiryDate: "2027-12-31",
    sellingPrice: 50.00,
    mrp: 55.00
  };

  state.currentBillItems.push({
    medicineId: med.id,
    name: med.name,
    batchNo: batch.batchNo,
    expiryDate: batch.expiryDate,
    unit: 'strip',
    unitsPerStrip: med.unitsPerStrip || 10,
    quantity: 1,
    rate: Number(batch.sellingPrice) || Number(batch.mrp) || 50,
    gstRate: Number(med.gstRate) || 12,
    availableBatches: med.batches
  });

  renderBillTable();
  calculateBillTotals();
}

function renderBillTable() {
  const tbody = document.getElementById('posBillTableBody');
  if (!state.currentBillItems.length) {
    tbody.innerHTML = `
      <tr id="emptyBillRow">
        <td colspan="9" class="p-8 text-center text-slate-400">
          No medicines added yet. Search above or click "Scan Photo" to auto-import a prescription.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = state.currentBillItems.map((item, idx) => {
    const itemTotal = (item.quantity * item.rate).toFixed(2);
    return `
      <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
        <td class="p-3 text-slate-400">${idx + 1}</td>
        <td class="p-3 font-bold text-slate-900 dark:text-white">${item.name}</td>
        <td class="p-3 mono">
          <span class="font-semibold">${item.batchNo}</span>
          <span class="text-[10px] text-slate-400 block">Exp: ${item.expiryDate}</span>
        </td>
        <td class="p-3">
          <select onchange="changeItemUnit(${idx}, this.value)" class="px-2 py-1 bg-slate-50 dark:bg-slate-900 border rounded text-xs">
            <option value="strip" ${item.unit === 'strip' ? 'selected' : ''}>Strip (${item.unitsPerStrip} tabs)</option>
            <option value="tablet" ${item.unit === 'tablet' ? 'selected' : ''}>Loose Tablet</option>
          </select>
        </td>
        <td class="p-3">
          <input type="number" min="1" value="${item.quantity}" onchange="changeItemQty(${idx}, this.value)"
            class="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-900 border rounded text-center font-bold">
        </td>
        <td class="p-3 font-semibold">₹${item.rate.toFixed(2)}</td>
        <td class="p-3 text-slate-500">${item.gstRate}%</td>
        <td class="p-3 font-bold text-brand-800 dark:text-brand-400">₹${itemTotal}</td>
        <td class="p-3 text-center">
          <button onclick="removeBillItem(${idx})" class="text-rose-500 hover:text-rose-700 p-1">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  initIcons();
}

function changeItemQty(idx, val) {
  if (state.currentBillItems[idx]) {
    state.currentBillItems[idx].quantity = Math.max(1, Number(val) || 1);
    renderBillTable();
    calculateBillTotals();
  }
}

function changeItemUnit(idx, unit) {
  const item = state.currentBillItems[idx];
  if (!item) return;

  if (unit === 'tablet') {
    item.unit = 'tablet';
    item.rate = Number((item.rate / item.unitsPerStrip).toFixed(2));
  } else {
    item.unit = 'strip';
    item.rate = Number((item.rate * item.unitsPerStrip).toFixed(2));
  }

  renderBillTable();
  calculateBillTotals();
}

function removeBillItem(idx) {
  state.currentBillItems.splice(idx, 1);
  renderBillTable();
  calculateBillTotals();
}

function clearBillItems() {
  state.currentBillItems = [];
  renderBillTable();
  calculateBillTotals();
}

function calculateBillTotals() {
  let subtotal = 0;
  let taxEstimate = 0;

  state.currentBillItems.forEach(item => {
    const itemTotal = item.quantity * item.rate;
    subtotal += itemTotal;
    taxEstimate += (itemTotal * (item.gstRate || 12)) / 100;
  });

  const discPct = Number(document.getElementById('posDiscountPct').value) || 0;
  const discountAmount = (subtotal * discPct) / 100;
  const taxableAmount = subtotal - discountAmount;
  const grandTotal = Math.round(taxableAmount + taxEstimate);

  document.getElementById('posSubtotal').textContent = `₹${subtotal.toFixed(2)}`;
  document.getElementById('posTaxAmount').textContent = `₹${taxEstimate.toFixed(2)}`;
  document.getElementById('posGrandTotal').textContent = `₹${grandTotal.toFixed(2)}`;
}

async function submitBillAndPrint() {
  if (!state.currentBillItems.length) {
    alert("Please add at least one medicine to the invoice.");
    return;
  }

  const customerName = document.getElementById('posCustomerName').value;
  const customerPhone = document.getElementById('posCustomerPhone').value;
  const doctorName = document.getElementById('posDoctorName').value;
  const discountPercent = Number(document.getElementById('posDiscountPct').value) || 0;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Cash';

  const payload = {
    customerName,
    customerPhone,
    doctorName,
    items: state.currentBillItems,
    discountPercent,
    paymentMethod
  };

  try {
    const res = await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      state.activeBillForPrint = result.bill;
      openPrintModal(result.bill);
      clearBillItems();
      loadDashboard();
      loadInventory();
      loadBillsHistory();
    }
  } catch (err) {
    alert("Invoice generation failed: " + err.message);
  }
}

// -------------------------------------------------------------
// PRINT MODAL & FORMAT RENDERING
// -------------------------------------------------------------
async function openPrintModal(bill) {
  state.activeBillForPrint = bill;
  const format = document.getElementById('printFormatSelect').value;
  await renderPrintLayout(bill, format);
  document.getElementById('printModal').classList.remove('hidden');
  initIcons();
}

function closePrintModal() {
  document.getElementById('printModal').classList.add('hidden');
}

async function togglePrintFormat(format) {
  if (state.activeBillForPrint) {
    await renderPrintLayout(state.activeBillForPrint, format);
  }
}

async function renderPrintLayout(bill, format = 'A4') {
  const container = document.getElementById('printModalContainer');
  const pharmacy = state.pharmacy;

  let qrImgTag = '';
  try {
    const qrRes = await fetch(`/api/billing/upi-qr?amount=${bill.grandTotal}&invoiceNo=${bill.invoiceNo}`);
    const qrData = await qrRes.json();
    if (qrData.success) {
      qrImgTag = `<img src="${qrData.qrDataUrl}" alt="UPI QR" class="w-24 h-24 mx-auto border p-1 rounded">`;
    }
  } catch (e) {
    console.error("UPI QR fetch error:", e);
  }

  const waMsg = encodeURIComponent(
    `Hello ${bill.customerName},\nThank you for choosing ${pharmacy.name}!\n` +
    `Your Invoice: ${bill.invoiceNo}\n` +
    `Total Amount: ₹${bill.grandTotal}\n` +
    `Payment Mode: ${bill.paymentMethod} (PAID)\n` +
    `Prescription by: ${bill.doctorName}\n` +
    `Wishing you good health!`
  );
  const waLink = `https://wa.me/${(bill.customerPhone || '').replace(/\D/g, '')}?text=${waMsg}`;
  document.getElementById('printWhatsAppLink').href = waLink;

  if (format === 'thermal') {
    container.innerHTML = `
      <div class="max-w-[320px] mx-auto text-[11px] mono space-y-2 border-b-2 border-dashed pb-4">
        <div class="text-center">
          <p class="font-bold text-sm tracking-tight">${pharmacy.name.toUpperCase()}</p>
          <p class="text-[9px] text-slate-600">${pharmacy.address}</p>
          <p class="text-[9px]">Ph: ${pharmacy.phone} | DL: ${pharmacy.dlNo}</p>
          <p class="text-[9px]">GSTIN: ${pharmacy.gstin}</p>
          <p class="border-y border-dashed py-1 my-1 font-bold">TAX INVOICE / CASH MEMO</p>
        </div>

        <div class="space-y-0.5 text-[10px]">
          <div class="flex justify-between"><span>Inv: ${bill.invoiceNo}</span><span>Date: ${new Date(bill.date).toLocaleDateString()}</span></div>
          <div class="flex justify-between"><span>Pt: ${bill.customerName}</span><span>Dr: ${bill.doctorName}</span></div>
          <div>Phone: ${bill.customerPhone || 'N/A'}</div>
        </div>

        <div class="border-t border-dashed pt-1">
          <table class="w-full text-left text-[10px]">
            <thead>
              <tr class="border-b border-dashed">
                <th>Item</th>
                <th>Qty</th>
                <th class="text-right">Amt(₹)</th>
              </tr>
            </thead>
            <tbody>
              ${bill.items.map(it => `
                <tr>
                  <td>${it.name.substring(0, 16)}<br><span class="text-[8px]">${it.batchNo}</span></td>
                  <td>${it.quantity} ${it.unit[0]}</td>
                  <td class="text-right">${it.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="border-t border-dashed pt-1 space-y-0.5 text-[10px]">
          <div class="flex justify-between"><span>Subtotal:</span><span>₹${bill.subtotal.toFixed(2)}</span></div>
          ${bill.discountAmount > 0 ? `<div class="flex justify-between"><span>Disc (${bill.discountPercent}%):</span><span>-₹${bill.discountAmount.toFixed(2)}</span></div>` : ''}
          <div class="flex justify-between"><span>CGST + SGST:</span><span>₹${(bill.cgst + bill.sgst).toFixed(2)}</span></div>
          <div class="flex justify-between font-bold text-xs pt-1 border-t"><span>GRAND TOTAL:</span><span>₹${bill.grandTotal.toFixed(2)}</span></div>
          <div class="text-center pt-1 font-bold">PAID VIA ${bill.paymentMethod.toUpperCase()}</div>
        </div>

        <div class="text-center pt-2">
          ${qrImgTag}
          <p class="text-[8px] mt-1">Scan via GPay / PhonePe / Paytm</p>
          <p class="text-[8px] mt-2 italic">Take medicines as advised by doctor.<br>Get well soon!</p>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="space-y-4 text-xs">
        <div class="flex justify-between items-start border-b pb-4">
          <div>
            <h1 class="text-xl font-bold text-brand-900 tracking-tight">${pharmacy.name}</h1>
            <p class="text-slate-600">${pharmacy.address}</p>
            <p class="text-slate-500">Phone: ${pharmacy.phone} · Email: ${pharmacy.email}</p>
            <div class="mt-1 flex gap-3 text-[11px] font-semibold">
              <span class="bg-slate-100 px-2 py-0.5 rounded">DL No: ${pharmacy.dlNo}</span>
              <span class="bg-slate-100 px-2 py-0.5 rounded">GSTIN: ${pharmacy.gstin}</span>
            </div>
          </div>
          <div class="text-right">
            <span class="px-3 py-1 bg-brand-800 text-white font-bold text-xs rounded uppercase">GST Tax Invoice</span>
            <p class="font-extrabold text-sm text-slate-800 mt-2">${bill.invoiceNo}</p>
            <p class="text-slate-500 text-[11px]">${new Date(bill.date).toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg text-xs">
          <div>
            <p class="font-bold text-slate-500 uppercase text-[10px]">Patient / Customer Details:</p>
            <p class="font-bold text-slate-900 text-sm">${bill.customerName}</p>
            <p class="text-slate-600">Mobile: ${bill.customerPhone || 'N/A'}</p>
          </div>
          <div class="text-right">
            <p class="font-bold text-slate-500 uppercase text-[10px]">Prescription Reference:</p>
            <p class="font-bold text-slate-900">${bill.doctorName}</p>
            <p class="text-slate-600">Payment Status: <strong class="text-emerald-700 font-bold">${bill.paymentStatus} (${bill.paymentMethod})</strong></p>
          </div>
        </div>

        <table class="w-full text-left text-xs border border-slate-200">
          <thead class="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px]">
            <tr class="border-b">
              <th class="p-2.5">#</th>
              <th class="p-2.5">Medicine Description</th>
              <th class="p-2.5">Batch</th>
              <th class="p-2.5">Exp Date</th>
              <th class="p-2.5">Qty</th>
              <th class="p-2.5">Rate (₹)</th>
              <th class="p-2.5">GST%</th>
              <th class="p-2.5 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${bill.items.map((it, idx) => `
              <tr>
                <td class="p-2.5">${idx + 1}</td>
                <td class="p-2.5 font-bold">${it.name}</td>
                <td class="p-2.5 mono">${it.batchNo}</td>
                <td class="p-2.5">${it.expiryDate}</td>
                <td class="p-2.5">${it.quantity} ${it.unit}</td>
                <td class="p-2.5">₹${it.rate.toFixed(2)}</td>
                <td class="p-2.5">${it.gstRate}%</td>
                <td class="p-2.5 text-right font-semibold">₹${it.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="grid grid-cols-2 gap-4 items-center pt-2">
          <div class="flex items-center gap-4">
            ${qrImgTag}
            <div class="text-[11px] text-slate-500">
              <p class="font-bold text-slate-800">Scan to verify or pay via UPI</p>
              <p>UPI ID: ${pharmacy.upiId}</p>
              <p class="mt-1 text-[10px] text-slate-400">Terms: Medicines once sold will be taken back only as per D&C rules.</p>
            </div>
          </div>

          <div class="space-y-1 text-xs text-right">
            <div class="flex justify-between"><span>Subtotal:</span><span>₹${bill.subtotal.toFixed(2)}</span></div>
            ${bill.discountAmount > 0 ? `<div class="flex justify-between text-rose-600"><span>Discount (${bill.discountPercent}%):</span><span>-₹${bill.discountAmount.toFixed(2)}</span></div>` : ''}
            <div class="flex justify-between"><span>CGST:</span><span>₹${bill.cgst.toFixed(2)}</span></div>
            <div class="flex justify-between"><span>SGST:</span><span>₹${bill.sgst.toFixed(2)}</span></div>
            <div class="flex justify-between font-extrabold text-base pt-2 border-t text-brand-900">
              <span>Grand Total:</span><span>₹${bill.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="pt-8 border-t flex justify-between items-end text-[10px] text-slate-500">
          <div>
            <p>Generated via MediTrackr Pharmacy Management System</p>
          </div>
          <div class="text-center">
            <p class="w-48 border-b border-slate-400 mb-1"></p>
            <p class="font-bold">Authorized Signatory / Registered Pharmacist</p>
          </div>
        </div>
      </div>
    `;
  }
}

// -------------------------------------------------------------
// 4. INVENTORY MANAGEMENT
// -------------------------------------------------------------
async function loadInventory() {
  try {
    const res = await fetch('/api/inventory');
    const data = await res.json();
    state.inventory = data;
    filterInventoryTable();
  } catch (err) {
    console.error("Failed to load inventory:", err);
  }
}

function filterInventoryTable() {
  const search = (document.getElementById('invSearchInput').value || '').toLowerCase().trim();
  const cat = document.getElementById('invFilterCategory').value;

  let filtered = state.inventory;

  if (search) {
    filtered = filtered.filter(m => 
      m.name.toLowerCase().includes(search) || 
      (m.composition && m.composition.toLowerCase().includes(search)) ||
      (m.manufacturer && m.manufacturer.toLowerCase().includes(search))
    );
  }

  if (cat === 'LOW_STOCK') {
    filtered = filtered.filter(m => m.isLowStock);
  } else if (cat === 'NEAR_EXPIRY') {
    filtered = filtered.filter(m => m.batches.some(b => b.expiryStatus === 'WARNING' || b.expiryStatus === 'CRITICAL'));
  } else if (cat === 'EXPIRED') {
    filtered = filtered.filter(m => m.batches.some(b => b.expiryStatus === 'EXPIRED'));
  }

  renderInventoryTable(filtered);
}

function renderInventoryTable(items) {
  const tbody = document.getElementById('inventoryTableBody');
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">No medicines matched the filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(m => `
    <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
      <td class="p-3">
        <p class="font-bold text-slate-900 dark:text-white">${m.name}</p>
        <span class="text-[10px] text-slate-400">${m.manufacturer || 'Indian Pharma'} · HSN: ${m.hsn} · GST: ${m.gstRate}%</span>
      </td>
      <td class="p-3 text-slate-600 dark:text-slate-300 font-medium">${m.composition || '—'}</td>
      <td class="p-3">
        <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
          ${m.shelfLocation}
        </span>
      </td>
      <td class="p-3">
        <span class="font-bold ${m.isLowStock ? 'text-rose-600' : 'text-emerald-700 dark:text-emerald-400'}">
          ${m.totalStrips} strips
        </span>
        <span class="text-[10px] text-slate-400 block">(${m.totalTablets} tablets)</span>
      </td>
      <td class="p-3 space-y-1">
        ${m.batches.map(b => {
          let badge = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
          if (b.expiryStatus === 'CRITICAL') badge = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
          if (b.expiryStatus === 'WARNING') badge = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
          if (b.expiryStatus === 'EXPIRED') badge = 'bg-slate-200 text-slate-800 line-through';
          return `
            <div class="flex items-center gap-2 text-[10px]">
              <span class="mono font-semibold">${b.batchNo}</span>
              <span class="px-1.5 py-0.2 rounded font-bold ${badge}">${b.expiryDate} (${b.daysLeft}d)</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300">₹${b.mrp}</span>
            </div>
          `;
        }).join('')}
      </td>
      <td class="p-3 text-right">
        <button onclick="openAddBatchModal('${m.id}', '${m.name}')" class="px-2.5 py-1 bg-brand-800 hover:bg-brand-700 text-white rounded font-bold text-[10px] shadow-sm">
          + Batch
        </button>
      </td>
    </tr>
  `).join('');

  initIcons();
}

function openAddMedicineModal() {
  document.getElementById('addMedicineModal').classList.remove('hidden');
}
function closeAddMedicineModal() {
  document.getElementById('addMedicineModal').classList.add('hidden');
}

async function submitNewMedicine(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('newMedName').value,
    composition: document.getElementById('newMedComp').value,
    manufacturer: document.getElementById('newMedMfr').value,
    shelfLocation: document.getElementById('newMedRack').value,
    gstRate: document.getElementById('newMedGst').value,
    hsn: document.getElementById('newMedHsn').value,
    unitsPerStrip: document.getElementById('newMedUnitsPerStrip').value,
    initialBatch: {
      batchNo: document.getElementById('newBatchNo').value,
      expiryDate: document.getElementById('newBatchExp').value,
      mrp: document.getElementById('newBatchMrp').value,
      costPrice: document.getElementById('newBatchCost').value,
      stockStrips: document.getElementById('newBatchQty').value
    }
  };

  try {
    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      closeAddMedicineModal();
      loadInventory();
      loadDashboard();
    }
  } catch (err) {
    alert("Failed to add medicine: " + err.message);
  }
}

function openAddBatchModal(medId, medName) {
  document.getElementById('addBatchMedId').value = medId;
  document.getElementById('addBatchMedTitle').textContent = medName;
  document.getElementById('addBatchModal').classList.remove('hidden');
}
function closeAddBatchModal() {
  document.getElementById('addBatchModal').classList.add('hidden');
}

async function submitNewBatch(e) {
  e.preventDefault();
  const medId = document.getElementById('addBatchMedId').value;
  const payload = {
    batchNo: document.getElementById('abBatchNo').value,
    expiryDate: document.getElementById('abExpiryDate').value,
    mrp: document.getElementById('abMrp').value,
    costPrice: document.getElementById('abCost').value,
    sellingPrice: document.getElementById('abSelling').value,
    stockStrips: document.getElementById('abStrips').value
  };

  try {
    const res = await fetch(`/api/inventory/${medId}/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      closeAddBatchModal();
      loadInventory();
      loadDashboard();
    }
  } catch (err) {
    alert("Failed to add batch: " + err.message);
  }
}

// -------------------------------------------------------------
// 5. SCAN PHOTO (OCR)
// -------------------------------------------------------------
async function handleOcrFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('photo', file);

  try {
    const res = await fetch('/api/ocr/scan', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      processOcrResult(data);
    }
  } catch (err) {
    alert("OCR Processing failed: " + err.message);
  }
}

async function simulateCameraScan() {
  try {
    const res = await fetch('/api/ocr/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: "Rx:\n1. Tab Dolo 650mg - 2 strips (1x3 after food)\n2. Tab Augmentin 625 Duo - 1 strip (1x2)\n3. Tab Pantocid 40mg - 1 strip (OD before breakfast)\nDr. V. K. Mehta (MD Internal Medicine)\nPatient: Arjun Verma, Ph: 9820011223"
      })
    });
    const data = await res.json();
    if (data.success) {
      processOcrResult(data);
    }
  } catch (err) {
    alert("OCR scan error: " + err.message);
  }
}

function processOcrResult(data) {
  document.getElementById('ocrRawText').value = data.rawText;
  state.ocrParsedItems = data.extractedItems;

  const tbody = document.getElementById('ocrParsedItemsBody');
  if (!data.extractedItems.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-slate-400">No recognizable medicines extracted from image.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.extractedItems.map((item, idx) => `
    <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
      <td class="p-3 font-bold text-slate-900 dark:text-white">${item.name}</td>
      <td class="p-3 text-slate-600 dark:text-slate-300">${item.composition || '—'}</td>
      <td class="p-3 mono">${item.batchNo}</td>
      <td class="p-3 font-bold">${item.quantity} ${item.unit}</td>
      <td class="p-3">₹${item.rate.toFixed(2)}</td>
      <td class="p-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
          ${Math.round(item.confidence * 100)}% Match
        </span>
      </td>
      <td class="p-3 text-center">
        <button onclick="removeOcrItem(${idx})" class="text-rose-500 hover:text-rose-700">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    </tr>
  `).join('');

  initIcons();
}

function removeOcrItem(idx) {
  state.ocrParsedItems.splice(idx, 1);
  processOcrResult({ rawText: document.getElementById('ocrRawText').value, extractedItems: state.ocrParsedItems });
}

function pushOcrItemsToBill() {
  if (!state.ocrParsedItems.length) {
    alert("No extracted medicines to send.");
    return;
  }

  state.ocrParsedItems.forEach(item => {
    state.currentBillItems.push({
      medicineId: item.medicineId,
      name: item.name,
      batchNo: item.batchNo,
      expiryDate: item.expiryDate,
      unit: item.unit || 'strip',
      unitsPerStrip: 10,
      quantity: item.quantity || 1,
      rate: item.rate,
      gstRate: 12,
      availableBatches: []
    });
  });

  switchTab('billing');
  renderBillTable();
  calculateBillTotals();
}

// -------------------------------------------------------------
// 6. INTER-HOSPITAL NEAR-EXPIRY DONATION & EXCHANGE HUB
// -------------------------------------------------------------
async function loadExchangeListings() {
  try {
    const res = await fetch('/api/exchange/listings');
    const data = await res.json();
    state.exchangeListings = data;
    renderExchangeListings();

    const claimsRes = await fetch('/api/exchange/claims');
    const claimsData = await claimsRes.json();
    state.exchangeClaims = claimsData;
    renderExchangeClaims();
  } catch (err) {
    console.error("Failed to load exchange listings:", err);
  }
}

function filterExchangeListings(filterType) {
  state.exchangeFilter = filterType;

  ['ALL', 'DONATION', 'SALE'].forEach(f => {
    const btn = document.getElementById(`btnExFilter-${f}`);
    if (f === filterType) {
      btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200";
    } else {
      btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700";
    }
  });

  renderExchangeListings();
}

function renderExchangeListings() {
  const container = document.getElementById('exchangeCardsGrid');
  let items = state.exchangeListings;

  if (state.exchangeFilter !== 'ALL') {
    items = items.filter(l => l.type === state.exchangeFilter);
  }

  if (!items.length) {
    container.innerHTML = `<div class="col-span-3 p-12 text-center text-slate-400">No active exchange listings found.</div>`;
    return;
  }

  container.innerHTML = items.map(item => {
    const isDonation = item.type === 'DONATION';
    const isClaimed = item.status === 'CLAIMED';

    return `
      <div class="bg-white dark:bg-slate-800 rounded-xl border ${isDonation ? 'border-rose-200 dark:border-rose-900/50' : 'border-amber-200 dark:border-amber-900/50'} shadow-sm p-5 space-y-4 flex flex-col justify-between">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isDonation ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}">
              ${isDonation ? '🎁 100% FREE DONATION' : `🏷️ ${item.discountPercent}% OFF LIQUIDATION`}
            </span>
            <span class="text-[11px] font-semibold text-slate-400">Exp: ${item.expiryDate}</span>
          </div>

          <h3 class="text-base font-bold text-slate-900 dark:text-white leading-snug">${item.medicineName}</h3>
          <p class="text-xs text-slate-500">${item.composition || 'General Formulation'}</p>

          <div class="pt-2 border-t border-slate-100 dark:border-slate-700 text-xs space-y-1">
            <div class="flex justify-between">
              <span class="text-slate-500">Offering Hospital:</span>
              <span class="font-bold text-slate-800 dark:text-slate-200">${item.hospitalName}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Location:</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300">${item.city}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Surplus Quantity:</span>
              <span class="font-bold text-brand-800 dark:text-brand-400">${item.quantityStrips} Strips (Batch: ${item.batchNo})</span>
            </div>
            <div class="flex justify-between items-baseline pt-1">
              <span class="text-slate-500">Price / Strip:</span>
              <div>
                ${isDonation ? '<span class="text-base font-extrabold text-rose-600">FREE</span>' : `
                  <span class="line-through text-slate-400 mr-1 text-[11px]">₹${item.originalMrp}</span>
                  <span class="text-base font-extrabold text-amber-600">₹${item.listingPricePerStrip}</span>
                `}
              </div>
            </div>
          </div>

          ${item.notes ? `<p class="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-900/60 p-2 rounded">"${item.notes}"</p>` : ''}
        </div>

        <div>
          ${isClaimed ? `
            <button disabled class="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-400 text-xs font-bold cursor-not-allowed">
              ✓ Claimed / Dispatched
            </button>
          ` : `
            <button onclick="claimMedicineLot('${item.id}', '${item.type}')" class="w-full py-2.5 rounded-lg ${isDonation ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'} text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5">
              <i data-lucide="${isDonation ? 'gift' : 'shopping-bag'}" class="w-4 h-4"></i>
              <span>${isDonation ? 'Claim Free Donation For Hospital' : 'Order Discounted Stock'}</span>
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');

  initIcons();
}

function renderExchangeClaims() {
  const tbody = document.getElementById('exchangeClaimsTableBody');
  if (!state.exchangeClaims.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-400">No transfer waybills generated yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.exchangeClaims.map(c => `
    <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
      <td class="p-3 mono font-semibold text-brand-800 dark:text-brand-400">${c.id}</td>
      <td class="p-3 font-bold">${c.message}</td>
      <td class="p-3">${c.claimedByHospitalName}</td>
      <td class="p-3 text-slate-500">${new Date(c.requestDate).toLocaleDateString()}</td>
      <td class="p-3 mono font-bold text-amber-600 dark:text-amber-400">${c.dispatchWaybill}</td>
      <td class="p-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
          ${c.status}
        </span>
      </td>
    </tr>
  `).join('');

  initIcons();
}

async function claimMedicineLot(listingId, type) {
  const isDonation = type === 'DONATION';
  const confirmMsg = isDonation
    ? "Are you sure you want to claim this free medicine lot for your hospital dispensary?"
    : "Proceed to order this discounted near-expiry stock from the supplier hospital?";

  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch(`/api/exchange/listings/${listingId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hospitalName: state.pharmacy.name,
        contactPhone: state.pharmacy.phone
      })
    });
    const result = await res.json();
    if (result.success) {
      alert(`Success! ${result.message}\nDispatch Waybill: ${result.claim.dispatchWaybill}`);
      loadExchangeListings();
      loadDashboard();
    }
  } catch (err) {
    alert("Claim failed: " + err.message);
  }
}

function openDonateModal() {
  document.getElementById('donateModal').classList.remove('hidden');
}
function closeDonateModal() {
  document.getElementById('donateModal').classList.add('hidden');
}

function toggleListingTypeFields(type) {
  const container = document.getElementById('exSalePriceContainer');
  if (type === 'SALE') {
    container.classList.remove('hidden');
  } else {
    container.classList.add('hidden');
  }
}

function prefillDonateModal(medName, batchNo, expiryDate, qty, mrp) {
  document.getElementById('exMedName').value = medName;
  document.getElementById('exBatchNo').value = batchNo;
  document.getElementById('exExpiryDate').value = expiryDate;
  document.getElementById('exQtyStrips').value = qty;
  document.getElementById('exOriginalMrp').value = mrp;
  openDonateModal();
}

async function submitExchangeListing(e) {
  e.preventDefault();
  const type = document.querySelector('input[name="listingType"]:checked').value;
  const payload = {
    type,
    medicineName: document.getElementById('exMedName').value,
    batchNo: document.getElementById('exBatchNo').value,
    expiryDate: document.getElementById('exExpiryDate').value,
    quantityStrips: document.getElementById('exQtyStrips').value,
    originalMrp: document.getElementById('exOriginalMrp').value,
    listingPricePerStrip: document.getElementById('exSalePrice').value,
    notes: document.getElementById('exNotes').value
  };

  try {
    const res = await fetch('/api/exchange/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      alert("Medicine lot published successfully to the hospital network!");
      closeDonateModal();
      loadExchangeListings();
      loadDashboard();
    }
  } catch (err) {
    alert("Publish failed: " + err.message);
  }
}

// -------------------------------------------------------------
// 7. BILLS HISTORY
// -------------------------------------------------------------
async function loadBillsHistory() {
  try {
    const res = await fetch('/api/bills');
    const data = await res.json();
    state.bills = data;

    const tbody = document.getElementById('billsHistoryTableBody');
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="p-6 text-center text-slate-400">No invoices generated yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(bill => `
      <tr class="hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
        <td class="p-3 mono font-bold text-brand-800 dark:text-brand-400">${bill.invoiceNo}</td>
        <td class="p-3 text-slate-500">${new Date(bill.date).toLocaleString('en-IN')}</td>
        <td class="p-3 font-semibold text-slate-900 dark:text-white">${bill.customerName}</td>
        <td class="p-3 text-slate-500">${bill.customerPhone || '—'}</td>
        <td class="p-3">${bill.items.length} items</td>
        <td class="p-3 font-medium">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            ${bill.paymentMethod}
          </span>
        </td>
        <td class="p-3 font-bold text-slate-900 dark:text-white">₹${bill.grandTotal.toFixed(2)}</td>
        <td class="p-3 text-right">
          <button onclick="reprintBill('${bill.id}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded text-xs font-semibold">
            Print &rarr;
          </button>
        </td>
      </tr>
    `).join('');

    initIcons();
  } catch (err) {
    console.error("Failed to load bills history:", err);
  }
}

function reprintBill(billId) {
  const bill = state.bills.find(b => b.id === billId);
  if (bill) {
    openPrintModal(bill);
  }
}
