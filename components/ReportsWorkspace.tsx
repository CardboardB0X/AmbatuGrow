'use client';

import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle, 
  Package, 
  Calendar, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export default function ReportsWorkspace() {
  const { items, searchQuery, transactions } = useInventory();

  // Mock pricing for calculating investment value
  const itemPrices: Record<string, number> = {
    'AGRI-PROD-001': 12.00,  // Honey
    'AGRI-SEED-042': 45.00,  // Seeds
    'COMP-MNT-012': 189.99,  // Monitor
    'AGRI-FERT-089': 35.00,  // Fertilizer
    'COMP-PRN-005': 249.99,  // Printer
  };

  const getPrice = (sku: string) => itemPrices[sku] || 15.00;

  // Filter items matching search
  const filteredItems = items.filter(item => 
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute metrics
  const activeItems = items.filter(i => i.status === 'Active');
  const lowStockItems = activeItems.filter(i => i.stockQty <= i.minQty);
  const outOfStockItems = activeItems.filter(i => i.stockQty === 0);
  const overstockedItems = activeItems.filter(i => i.stockQty > i.maxQty);
  const healthyItems = activeItems.filter(i => i.stockQty > i.minQty && i.stockQty <= i.maxQty);

  const totalUnits = items.reduce((sum, item) => sum + item.stockQty, 0);
  const totalInvestment = items.reduce((sum, item) => sum + (item.stockQty * getPrice(item.sku)), 0);

  // Extract FEFO Expiration timeline logs from Stock-In transactions
  const expiringBatches = transactions
    .filter(t => t.type === 'Stock-In' && t.expirationDate)
    .map(t => {
      const item = items.find(i => i.sku === t.sku);
      const expiry = new Date(t.expirationDate!);
      // Set static base date representing active session (July 1, 2026)
      const today = new Date('2026-07-01');
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...t,
        itemName: item?.name || 'Unknown Product',
        uom: item?.uom || 'units',
        daysRemaining: diffDays,
      };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6 bg-slate-50 select-none overflow-y-auto">
      
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6 flex-shrink-0">
        
        {/* Card 1: Critical Alerts */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Critical Low Stock</span>
            <span className="text-2xl font-black text-red-600 mt-1 block tabular-nums">{lowStockItems.length}</span>
            <span className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5" /> Action required
            </span>
          </div>
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Card 2: Healthy Stock */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Healthy Stock Items</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block tabular-nums">{healthyItems.length}</span>
            <span className="text-[10px] font-bold text-slate-400 mt-1">
              {Math.round((healthyItems.length / (activeItems.length || 1)) * 100)}% of active inventory
            </span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Overstocked Items */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overstocking Warnings</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block tabular-nums">{overstockedItems.length}</span>
            <span className="text-[10px] font-bold text-slate-400 mt-1">Holding excess quantities</span>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Total Value */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stock Valuation</span>
            <span className="text-xl font-black text-slate-800 mt-1 block tabular-nums">
              ₱{totalInvestment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] font-bold text-slate-400 mt-1">{totalUnits} total physical items</span>
          </div>
          <div className="p-3 bg-slate-100 border border-slate-200/60 rounded-xl text-slate-600 w-12 h-12 flex items-center justify-center font-black text-lg select-none">
            ₱
          </div>
        </div>

      </div>

      {/* Split Section Layout (FEFO Expiry + Threshold Alerts) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Left Column: FEFO Expiry Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col min-h-[300px]">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2D6A24]" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">FEFO Expiry Timeline (Alerts)</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">First-Expiry-First-Out batch telemetry</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {expiringBatches.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold p-4">
                No active expiring batches logged.
              </div>
            ) : (
              expiringBatches.map((batch) => {
                let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                let indicatorColor = 'bg-emerald-500';
                if (batch.daysRemaining <= 15) {
                  badgeClass = 'bg-red-50 text-red-700 border-red-200 animate-pulse';
                  indicatorColor = 'bg-red-600';
                } else if (batch.daysRemaining <= 45) {
                  badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                  indicatorColor = 'bg-amber-500';
                }

                return (
                  <div key={batch.id} className="p-3 bg-slate-50/60 border border-slate-150 rounded-xl flex flex-col gap-2 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${indicatorColor}`}></span>
                        <span className="font-extrabold text-slate-800 text-[11px]">{batch.sku}</span>
                      </div>
                      <span className={`px-2 py-0.5 border text-[9px] font-black uppercase rounded ${badgeClass}`}>
                        {batch.daysRemaining <= 0 ? 'Expired' : `${batch.daysRemaining} days left`}
                      </span>
                    </div>
                    
                    <div className="text-[10px] text-slate-500 font-bold leading-tight">
                      {batch.itemName} — Batch Lot Qty: <span className="text-slate-800 font-black">{batch.qty} {batch.uom}</span>
                    </div>

                    <div className="flex items-center gap-3.5 text-[9px] text-slate-400 font-bold pt-1 border-t border-slate-100 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Expiry: {batch.expirationDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Tx: #{batch.id}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Safety Threshold Alert Registry */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col min-h-[300px]">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Safety Threshold Alert Registry</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Real-time stock level boundary tracking</p>
            </div>
            <span className="text-[10px] font-extrabold bg-red-100 text-red-700 px-2 py-1 rounded-md">
              {outOfStockItems.length} Out-of-Stock
            </span>
          </div>

          <div className="flex-1 overflow-auto">
            {filteredItems.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 p-8">
                No active threshold reports match filter parameters.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-250 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">SKU</th>
                    <th className="p-4">Item Name</th>
                    <th className="p-4 text-right">Current Stock</th>
                    <th className="p-4 text-right">Min Qty</th>
                    <th className="p-4 text-right">Max Qty</th>
                    <th className="p-4 text-right">Deviation</th>
                    <th className="p-4 text-center">Alert Status</th>
                    <th className="p-4 text-right">Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredItems.map((item) => {
                    const price = getPrice(item.sku);
                    const isOutOfStock = item.stockQty === 0;
                    const isBelowMin = item.status === 'Active' && item.stockQty <= item.minQty;
                    const isOverMax = item.status === 'Active' && item.stockQty > item.maxQty;
                    
                    let rowClass = 'bg-white';
                    let statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                    let statusLabel = 'Healthy';
                    let deviation = `+${item.stockQty - item.minQty}`;
                    let deviationClass = 'text-emerald-600';

                    if (isOutOfStock) {
                      rowClass = 'bg-red-50/20 text-red-900';
                      statusBadge = 'bg-red-100 text-red-800 border-red-300 font-extrabold';
                      statusLabel = 'OUT OF STOCK';
                      deviation = `-${item.minQty}`;
                      deviationClass = 'text-red-600 font-extrabold';
                    } else if (isBelowMin) {
                      rowClass = 'bg-amber-50/20 text-amber-900';
                      statusBadge = 'bg-amber-100 text-amber-800 border-amber-300';
                      statusLabel = 'BELOW SAFETY';
                      deviation = `-${item.minQty - item.stockQty}`;
                      deviationClass = 'text-amber-600 font-extrabold';
                    } else if (isOverMax) {
                      rowClass = 'bg-blue-50/10 text-blue-900';
                      statusBadge = 'bg-blue-100 text-blue-800 border-blue-200';
                      statusLabel = 'OVERSTOCKED';
                      deviation = `+${item.stockQty - item.maxQty} (Over)`;
                      deviationClass = 'text-blue-600';
                    }

                    return (
                      <tr key={item.sku} className={`${rowClass} transition-colors hover:bg-slate-100/50`}>
                        <td className="p-4 font-extrabold text-slate-900">{item.sku}</td>
                        <td className="p-4 font-bold text-slate-800">{item.name}</td>
                        <td className="p-4 text-right font-bold tabular-nums">
                          {item.stockQty} {item.uom}
                        </td>
                        <td className="p-4 text-right tabular-nums text-slate-400">
                          {item.minQty}
                        </td>
                        <td className="p-4 text-right tabular-nums text-slate-400">
                          {item.maxQty}
                        </td>
                        <td className={`p-4 text-right font-extrabold tabular-nums ${deviationClass}`}>
                          {deviation}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 border rounded-lg text-[9px] font-extrabold uppercase tracking-wider ${statusBadge}`}>
                            {(isOutOfStock || isBelowMin) && (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                            {statusLabel}
                          </span>
                        </td>
                        <td className="p-4 text-right font-extrabold tabular-nums text-slate-800">
                          ₱{(item.stockQty * price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
