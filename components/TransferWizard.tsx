/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { X, ArrowRightLeft, AlertCircle, Check } from 'lucide-react';

export default function TransferWizard() {
  const {
    isTransferOpen,
    setIsTransferOpen,
    transferSku,
    setTransferSku,
    items,
    zones,
    transferItems,
  } = useInventory();

  // Filter items that actually have stock
  const stockItems = items.filter(item => item.stockQty > 0);

  // States
  const [sku, setSku] = useState('');
  const [srcZone, setSrcZone] = useState('');
  const [destZone, setDestZone] = useState('');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Sync state when open
  useEffect(() => {
    if (isTransferOpen) {
      setError('');
      setSuccess(false);
      
      const defaultItem = transferSku 
        ? items.find(i => i.sku === transferSku && i.stockQty > 0) 
        : items.find(item => item.stockQty > 0);
        
      if (defaultItem) {
        setSku(defaultItem.sku);
        setSrcZone(defaultItem.zone);
        setQty(1);
        
        // Find first dest zone that isn't the source
        const defaultDest = zones.find(z => z.name !== defaultItem.zone);
        setDestZone(defaultDest?.name || '');
      } else {
        setSku('');
        setSrcZone('');
        setDestZone('');
        setQty(1);
      }
    }
  }, [isTransferOpen, transferSku, items, zones]);

  // When selected SKU changes, update source zone and dest zone
  const handleSkuChange = (selectedSku: string) => {
    setSku(selectedSku);
    const item = items.find(i => i.sku === selectedSku && i.stockQty > 0);
    if (item) {
      setSrcZone(item.zone);
      setQty(Math.min(qty, item.stockQty));
      
      // Update destination if it matches new source
      if (destZone === item.zone) {
        const otherZone = zones.find(z => z.name !== item.zone);
        setDestZone(otherZone?.name || '');
      }
    }
  };

  if (!isTransferOpen) return null;

  const currentItem = items.find(i => i.sku === sku && i.zone === srcZone);
  const maxQty = currentItem ? currentItem.stockQty : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!sku) {
      setError('Please select an item to transfer');
      return;
    }
    if (!srcZone) {
      setError('Source zone not resolved');
      return;
    }
    if (!destZone) {
      setError('Please select a destination zone');
      return;
    }
    if (srcZone === destZone) {
      setError('Source and Destination zones cannot be identical');
      return;
    }
    if (qty <= 0) {
      setError('Quantity must be positive');
      return;
    }
    if (qty > maxQty) {
      setError(`Quantity exceeds stock available in ${srcZone} (${maxQty} available)`);
      return;
    }

    // Execute transfer
    const successResult = transferItems(sku, srcZone, destZone, qty);
    if (successResult) {
      setSuccess(true);
      setTimeout(() => {
        setIsTransferOpen(false);
        setTransferSku(null);
      }, 1000);
    } else {
      setError('System failed to process transfer. Please verify data.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
        onClick={() => {
          setIsTransferOpen(false);
          setTransferSku(null);
        }}
      ></div>

      {/* Dialog Box */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-scale-up">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-800">
              Inter-Warehouse Transfer Wizard
            </h3>
          </div>
          <button 
            onClick={() => {
              setIsTransferOpen(false);
              setTransferSku(null);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {success ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="font-extrabold text-sm text-emerald-800">Transfer Successful!</h4>
              <p className="text-[10px] text-slate-400">Stock records and recent logs have been refreshed</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200/60 rounded-xl flex items-start gap-2 text-[10px] text-red-700 font-bold">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Item selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Select Item to Relocate
                </label>
                <select
                  value={sku}
                  onChange={(e) => handleSkuChange(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 cursor-pointer bg-white"
                >
                  {stockItems.length === 0 ? (
                    <option value="">No items with stock available</option>
                  ) : (
                    stockItems.map((item) => (
                      <option key={`${item.sku}-${item.zone}`} value={item.sku}>
                        {item.sku} - {item.name} ({item.stockQty} {item.uom} in {item.zone.split(' - ')[1]})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Source Zone (Info only) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Source Zone
                </label>
                <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500">
                  {srcZone || 'No item selected'}
                </div>
              </div>

              {/* Destination Zone selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Target Destination Zone
                </label>
                <select
                  value={destZone}
                  onChange={(e) => setDestZone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 cursor-pointer bg-white"
                >
                  <option value="">-- Select Target Zone --</option>
                  {zones
                    .filter(z => z.name !== srcZone)
                    .map((zone) => (
                      <option key={zone.name} value={zone.name}>
                        {zone.name} (Cap: {zone.currentOccupancy}/{zone.maxCapacity})
                      </option>
                    ))}
                </select>
              </div>

              {/* Transfer Quantity */}
              {currentItem && (
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Relocation Qty
                    </label>
                    <span className="text-[10px] font-bold text-slate-400">
                      Max: {maxQty} {currentItem.uom}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={maxQty}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Math.min(maxQty, parseInt(e.target.value) || 1)))}
                    className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsTransferOpen(false);
                    setTransferSku(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={stockItems.length === 0}
                  className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md shadow-emerald-700/10 active:scale-95"
                >
                  <span>Execute Transfer</span>
                </button>
              </div>
            </>
          )}

        </form>

      </div>
    </div>
  );
}
