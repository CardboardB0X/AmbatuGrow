'use client';

import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { useInventory } from '../../context/InventoryContext';
import { 
  ClipboardList, 
  PackageCheck, 
  Users, 
  Activity, 
  CheckCircle
} from 'lucide-react';

export default function SalesWorkspace() {
  const { 
    salesOrders, 
    customers, 
    warrantyClaims, 
    addSalesOrder, 
    addCustomer, 
    addWarrantyClaim,
    salesTarget,
    totalRevenue
  } = useSales();

  const { items: inventoryItems } = useInventory();
  const [activeTab, setActiveTab] = useState<'orders' | 'crm' | 'aftersales' | 'performance'>('orders');

  // Sales Order Form States
  const [custName, setCustName] = useState('Juan Dela Cruz');
  const [custEmail, setCustEmail] = useState('juan@gmail.com');
  const [selectedSku, setSelectedSku] = useState(inventoryItems[0]?.sku || '');
  const [orderQty, setOrderQty] = useState(1);
  const [discountVal, setDiscountVal] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // CRM Form States
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [crmSuccess, setCrmSuccess] = useState(false);

  // Warranty Form States
  const [claimOrderId, setClaimOrderId] = useState('');
  const [claimSku, setClaimSku] = useState('');
  const [claimNotes, setClaimNotes] = useState('');
  const [warrantySuccess, setWarrantySuccess] = useState(false);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const product = inventoryItems.find(i => i.sku === selectedSku);
    if (!product) return;

    addSalesOrder({
      customerName: custName,
      email: custEmail,
      items: [{
        sku: selectedSku,
        name: product.name,
        qty: orderQty,
        price: product.sku === 'AGRI-SEED-042' ? 1800 : product.sku === 'AGRI-FERT-089' ? 650 : 250
      }],
      discount: discountVal,
      status: 'Processed'
    });

    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 3000);
    setOrderQty(1);
    setDiscountVal(0);
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustEmail) return;

    addCustomer({
      name: newCustName,
      email: newCustEmail,
      phone: newCustPhone,
      segment: 'Lead',
      notes: 'New CRM contact created.'
    });

    setNewCustName('');
    setNewCustEmail('');
    setNewCustPhone('');
    setCrmSuccess(true);
    setTimeout(() => setCrmSuccess(false), 3000);
  };

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimOrderId || !claimSku) return;

    addWarrantyClaim({
      orderId: claimOrderId,
      customerName: 'Customer Case',
      sku: claimSku,
      notes: claimNotes
    });

    setClaimOrderId('');
    setClaimSku('');
    setClaimNotes('');
    setWarrantySuccess(true);
    setTimeout(() => setWarrantySuccess(false), 3000);
  };

  // Sales Subnavigation tabs
  const tabs = [
    { id: 'orders' as const, label: 'Order Management', icon: ClipboardList },
    { id: 'crm' as const, label: 'CRM & Segments', icon: Users },
    { id: 'aftersales' as const, label: 'Warranty & Claims', icon: PackageCheck },
    { id: 'performance' as const, label: 'Sales Performance', icon: Activity },
  ];

  return (
    <div className="flex-1 bg-slate-50 p-6 flex flex-col min-h-0 overflow-y-auto font-sans select-none animate-slide-up-fade">
      {/* Module Title */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Sales Order Management Terminal
          </h2>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
            ITEC 75 ERP Module — Manage client quotations, order dispatch loops, and warranty registries.
          </p>
        </div>
      </div>

      {/* ── TAB SELECTION BAR (UNIFIED DESIGN) ── */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl mb-5 flex-shrink-0 border border-slate-200/40">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-white text-emerald-700 shadow-sm border border-emerald-500/10'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT CONTAINERS ── */}
      <div className="flex-grow flex flex-col min-h-[400px]">
        
        {/* ── TAB 1: ORDER MANAGEMENT ── */}
        {activeTab === 'orders' && (
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up-fade">
            {/* Orders Table */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Customer Orders Pipeline</span>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Customer Details</th>
                        <th className="p-3 text-right">Subtotal</th>
                        <th className="p-3 text-right">Tax (12% VAT)</th>
                        <th className="p-3 text-right">Total Amount</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {salesOrders.map(o => (
                        <tr key={o.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-extrabold text-slate-800">{o.id}</td>
                          <td className="p-3">
                            <div className="font-extrabold">{o.customerName}</div>
                            <div className="text-[9px] text-slate-400 font-bold">{o.email}</div>
                          </td>
                          <td className="p-3 text-right font-bold">₱{o.subtotal.toLocaleString()}</td>
                          <td className="p-3 text-right text-slate-500 font-semibold">₱{o.tax.toLocaleString()}</td>
                          <td className="p-3 text-right font-black text-slate-800">₱{o.total.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              o.status === 'Delivered' || o.status === 'Fulfilled' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Create Order Form */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Issue Sales Invoice / Quote</span>
                
                {orderSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[10px] font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>Sales order generated! Stocks reserved and invoices linked.</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Customer Name</label>
                    <input 
                      type="text" 
                      value={custName} 
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Customer Email</label>
                    <input 
                      type="email" 
                      value={custEmail} 
                      onChange={(e) => setCustEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">Product SKU</label>
                      <select 
                        value={selectedSku} 
                        onChange={(e) => setSelectedSku(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                      >
                        {inventoryItems.map(item => (
                          <option key={item.sku} value={item.sku}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">Qty</label>
                      <input 
                        type="number" 
                        value={orderQty} 
                        onChange={(e) => setOrderQty(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Discount (₱)</label>
                    <input 
                      type="number" 
                      value={discountVal} 
                      onChange={(e) => setDiscountVal(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-2 bg-[#2D6A24] hover:bg-[#23531B] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer mt-2">
                  Create Invoice Order
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── TAB 2: CRM & SEGMENTS ── */}
        {activeTab === 'crm' && (
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up-fade">
            
            {/* Customer profiles */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Client Contact & Segmentation Database</span>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-3">Client Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3 text-right">Total Purchases (₱)</th>
                        <th className="p-3 text-center">Segment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {customers.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-extrabold text-slate-800">{c.name}</td>
                          <td className="p-3 text-slate-500 font-semibold">{c.email}</td>
                          <td className="p-3 text-right font-black text-[#2D6A24]">₱{c.totalSpend.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              c.segment === 'VIP' ? 'bg-purple-50 text-purple-700 border border-purple-200/50' :
                              c.segment === 'Regular' ? 'bg-blue-50 text-blue-700 border border-blue-200/50' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {c.segment}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Create Contact Form */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Create Customer Profile</span>
                
                {crmSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[10px] font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>Customer profile created successfully in CRM.</span>
                  </div>
                )}

                <div className="space-y-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Contact Name</label>
                    <input 
                      type="text" 
                      value={newCustName} 
                      onChange={(e) => setNewCustName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Email Address</label>
                    <input 
                      type="email" 
                      value={newCustEmail} 
                      onChange={(e) => setNewCustEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Phone Number</label>
                    <input 
                      type="text" 
                      value={newCustPhone} 
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-2 bg-[#2D6A24] hover:bg-[#23531B] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer mt-2">
                  Add CRM Contact
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── TAB 3: WARRANTY & CLAIMS ── */}
        {activeTab === 'aftersales' && (
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up-fade">
            
            {/* Warranty Claims table */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Warranty Claims & Cases Registry</span>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-3">Claim ID</th>
                        <th className="p-3">Order Ref</th>
                        <th className="p-3">Product SKU</th>
                        <th className="p-3">Description / Reason</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {warrantyClaims.map(w => (
                        <tr key={w.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-extrabold text-slate-800">{w.id}</td>
                          <td className="p-3 font-bold">{w.orderId}</td>
                          <td className="p-3 text-slate-500 font-semibold">{w.sku}</td>
                          <td className="p-3 text-slate-500">{w.notes}</td>
                          <td className="p-3 text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-100/50 uppercase">
                              {w.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Claim Filing Form */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <form onSubmit={handleCreateClaim} className="space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Record Service Case</span>
                
                {warrantySuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[10px] font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>Service case recorded successfully. Case routed to support team.</span>
                  </div>
                )}

                <div className="space-y-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Linked Order ID</label>
                    <input 
                      type="text" 
                      value={claimOrderId} 
                      onChange={(e) => setClaimOrderId(e.target.value)}
                      placeholder="e.g. SO-10920"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Product SKU</label>
                    <input 
                      type="text" 
                      value={claimSku} 
                      onChange={(e) => setClaimSku(e.target.value)}
                      placeholder="e.g. AGRI-SEED-042"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Service Claim Justification</label>
                    <textarea 
                      value={claimNotes} 
                      onChange={(e) => setClaimNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-2 bg-[#2D6A24] hover:bg-[#23531B] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer mt-2">
                  File Service Claim
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── TAB 4: SALES PERFORMANCE ── */}
        {activeTab === 'performance' && (
          <div className="flex-grow flex flex-col gap-6 animate-slide-up-fade">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Progress gauge dial */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center min-h-[220px]">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 self-start">Target vs Actual Performance</span>
                
                {/* SVG Dial Progress Representation */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="50" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="10" 
                      strokeDasharray="314"
                      strokeDashoffset={(314 - (314 * Math.min(totalRevenue, salesTarget)) / salesTarget).toString()}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-slate-800">
                      {Math.round((totalRevenue / salesTarget) * 100)}%
                    </span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Reached</span>
                  </div>
                </div>
              </div>

              {/* Numerical targets cards */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Target Revenue Goal</span>
                  <span className="text-xl font-black text-slate-800">₱{salesTarget.toLocaleString()}</span>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Goal set for current fiscal quarter.</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Actual Revenues Earned</span>
                  <span className="text-xl font-black text-emerald-600">₱{totalRevenue.toLocaleString()}</span>
                  <p className="text-[10px] text-emerald-700/80 font-bold mt-1">Calculated from Synced/Delivered orders.</p>
                </div>
              </div>

              {/* Regional sales representation */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Revenues Distribution (Regions)</span>
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-700">
                      <span>Cavite Sector</span>
                      <span>₱45,000 (52%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2D6A24] rounded-full" style={{ width: '52%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-700">
                      <span>Metro Manila</span>
                      <span>₱25,000 (29%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2D6A24] rounded-full" style={{ width: '29%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
