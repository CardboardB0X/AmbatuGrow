'use client';

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { PRLineItem } from '../../types/procurement';
import { X, Plus, Trash2 } from 'lucide-react';

const DEPARTMENTS = ['Farm Operations', 'IT Department', 'Maintenance', 'Admin', 'Warehouse', 'Finance'];
const PRIORITIES = ['Low', 'Normal', 'Urgent'] as const;

const emptyLine = (): PRLineItem => ({ sku: '', name: '', uom: 'Unit', requestedQty: 1, estimatedUnitCost: 0, justification: '' });

export default function PRDrawer() {
  const { isPRDrawerOpen, setIsPRDrawerOpen, addPR, activeRole } = useProcurement();

  const [requestedBy, setRequestedBy] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [dateNeeded, setDateNeeded] = useState('');
  const [priority, setPriority] = useState<typeof PRIORITIES[number]>('Normal');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<PRLineItem[]>([emptyLine()]);
  const [errors, setErrors] = useState<string[]>([]);

  if (!isPRDrawerOpen) return null;

  const totalCost = items.reduce((s, i) => s + i.requestedQty * i.estimatedUnitCost, 0);
  const approvalLevel = totalCost > 50000 ? 2 : 1;

  const updateItem = (idx: number, field: keyof PRLineItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const addLine = () => setItems(prev => [...prev, emptyLine()]);
  const removeLine = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const validate = () => {
    const errs: string[] = [];
    if (!requestedBy.trim()) errs.push('Requester name is required.');
    if (!dateNeeded) errs.push('Date needed is required.');
    if (items.some(i => !i.sku.trim() || !i.name.trim())) errs.push('All line items need SKU and name.');
    if (items.some(i => i.requestedQty <= 0)) errs.push('All quantities must be greater than 0.');
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }
    addPR({ requestedBy, requestorRole: activeRole, department, dateNeeded, priority, remarks, items, linkedPoId: undefined, l1ApprovedBy: undefined, l1ApprovedAt: undefined, l2ApprovedBy: undefined, l2ApprovedAt: undefined, rejectedBy: undefined, rejectionReason: undefined });
    handleClose();
  };

  const handleClose = () => {
    setIsPRDrawerOpen(false);
    setRequestedBy(''); setDepartment(DEPARTMENTS[0]); setDateNeeded('');
    setPriority('Normal'); setRemarks(''); setItems([emptyLine()]); setErrors([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={handleClose} />
      <div className="relative w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl z-10 animate-slide-in-right">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800">Raise Purchase Requisition</h2>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              Total: <span className="text-slate-700">₱{totalCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
              &nbsp;·&nbsp;Approval: <span className={approvalLevel === 2 ? 'text-amber-600' : 'text-emerald-600'}>Level {approvalLevel}</span>
              {approvalLevel === 2 && <span className="text-amber-600"> (Manager required)</span>}
            </p>
          </div>
          <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[10px] text-red-700 font-bold space-y-1">
              {errors.map((e, i) => <div key={i}>• {e}</div>)}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Requested By *</label>
              <input value={requestedBy} onChange={e => setRequestedBy(e.target.value)} placeholder="Full name" className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
              <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 focus:outline-none bg-white cursor-pointer">
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date Needed *</label>
              <input type="date" value={dateNeeded} onChange={e => setDateNeeded(e.target.value)} className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as typeof PRIORITIES[number])} className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 focus:outline-none bg-white cursor-pointer">
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Line Items *</label>
              <button type="button" onClick={addLine} className="flex items-center gap-1 text-[10px] font-bold text-[#2D6A24] hover:underline cursor-pointer"><Plus className="w-3 h-3" /> Add Line</button>
            </div>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold mb-0.5">SKU</label>
                      <input value={item.sku} onChange={e => updateItem(idx, 'sku', e.target.value)} placeholder="AGRI-SEED-042" className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Item Name</label>
                      <input value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} placeholder="Hybrid Rice Seeds" className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold mb-0.5">UOM</label>
                      <input value={item.uom} onChange={e => updateItem(idx, 'uom', e.target.value)} placeholder="Sack" className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Qty</label>
                      <input type="number" min={1} value={item.requestedQty} onChange={e => updateItem(idx, 'requestedQty', parseInt(e.target.value) || 0)} className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]" />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Est. Unit Cost (₱)</label>
                      <input type="number" min={0} step={0.01} value={item.estimatedUnitCost} onChange={e => updateItem(idx, 'estimatedUnitCost', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]" />
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Justification</label>
                      <input value={item.justification} onChange={e => updateItem(idx, 'justification', e.target.value)} placeholder="Reason for request..." className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold mt-4 shrink-0">
                      ₱{(item.requestedQty * item.estimatedUnitCost).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </div>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeLine(idx)} className="mt-4 text-red-400 hover:text-red-600 cursor-pointer shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Remarks</label>
            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={2} className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none resize-none" />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
          <button type="button" onClick={handleClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer">Cancel</button>
          <button type="button" onClick={handleSubmit as unknown as React.MouseEventHandler} className="px-5 py-2 bg-[#2D6A24] hover:bg-[#23531B] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer">Submit PR</button>
        </div>
      </div>
    </div>
  );
}
