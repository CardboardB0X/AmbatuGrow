'use client';

import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { X, Settings, Trash2, Check } from 'lucide-react';

export default function SettingsModal() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    items,
    editItem
  } = useInventory();

  const [defaultThreshold, setDefaultThreshold] = useState(15);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isSettingsOpen) return null;

  // Apply a batch update setting all active items' safety threshold minQty to the selected default
  const handleApplyThreshold = () => {
    let count = 0;
    items.forEach(item => {
      if (item.status === 'Active') {
        editItem({
          ...item,
          minQty: defaultThreshold
        });
        count++;
      }
    });
    setSuccessMsg(`Successfully updated safety threshold to ${defaultThreshold} for ${count} active items.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClearCache = () => {
    localStorage.removeItem('erp_items');
    localStorage.removeItem('erp_transactions');
    localStorage.removeItem('erp_logs');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center select-none animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={() => setIsSettingsOpen(false)}
      ></div>

      {/* Dialog box */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#2D6A24]" />
            <h3 className="text-sm font-extrabold text-slate-800">
              ERP System Settings
            </h3>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200/50 rounded-xl text-[10px] text-emerald-800 font-bold flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Safety Threshold default configuration */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Safety Stock Threshold
            </label>
            <p className="text-[10px] text-slate-400 leading-tight">
              Batch update the minimum quantity trigger for all active items in the inventory registry.
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                value={defaultThreshold}
                onChange={(e) => setDefaultThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#2D6A24] focus:border-[#2D6A24]"
              />
              <button
                onClick={handleApplyThreshold}
                className="flex-1 py-1.5 bg-[#2D6A24] hover:bg-[#23531B] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Apply Batch Settings
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-100"></div>

          {/* Database Control */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              System Audits & Database Cache
            </label>
            <p className="text-[10px] text-slate-400 leading-tight">
              Clear the persistent storage cache to reset initial stock counts, transaction velocities, and timeline logs.
            </p>
            <button
              onClick={handleClearCache}
              className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/50 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Clear Local Cache & Reset Data
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close Settings
          </button>
        </div>

      </div>
    </div>
  );
}
