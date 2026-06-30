/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { X, Check, AlertCircle } from 'lucide-react';

export default function Drawer() {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    drawerMode,
    editingItem,
    addItem,
    editItem,
    items,
    zones,
  } = useInventory();

  // Form State
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stockQty, setStockQty] = useState(0);
  const [uom, setUom] = useState('Units');
  const [status, setStatus] = useState<'Active' | 'Obsolete'>('Active');
  const [minQty, setMinQty] = useState(10);
  const [maxQty, setMaxQty] = useState(100);
  const [zone, setZone] = useState('');

  // Error States
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync editing item fields
  useEffect(() => {
    if (drawerMode === 'edit' && editingItem) {
      setSku(editingItem.sku);
      setName(editingItem.name);
      setDescription(editingItem.description);
      setCategory(editingItem.category);
      setStockQty(editingItem.stockQty);
      setUom(editingItem.uom);
      setStatus(editingItem.status);
      setMinQty(editingItem.minQty);
      setMaxQty(editingItem.maxQty);
      setZone(editingItem.zone);
      setErrors({});
    } else {
      // Reset for add mode
      setSku('');
      setName('');
      setDescription('');
      setCategory('');
      setStockQty(0);
      setUom('Units');
      setStatus('Active');
      setMinQty(10);
      setMaxQty(100);
      setZone(zones[0]?.name || 'Warehouse A - Zone 1');
      setErrors({});
    }
  }, [drawerMode, editingItem, isDrawerOpen, zones]);

  if (!isDrawerOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate inputs
    if (!sku.trim()) newErrors.sku = 'SKU is required';
    else if (drawerMode === 'add' && items.some(item => item.sku.toLowerCase() === sku.trim().toLowerCase())) {
      newErrors.sku = 'SKU already exists in the system';
    }

    if (!name.trim()) newErrors.name = 'Item Name is required';
    if (!category.trim()) newErrors.category = 'Category is required';
    if (stockQty < 0) newErrors.stockQty = 'Stock Quantity cannot be negative';
    if (minQty < 0) newErrors.minQty = 'Min Quantity cannot be negative';
    if (maxQty < minQty) newErrors.maxQty = 'Max Quantity must be greater than Min Quantity';
    if (!zone) newErrors.zone = 'Warehouse Zone is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Call Context actions
    const payload = {
      sku: sku.trim(),
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      uom: uom.trim(),
      status,
      minQty: Number(minQty),
      maxQty: Number(maxQty),
      zone,
    };

    if (drawerMode === 'add') {
      addItem({ ...payload, stockQty: Number(stockQty) });
    } else {
      editItem({ ...payload, stockQty: Number(stockQty) });
    }

    setIsDrawerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
        onClick={() => setIsDrawerOpen(false)}
      ></div>

      {/* Sliding Sheet Panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in border-l border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">
              {drawerMode === 'add' ? 'Add New Inventory Item' : `Edit Item - ${sku}`}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">
              {drawerMode === 'add' ? 'Create a new physical asset allocation' : 'Modify existing item and stock parameters'}
            </p>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* SKU Field (Readonly on Edit) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Stock Keeping Unit (SKU) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              disabled={drawerMode === 'edit'}
              placeholder="e.g. AGRI-PROD-002"
              className={`w-full px-3.5 py-2 text-xs font-semibold rounded-xl border focus:outline-none transition-all ${
                drawerMode === 'edit'
                  ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                  : errors.sku 
                    ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500' 
                    : 'border-slate-200 focus:ring-emerald-500/10 focus:border-emerald-500'
              }`}
            />
            {errors.sku && (
              <p className="mt-1 flex items-center gap-1 text-[10px] text-red-600 font-bold">
                <AlertCircle className="w-3 h-3" /> {errors.sku}
              </p>
            )}
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Honey, Organic Fertilizer"
              className={`w-full px-3.5 py-2 text-xs font-semibold rounded-xl border focus:outline-none transition-all ${
                errors.name 
                  ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500' 
                  : 'border-slate-200 focus:ring-emerald-500/10 focus:border-emerald-500'
              }`}
            />
            {errors.name && (
              <p className="mt-1 flex items-center gap-1 text-[10px] text-red-600 font-bold">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed asset details, measurements, or physical specifications..."
              rows={3}
              className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 placeholder-slate-400 transition-all resize-none"
            />
          </div>

          {/* Grid for Qty & UoM */}
          <div className="grid grid-cols-2 gap-4">
            {/* Stock Quantity */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Current Stock Qty <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={stockQty}
                onChange={(e) => setStockQty(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* UoM */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Unit of Measure (UoM)
              </label>
              <input
                type="text"
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                placeholder="e.g. Units, Bags, Liters"
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Grid for Min & Max Safety Limits */}
          <div className="grid grid-cols-2 gap-4">
            {/* Min Qty */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Min Stock Limit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={minQty}
                onChange={(e) => setMinQty(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Max Qty */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Max Stock Limit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={maxQty}
                onChange={(e) => setMaxQty(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
          {errors.maxQty && (
            <p className="flex items-center gap-1 text-[10px] text-red-600 font-bold">
              <AlertCircle className="w-3 h-3" /> {errors.maxQty}
            </p>
          )}

          {/* Grid for Category & Status */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Agriculture"
                className={`w-full px-3.5 py-2 text-xs font-semibold rounded-xl border focus:outline-none transition-all ${
                  errors.category 
                    ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500' 
                    : 'border-slate-200 focus:ring-emerald-500/10 focus:border-emerald-500'
                }`}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Obsolete')}
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 cursor-pointer bg-white"
              >
                <option value="Active">Active</option>
                <option value="Obsolete">Obsolete</option>
              </select>
            </div>
          </div>

          {/* Warehouse Zone Location */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Warehouse Allocation Zone <span className="text-red-500">*</span>
            </label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 cursor-pointer bg-white"
            >
              {zones.map((z) => (
                <option key={z.name} value={z.name}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 select-none">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 shadow-md shadow-emerald-700/10 active:scale-95"
          >
            <Check className="w-4 h-4" /> 
            {drawerMode === 'add' ? 'Create Asset' : 'Save Modifications'}
          </button>
        </div>

      </div>
    </div>
  );
}
