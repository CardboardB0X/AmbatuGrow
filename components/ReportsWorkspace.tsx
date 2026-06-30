'use client';

import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { AlertOctagon, AlertTriangle, CheckCircle, Package } from 'lucide-react';

export default function ReportsWorkspace() {
  const { items, searchQuery } = useInventory();

  // Mock pricing for calculating investment value (to add premium business context)
  const itemPrices: Record<string, number> = {
    'AGRI-PROD-001': 12.00,  // Honey ($12.00 / Liter)
    'AGRI-SEED-042': 45.00,  // Seeds ($45.00 / Sack)
    'COMP-MNT-012': 189.99,  // Monitor ($189.99 / Unit)
    'AGRI-FERT-009': 35.00,  // Fertilizer ($35.00 / Bag)
    'COMP-PRN-005': 249.99,  // Printer ($249.99 / Unit)
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

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6 bg-slate-50 select-none">
      
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        
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

      {/* Main Alerts Table */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">Safety Threshold Alert Registry</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Automated tracking of stock counts exceeding defined limits</p>
          </div>
          <span className="text-[10px] font-extrabold bg-red-100 text-red-700 px-2 py-1 rounded-md animate-pulse">
            {outOfStockItems.length} Out-of-Stock
          </span>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredItems.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 p-8">
              No reports available
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">SKU</th>
                  <th className="p-4">Item Name</th>
                  <th className="p-4 text-right">Current Stock</th>
                  <th className="p-4 text-right">Min Qty</th>
                  <th className="p-4 text-right">Max Qty</th>
                  <th className="p-4 text-right">Deviation</th>
                  <th className="p-4 text-center">Threshold Alert Status</th>
                  <th className="p-4 text-right">Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredItems.map((item) => {
                  const price = getPrice(item.sku);
                  const isOutOfStock = item.stockQty === 0;
                  const isBelowMin = item.status === 'Active' && item.stockQty <= item.minQty;
                  const isOverMax = item.status === 'Active' && item.stockQty > item.maxQty;
                  
                  // Row highlighting logic
                  let rowClass = 'bg-white';
                  let statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  let statusLabel = 'Healthy';
                  let deviation = `+${item.stockQty - item.minQty}`;
                  let deviationClass = 'text-emerald-600';

                  if (isOutOfStock) {
                    rowClass = 'bg-red-50 text-red-900 border-red-200';
                    statusBadge = 'bg-red-100 text-red-800 border-red-300 font-extrabold animate-pulse';
                    statusLabel = 'CRITICAL: OUT OF STOCK';
                    deviation = `-${item.minQty}`;
                    deviationClass = 'text-red-600 font-extrabold';
                  } else if (isBelowMin) {
                    rowClass = 'bg-amber-50 text-amber-900 border-amber-200';
                    statusBadge = 'bg-amber-100 text-amber-800 border-amber-300';
                    statusLabel = 'WARNING: BELOW SAFETY';
                    deviation = `-${item.minQty - item.stockQty}`;
                    deviationClass = 'text-amber-600 font-extrabold';
                  } else if (isOverMax) {
                    rowClass = 'bg-blue-50/20 text-blue-900';
                    statusBadge = 'bg-blue-100 text-blue-800 border-blue-200';
                    statusLabel = 'OVERSTOCKED';
                    deviation = `+${item.stockQty - item.maxQty} (Over)`;
                    deviationClass = 'text-blue-600';
                  }

                  return (
                    <tr key={`${item.sku}-${item.zone}`} className={`${rowClass} transition-colors hover:bg-slate-100/50`}>
                      {/* SKU */}
                      <td className="p-4 font-extrabold text-slate-900">{item.sku}</td>
                      
                      {/* Name */}
                      <td className="p-4 font-bold text-slate-800">{item.name}</td>
                      
                      {/* Current Stock */}
                      <td className="p-4 text-right font-bold tabular-nums">
                        {item.stockQty} {item.uom}
                      </td>
                      
                      {/* Min Safety Qty */}
                      <td className="p-4 text-right tabular-nums text-slate-500">
                        {item.minQty}
                      </td>
                      
                      {/* Max Safety Qty */}
                      <td className="p-4 text-right tabular-nums text-slate-500">
                        {item.maxQty}
                      </td>
                      
                      {/* Deviation */}
                      <td className={`p-4 text-right font-extrabold tabular-nums ${deviationClass}`}>
                        {deviation}
                      </td>
                      
                      {/* Alert status badge */}
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 border rounded-lg text-[9px] font-extrabold uppercase tracking-wider ${statusBadge}`}>
                          {(isOutOfStock || isBelowMin) && (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          {statusLabel}
                        </span>
                      </td>

                      {/* Valuation */}
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
  );
}
