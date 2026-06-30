'use client';

import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { Warehouse, ArrowLeftRight } from 'lucide-react';

export default function LocationsWorkspace() {
  const { zones, items, setIsTransferOpen, setTransferSku } = useInventory();

  const handleOpenTransfer = (sku?: string) => {
    setTransferSku(sku || null);
    setIsTransferOpen(true);
  };

  // Group items by zone for display in the cards
  const getItemsInZone = (zoneName: string) => {
    return items.filter(item => item.zone === zoneName);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6 bg-slate-50">
      
      {/* Top Controls */}
      <div className="flex justify-between items-center mb-5 select-none">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800">Multi-Warehouse Allocation Hub</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">Monitor current capacities and execute stock relocation orders</p>
        </div>
        <button
          onClick={() => handleOpenTransfer()}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 shadow-md shadow-emerald-700/10 hover:shadow-emerald-700/20 active:scale-95 animate-pulse"
        >
          <ArrowLeftRight className="w-4 h-4 stroke-[3]" /> Initiate Stock Transfer Wizard
        </button>
      </div>

      {/* Grid of Location Cards */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((zone) => {
            const zoneItems = getItemsInZone(zone.name);
            const fillPercentage = Math.min(100, Math.round((zone.currentOccupancy / zone.maxCapacity) * 100));
            
            // Dynamic color coding for occupancy
            let progressColor = 'bg-emerald-500';
            let progressBg = 'bg-emerald-100';
            let textColor = 'text-emerald-700';
            if (fillPercentage >= 90) {
              progressColor = 'bg-red-500';
              progressBg = 'bg-red-100';
              textColor = 'text-red-700 font-black animate-pulse';
            } else if (fillPercentage >= 70) {
              progressColor = 'bg-amber-500';
              progressBg = 'bg-amber-100';
              textColor = 'text-amber-700';
            }

            return (
              <div 
                key={zone.name}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all overflow-hidden flex flex-col h-[280px]"
              >
                {/* Card Header */}
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-slate-100 border border-slate-200/60 rounded-xl text-slate-600">
                      <Warehouse className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 leading-tight">
                        {zone.name.split(' - ')[0]}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400">
                        {zone.name.split(' - ')[1]}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${progressBg} ${textColor}`}>
                    {fillPercentage}% Filled
                  </span>
                </div>

                {/* Card Body - Occupancy Stats */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Capacity details */}
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Occupancy Density</span>
                      <span className="text-xs font-extrabold text-slate-700 tabular-nums">
                        {zone.currentOccupancy} <span className="text-[10px] font-normal text-slate-400">/ {zone.maxCapacity} items</span>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden border border-slate-200/20">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${fillPercentage}%` }}
                      ></div>
                    </div>

                    {/* Items List Inside Zone */}
                    <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Allocated Assets</p>
                      {zoneItems.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">No assets allocated currently</p>
                      ) : (
                        zoneItems.map((item) => (
                          <div 
                            key={item.sku}
                            className="flex items-center justify-between py-1 px-2 hover:bg-slate-50 border border-slate-100 rounded-lg text-[10px] transition-colors"
                          >
                            <span className="font-extrabold text-slate-700 max-w-[120px] truncate" title={item.name}>
                              {item.sku} ({item.name})
                            </span>
                            <span className="font-bold text-slate-900 tabular-nums bg-slate-100 px-1.5 py-0.5 rounded">
                              {item.stockQty} {item.uom}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Actions inside Card */}
                  {zoneItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => handleOpenTransfer(zoneItems[0].sku)}
                        className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:border-emerald-600 hover:text-emerald-700 text-slate-600 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-colors bg-white shadow-sm"
                      >
                        <ArrowLeftRight className="w-3 h-3 text-slate-400 hover:text-emerald-600" />
                        <span>Transfer Stocks</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
