/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { useInventory } from '../../context/InventoryContext';
import { GRNLineItem, RejectionReason } from '../../types/procurement';
import { X, Package } from 'lucide-react';

const REJECTION_REASONS: RejectionReason[] = ['Damaged', 'Wrong Item', 'Expired', 'Short Delivery', 'Other'];

export default function GRNModal() {
  const {
    isGRNModalOpen,
    setIsGRNModalOpen,
    selectedPOId,
    setSelectedPOId,
    pos,
    addGRN,
    activeRole
  } = useProcurement();

  const { createStockIn } = useInventory();

  const [deliveryRef, setDeliveryRef] = useState('');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<GRNLineItem[]>([]);
  const [error, setError] = useState('');

  const po = pos.find(p => p.id === selectedPOId);

  useEffect(() => {
    if (po) {
      const initialItems: GRNLineItem[] = po.items.map(item => ({
        sku: item.sku,
        name: item.name,
        orderedQty: item.orderedQty,
        receivedQty: item.orderedQty - item.receivedQty, // Default to remaining outstanding
        acceptedQty: item.orderedQty - item.receivedQty,
        rejectedQty: 0,
        unitPrice: item.unitPrice
      }));
      setItems(initialItems);
      setDeliveryRef('');
      setRemarks('');
      setError('');
    }
  }, [po, isGRNModalOpen]);

  if (!isGRNModalOpen || !po) return null;

  const handleQtyChange = (idx: number, field: 'receivedQty' | 'acceptedQty', value: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      
      // Enforce limits and auto-compute rejected quantity
      if (field === 'receivedQty') {
        // Accepted cannot exceed received
        if (updated.acceptedQty > updated.receivedQty) {
          updated.acceptedQty = updated.receivedQty;
        }
      } else if (field === 'acceptedQty') {
        // Accepted cannot exceed received
        if (updated.acceptedQty > updated.receivedQty) {
          updated.acceptedQty = updated.receivedQty;
        }
      }
      
      updated.rejectedQty = updated.receivedQty - updated.acceptedQty;
      if (updated.rejectedQty <= 0) {
        delete updated.rejectionReason;
      } else if (!updated.rejectionReason) {
        updated.rejectionReason = 'Damaged'; // Default reason
      }
      
      return updated;
    }));
  };

  const handleReasonChange = (idx: number, reason: RejectionReason) => {
    setItems(prev => prev.map((item, i) => 
      i === idx ? { ...item, rejectionReason: reason } : item
    ));
  };

  const computeGRNStatus = () => {
    const hasRejections = items.some(i => i.rejectedQty > 0);
    const allFulfilled = items.every(i => i.acceptedQty >= i.orderedQty);
    
    if (hasRejections) return 'Discrepancy';
    if (!allFulfilled) return 'Partial';
    return 'Complete';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryRef.trim()) {
      setError('Please provide the Supplier Delivery Reference / DR Number.');
      return;
    }
    if (items.some(i => i.receivedQty < 0 || i.acceptedQty < 0)) {
      setError('Quantities cannot be negative.');
      return;
    }

    const grnStatus = computeGRNStatus();

    // 1. Save GRN in Procurement Context
    addGRN({
      poId: po.id,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      receivedBy: activeRole,
      supplierDeliveryRef: deliveryRef,
      items,
      status: grnStatus,
      remarks
    });

    // 2. Bridge to Inventory Context - Stock-In accepted items
    items.forEach(item => {
      if (item.acceptedQty > 0) {
        createStockIn(item.sku, item.acceptedQty, activeRole, 'Warehouse A - Zone 1');
      }
    });

    handleClose();
  };

  const handleClose = () => {
    setIsGRNModalOpen(false);
    setSelectedPOId(null);
    setDeliveryRef('');
    setRemarks('');
    setItems([]);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#2D6A24]" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">
                Goods Receipt Note (GRN) Registry
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                PO: <span className="font-mono text-slate-700">{po.id}</span> · Supplier: <span className="text-slate-700">{po.supplierName}</span>
              </p>
            </div>
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
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[10px] text-red-700 font-bold">
              ⚠ {error}
            </div>
          )}

          {/* DR & Remarks details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Supplier Delivery Ref / DR # *
              </label>
              <input
                type="text"
                value={deliveryRef}
                onChange={(e) => setDeliveryRef(e.target.value)}
                placeholder="e.g. DR-44589"
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Received By
              </label>
              <div className="px-3 py-1.5 text-xs font-extrabold text-slate-700 bg-slate-50 rounded-lg border border-slate-200 select-none">
                {activeRole}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Item Quantities Verification
            </label>
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">SKU & Item</th>
                    <th className="p-3 text-center">Ordered</th>
                    <th className="p-3 text-center w-24">Received</th>
                    <th className="p-3 text-center w-24">Accepted</th>
                    <th className="p-3 text-center">Rejected</th>
                    <th className="p-3">Rejection Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {items.map((item, idx) => (
                    <tr key={item.sku} className="hover:bg-slate-50/30">
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{item.sku}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.name}</div>
                      </td>
                      <td className="p-3 text-center font-bold">{item.orderedQty}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          min={0}
                          value={item.receivedQty}
                          onChange={(e) => handleQtyChange(idx, 'receivedQty', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-center font-semibold rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min={0}
                          value={item.acceptedQty}
                          onChange={(e) => handleQtyChange(idx, 'acceptedQty', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-center font-semibold rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-bold ${item.rejectedQty > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                          {item.rejectedQty}
                        </span>
                      </td>
                      <td className="p-3">
                        {item.rejectedQty > 0 ? (
                          <select
                            value={item.rejectionReason || 'Damaged'}
                            onChange={(e) => handleReasonChange(idx, e.target.value as RejectionReason)}
                            className="w-full px-2 py-1 text-[10px] font-bold rounded border border-slate-200 bg-white cursor-pointer"
                          >
                            {REJECTION_REASONS.map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-slate-300 italic text-[10px]">No rejections</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Remarks / Discrepancy Notes
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24] resize-none"
              placeholder="Record any delivery damages, missing items, or comments here..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <span className="text-slate-400">RECEIPT MATCH PREVIEW:</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${
              computeGRNStatus() === 'Complete' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                : computeGRNStatus() === 'Partial'
                ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                : 'bg-red-50 text-red-700 border border-red-200/50 font-black'
            }`}>
              {computeGRNStatus()}
            </span>
          </div>

          <div className="flex gap-3">
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
              Log Receipt
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
