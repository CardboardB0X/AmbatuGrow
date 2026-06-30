/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { POLineItem, PurchaseOrder } from '../../types/procurement';
import { X, Plus, Trash2 } from 'lucide-react';

const emptyLine = (): POLineItem => ({
  sku: '',
  name: '',
  uom: 'Unit',
  orderedQty: 1,
  receivedQty: 0,
  unitPrice: 0,
  totalPrice: 0,
});

export default function PODrawer() {
  const {
    isPODrawerOpen,
    setIsPODrawerOpen,
    suppliers,
    addPO,
    editPO,
    editingPO,
    activeRole
  } = useProcurement();

  const [supplierId, setSupplierId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<POLineItem[]>([emptyLine()]);
  const [errors, setErrors] = useState<string[]>([]);

  // Filter for Active suppliers
  const activeSuppliers = suppliers.filter(s => s.status === 'Active');

  useEffect(() => {
    if (editingPO) {
      setSupplierId(editingPO.supplierId);
      setPaymentTerms(editingPO.paymentTerms);
      setExpectedDelivery(editingPO.expectedDelivery.split('T')[0]);
      setNotes(editingPO.notes);
      setItems(editingPO.items);
    } else {
      setSupplierId('');
      setPaymentTerms('Net 30');
      setExpectedDelivery('');
      setNotes('');
      setItems([emptyLine()]);
    }
    setErrors([]);
  }, [editingPO, isPODrawerOpen]);

  if (!isPODrawerOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.orderedQty * item.unitPrice), 0);
  const tax = Math.round(subtotal * 0.12);
  const totalAmount = subtotal + tax;

  const updateItem = (idx: number, field: keyof POLineItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === 'orderedQty' || field === 'unitPrice') {
        const qty = field === 'orderedQty' ? (value as number) : item.orderedQty;
        const price = field === 'unitPrice' ? (value as number) : item.unitPrice;
        updated.totalPrice = qty * price;
      }
      return updated;
    }));
  };

  const addLine = () => setItems(prev => [...prev, emptyLine()]);
  const removeLine = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const validate = () => {
    const errs: string[] = [];
    if (!supplierId) errs.push('Please select a supplier.');
    if (!expectedDelivery) errs.push('Please specify expected delivery date.');
    if (items.some(i => !i.sku.trim() || !i.name.trim())) errs.push('All line items require SKU and Name.');
    if (items.some(i => i.orderedQty <= 0 || i.unitPrice < 0)) errs.push('Quantities must exceed 0, and unit prices cannot be negative.');
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    const selectedSupplier = suppliers.find(s => s.id === supplierId);
    const supplierName = selectedSupplier ? selectedSupplier.name : 'Unknown';

    if (editingPO) {
      const updatedPO: PurchaseOrder = {
        ...editingPO,
        supplierId,
        supplierName,
        paymentTerms,
        expectedDelivery: new Date(expectedDelivery).toISOString(),
        items,
        notes,
      };
      editPO(updatedPO);
    } else {
      addPO({
        supplierId,
        supplierName,
        issuedBy: activeRole,
        issuedByRole: activeRole,
        expectedDelivery: new Date(expectedDelivery).toISOString(),
        status: 'Draft',
        paymentTerms,
        items,
        notes,
      });
    }

    handleClose();
  };

  const handleClose = () => {
    setIsPODrawerOpen(false);
    setSupplierId('');
    setPaymentTerms('Net 30');
    setExpectedDelivery('');
    setNotes('');
    setItems([emptyLine()]);
    setErrors([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl z-10 animate-slide-in-right">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800">
              {editingPO ? `Edit Purchase Order (${editingPO.id})` : 'Create Purchase Order'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              Subtotal: ₱{subtotal.toLocaleString()} · VAT (12%): ₱{tax.toLocaleString()} · Total: <span className="text-[#2D6A24]">₱{totalAmount.toLocaleString()}</span>
            </p>
          </div>
          <button 
            onClick={handleClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[10px] text-red-700 font-bold space-y-1">
              {errors.map((err, i) => <div key={i}>• {err}</div>)}
            </div>
          )}

          {/* Supplier & Delivery */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Supplier *
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 focus:outline-none bg-white cursor-pointer"
              >
                <option value="">-- Choose Supplier --</option>
                {activeSuppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Expected Delivery *
              </label>
              <input
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Payment Terms
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="e.g. Net 30, COD"
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Line Items
              </label>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-1 text-[10px] font-bold text-[#2D6A24] hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold mb-0.5">SKU</label>
                      <input
                        type="text"
                        value={item.sku}
                        onChange={(e) => updateItem(idx, 'sku', e.target.value)}
                        placeholder="e.g. AGRI-SEED-042"
                        className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Item Name</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                        placeholder="e.g. Hybrid Rice Seeds"
                        className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 items-end">
                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold mb-0.5">UOM</label>
                      <input
                        type="text"
                        value={item.uom}
                        onChange={(e) => updateItem(idx, 'uom', e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Ordered Qty</label>
                      <input
                        type="number"
                        min={1}
                        value={item.orderedQty}
                        onChange={(e) => updateItem(idx, 'orderedQty', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Unit Price (₱)</label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
                      />
                    </div>
                    <div className="flex items-center justify-between pb-1 px-1">
                      <span className="text-[10px] text-slate-500 font-bold">
                        ₱{(item.orderedQty * item.unitPrice).toLocaleString()}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="text-red-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Notes / Instructions
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24] resize-none"
              placeholder="Any specific delivery instructions or warehouse directions..."
            />
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-[#2D6A24] hover:bg-[#23531B] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
          >
            {editingPO ? 'Save PO' : 'Create PO'}
          </button>
        </div>

      </div>
    </div>
  );
}
