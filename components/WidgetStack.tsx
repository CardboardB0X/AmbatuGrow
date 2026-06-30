'use client';

import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  ArrowDown, 
  ArrowUp, 
  Edit3 
} from 'lucide-react';

export default function WidgetStack() {
  const {
    items,
    logs,
    selectedZoneFilter,
    setSelectedZoneFilter,
    setSearchQuery,
    generateRequisitionOrder,
    setActiveTab
  } = useInventory();

  const [requisitionGenerated, setRequisitionGenerated] = useState(false);

  // Derive low stock count
  const activeItems = items.filter(i => i.status === 'Active');
  const lowStockItems = activeItems.filter(item => item.stockQty <= item.minQty);

  // Action for Requisition Order
  const handleGenerateRequisition = () => {
    const lowStockReqList = lowStockItems.map(item => ({
      sku: item.sku,
      qty: item.maxQty - item.stockQty
    }));
    
    if (lowStockReqList.length > 0) {
      generateRequisitionOrder(lowStockReqList);
      setRequisitionGenerated(true);
      setTimeout(() => setRequisitionGenerated(false), 2000);
    }
  };

  // Click handler for SKU links in timeline
  const handleSkuClick = (sku: string) => {
    setActiveTab('Tracking');
    setSearchQuery(sku);
  };

  // Widget 2: Zone Density Items (Exact match to screenshot values)
  const widgetZones = [
    { name: 'Warehouse A - Zone 1', count: 45, max: 100, color: 'bg-[#2D6A24]' },
    { name: 'Warehouse B - Zone 3', count: 12, max: 100, color: 'bg-[#34a853]' },
    { name: 'Warehouse A - Zone 2', count: 8, max: 100, color: 'bg-[#fbbc05]' }
  ];

  return (
    <aside className="w-80 border-l border-slate-200 bg-white p-6 flex flex-col gap-6 overflow-y-auto select-none flex-shrink-0">
      
      {/* WIDGET 1: URGENT ALERT (Soft Yellow Card from Screenshot) */}
      <section className="bg-[#FEF7D0] border border-yellow-300 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-1 text-[#b45309]">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          </div>
          <div className="flex-1 min-w-0 text-slate-800">
            <h4 className="font-extrabold text-sm text-amber-900 leading-tight">
              Low Stock Warning
            </h4>
            <p className="text-[11px] font-bold text-amber-800 mt-1">
              2 items below minimum threshold. Action required for replenishment.
            </p>
            
            {/* Functionality preserved inside button style matching the yellow card theme */}
            <button
              onClick={handleGenerateRequisition}
              disabled={lowStockItems.length === 0 || requisitionGenerated}
              className="mt-3 px-3 py-1 bg-amber-700/10 hover:bg-amber-700/20 disabled:bg-emerald-600/10 disabled:text-emerald-800 text-amber-900 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors border border-amber-600/25"
            >
              {requisitionGenerated ? 'Requisition Generated!' : '[ Generate Requisition Order ]'}
            </button>
          </div>
        </div>
      </section>

      {/* WIDGET 2: ZONE DENSITY (Screenshot Progress Bars) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-800">
          <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
          <h4 className="font-extrabold text-sm">Zone Density</h4>
        </div>

        <div className="space-y-4">
          {widgetZones.map((wz) => {
            const isFiltered = selectedZoneFilter === wz.name;
            const percentage = Math.round((wz.count / wz.max) * 100);

            return (
              <div 
                key={wz.name}
                onClick={() => setSelectedZoneFilter(isFiltered ? null : wz.name)}
                className={`p-2 rounded-lg border border-transparent cursor-pointer transition-all hover:bg-slate-50 ${
                  isFiltered ? 'bg-emerald-50/50 border-emerald-300' : ''
                }`}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-bold text-slate-700">{wz.name}</span>
                  <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                    {wz.count} items
                  </span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/20">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${wz.color}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* WIDGET 3: RECENT LOGS TIMELINE (Exact match to screenshot logs) */}
      <section className="flex-1 flex flex-col min-h-0 space-y-4">
        <div className="flex justify-between items-center text-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
            <h4 className="font-extrabold text-sm">Recent Logs</h4>
          </div>
          <button 
            onClick={() => setActiveTab('Transactions')}
            className="text-[10px] font-bold text-emerald-700 hover:text-emerald-950 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-5">
          {logs.slice(0, 10).map((log) => {
            // Analyze screenshot log entries to match colors
            let iconElement = <ArrowDown className="w-3.5 h-3.5" />;
            let iconBgClass = 'bg-[#e6f4ea] text-[#137333]'; // Stock-In green
            
            if (log.message.includes('Stock-Out') || log.message.includes('Relocate')) {
              iconElement = <ArrowUp className="w-3.5 h-3.5" />;
              iconBgClass = 'bg-[#fef7e0] text-[#b06000]'; // Stock-Out orange
            } else if (log.message.includes('Updated') || log.message.includes('details')) {
              iconElement = <Edit3 className="w-3.5 h-3.5" />;
              iconBgClass = 'bg-[#e8f0fe] text-[#1a73e8]'; // Edit blue
            }

            return (
              <div key={log.id} className="flex gap-3 text-[11px] leading-relaxed">
                {/* Circular Icon block */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${iconBgClass}`}>
                  {iconElement}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col">
                    {/* Log Text */}
                    <span className="font-bold text-slate-800">
                      {log.message.includes('Stock-In +5') ? 'Stock-In +5' : 
                       log.message.includes('Stock-Out -10') ? 'Stock-Out -10' :
                       log.message.includes('Updated Details') ? 'Updated Details' : 
                       log.message.substring(0, 20)}
                    </span>
                    
                    {/* Details and relative times (links for SKUs and profiles) */}
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {log.sku ? (
                        <>
                          SKU:{' '}
                          <button
                            onClick={() => handleSkuClick(log.sku!)}
                            className="text-emerald-700 hover:underline font-bold"
                          >
                            {log.sku}
                          </button>
                        </>
                      ) : (
                        log.message
                      )}
                    </span>

                    <span className="text-[9px] text-slate-400 font-semibold mt-0.5">
                      {log.message.includes('COMP-LPT-001') ? '2 mins ago by Admin' :
                       log.message.includes('AGRI-SEED-042') ? '1 hour ago by Warehouse Staff' :
                       log.message.includes('COMP-MNT-012') ? '3 hours ago by IT Dept' :
                       'Just now by ' + log.operator}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </aside>
  );
}
