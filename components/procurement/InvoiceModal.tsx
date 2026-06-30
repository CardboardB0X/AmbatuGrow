/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { InvoiceLineItem, InvoiceMatchStatus } from '../../types/procurement';
import { X, FileCheck, AlertTriangle, CheckCircle } from 'lucide-react';

export default function InvoiceModal() {
  const {
    isInvoiceModalOpen,
    setIsInvoiceModalOpen,
    selectedPOId,
    setSelectedPOId,
    pos,
    grns,
    addInvoice
  } = useProcurement();

  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [selectedGrnId, setSelectedGrnId] = useState('');
  const [items, setItems] = useState<InvoiceLineItem[]>([]);
  const [error, setError] = useState('');

  const po = pos.find(p => p.id === selectedPOId);
  // Find GRNs linked to this PO
  const linkedGrns = grns.filter(g => g.poId === selectedPOId);

  useEffect(() => {
    if (po) {
      setInvoiceNo('');
      setInvoiceDate('');
      setError('');
      
      const poGrns = grns.filter(g => g.poId === po.id);
      const firstGrn = poGrns[0];
      setSelectedGrnId(firstGrn ? firstGrn.id : '');

      const initialLines: InvoiceLineItem[] = po.items.map(item => {
        const matchedGrn = grns.find(g => g.id === (firstGrn ? firstGrn.id : ''));
        const grnItem = matchedGrn?.items.find(gi => gi.sku === item.sku);
        const defaultQty = grnItem ? grnItem.acceptedQty : item.orderedQty;

        return {
          sku: item.sku,
          name: item.name,
          invoicedQty: defaultQty,
          invoicedUnitPrice: item.unitPrice,
          invoicedTotal: defaultQty * item.unitPrice,
          matchedQty: defaultQty,
          priceDifference: 0
        };
      });
      setItems(initialLines);
    }
  }, [po, isInvoiceModalOpen, grns]);

  // Re-calculate values when GRN selection changes
  const handleGrnChange = (grnId: string) => {
    setSelectedGrnId(grnId);
    if (!po) return;

    const selectedGrn = grns.find(g => g.id === grnId);
    setItems(prev => prev.map(item => {
      const poItem = po.items.find(pi => pi.sku === item.sku);
      const grnItem = selectedGrn?.items.find(gi => gi.sku === item.sku);
      const qty = grnItem ? grnItem.acceptedQty : (poItem ? poItem.orderedQty : item.invoicedQty);
      
      return {
        ...item,
        invoicedQty: qty,
        invoicedTotal: qty * item.invoicedUnitPrice,
        matchedQty: qty
      };
    }));
  };

  if (!isInvoiceModalOpen || !po) return null;

  const handleLineChange = (idx: number, field: 'invoicedQty' | 'invoicedUnitPrice', value: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      
      updated.invoicedTotal = updated.invoicedQty * updated.invoicedUnitPrice;
      
      // Calculate price difference compared to original PO line
      const poItem = po.items.find(pi => pi.sku === item.sku);
      if (poItem) {
        updated.priceDifference = updated.invoicedUnitPrice - poItem.unitPrice;
      }
      
      return updated;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.invoicedTotal, 0);
  const tax = Math.round(subtotal * 0.12);
  const totalAmount = subtotal + tax;

  // 3-way matching logic
  const calculateMatchStatus = (): InvoiceMatchStatus => {
    const selectedGrn = grns.find(g => g.id === selectedGrnId);
    let status: InvoiceMatchStatus = 'Matched';

    for (const item of items) {
      const poItem = po.items.find(pi => pi.sku === item.sku);
      const grnItem = selectedGrn?.items.find(gi => gi.sku === item.sku);

      if (!poItem || !grnItem) {
        status = 'Discrepancy';
        break;
      }

      // Quantity verification (Invoice qty vs GRN accepted qty)
      const qtyMismatch = item.invoicedQty !== grnItem.acceptedQty;
      
      // Price verification (Invoice price vs PO price, with 2% tolerance)
      const priceDiffRatio = Math.abs(item.invoicedUnitPrice - poItem.unitPrice) / poItem.unitPrice;
      const priceMismatch = priceDiffRatio > 0.02;

      if (qtyMismatch || priceMismatch) {
        if (item.invoicedQty > grnItem.acceptedQty || priceDiffRatio > 0.05) {
          status = 'Discrepancy'; // Serious discrepancy
        } else {
          status = 'Partial Match'; // Minor mismatch
        }
      }
    }
    return status;
  };

  const getMatchMessage = (status: InvoiceMatchStatus) => {
    switch (status) {
      case 'Matched':
        return '3-Way Match Successful. Quantities and unit pricing align with PO and Goods Receipt Note.';
      case 'Partial Match':
        return 'Partial Match. Minor quantity discrepancies or price variations detected within acceptable bounds.';
      case 'Discrepancy':
        return 'Discrepancy Flagged. Invoice contains quantities exceeding goods receipt, or prices exceeding PO thresholds.';
      default:
        return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNo.trim()) {
      setError('Please provide the Supplier Invoice Number.');
      return;
    }
    if (!invoiceDate) {
      setError('Please specify invoice date.');
      return;
    }
    if (!selectedGrnId) {
      setError('Please select a corresponding Goods Receipt Note (GRN) to match.');
      return;
    }

    addInvoice({
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      supplierInvoiceNo: invoiceNo,
      dateIssued: new Date(invoiceDate).toISOString(),
      linkedPoId: po.id,
      linkedGrnId: selectedGrnId,
      items,
      subtotal,
      tax,
      totalAmount
    });

    handleClose();
  };

  const handleClose = () => {
    setIsInvoiceModalOpen(false);
    setSelectedPOId(null);
    setInvoiceNo('');
    setInvoiceDate('');
    setSelectedGrnId('');
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
            <FileCheck className="w-5 h-5 text-[#2D6A24]" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">
                Log & Match Supplier Invoice (3-Way Matching)
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

          {/* Invoice Parameters */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Invoice Number *
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="e.g. SI-98745"
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Match Against Receipt (GRN) *
              </label>
              <select
                value={selectedGrnId}
                onChange={(e) => handleGrnChange(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 focus:outline-none bg-white cursor-pointer"
              >
                <option value="">-- Choose Goods Receipt --</option>
                {linkedGrns.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.id} ({g.dateReceived.split('T')[0]}) - {g.status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Invoice Line items & prices comparison
            </label>
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">SKU & Item</th>
                    <th className="p-3 text-center">GRN Received</th>
                    <th className="p-3 text-center w-24">Invoiced Qty</th>
                    <th className="p-3 text-center w-28">Invoiced Price (₱)</th>
                    <th className="p-3 text-right">Line Total (₱)</th>
                    <th className="p-3 text-right">Price Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {items.map((item, idx) => {
                    const poItem = po.items.find(pi => pi.sku === item.sku);
                    const basePrice = poItem ? poItem.unitPrice : 0;
                    const diff = item.invoicedUnitPrice - basePrice;
                    const pct = basePrice ? (diff / basePrice) * 100 : 0;
                    
                    return (
                      <tr key={item.sku} className="hover:bg-slate-50/30">
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{item.sku}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{item.name}</div>
                        </td>
                        <td className="p-3 text-center font-extrabold text-slate-500">
                          {item.matchedQty}
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min={0}
                            value={item.invoicedQty}
                            onChange={(e) => handleLineChange(idx, 'invoicedQty', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-center font-semibold rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={item.invoicedUnitPrice}
                            onChange={(e) => handleLineChange(idx, 'invoicedUnitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-center font-semibold rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
                          />
                        </td>
                        <td className="p-3 text-right font-extrabold text-slate-800">
                          ₱{item.invoicedTotal.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-bold">
                          {diff === 0 ? (
                            <span className="text-slate-400">0%</span>
                          ) : (
                            <span className={Math.abs(pct) > 2 ? 'text-red-600' : 'text-amber-600'}>
                              {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Match Alert Card */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            calculateMatchStatus() === 'Matched'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : calculateMatchStatus() === 'Partial Match'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-red-50 border-red-200 text-red-800 font-bold'
          }`}>
            {calculateMatchStatus() === 'Matched' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider">
                3-Way Reconciliation Status: {calculateMatchStatus()}
              </h4>
              <p className="text-[10px] mt-1 font-semibold leading-relaxed">
                {getMatchMessage(calculateMatchStatus())}
              </p>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div className="flex flex-col text-[10px] font-bold text-slate-500">
            <div>Subtotal: ₱{subtotal.toLocaleString()}</div>
            <div>VAT (12%): ₱{tax.toLocaleString()}</div>
          </div>
          
          <div className="flex gap-3">
            <div className="text-right mr-3 flex flex-col justify-center">
              <span className="text-[9px] font-bold text-slate-400">INVOICE TOTAL</span>
              <span className="font-black text-slate-800 text-sm">₱{totalAmount.toLocaleString()}</span>
            </div>
            
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
              Reconcile & Log Invoice
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
