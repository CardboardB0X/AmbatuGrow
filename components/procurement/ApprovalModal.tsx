'use client';

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { X, CheckCircle, XCircle } from 'lucide-react';

export default function ApprovalModal() {
  const {
    isApprovalModalOpen, setIsApprovalModalOpen,
    selectedPRId, setSelectedPRId,
    prs, approvePRL1, approvePRL2, rejectPR,
    activeRole,
  } = useProcurement();

  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isApprovalModalOpen || !selectedPRId) return null;

  const pr = prs.find(p => p.id === selectedPRId);
  if (!pr) return null;

  const isL2Pending = pr.status === 'Pending L2 Approval';
  const approverName = activeRole;

  const handleApprove = () => {
    if (isL2Pending) {
      approvePRL2(pr.id, approverName);
    } else {
      approvePRL1(pr.id, approverName);
    }
    handleClose();
  };

  const handleReject = () => {
    if (!reason.trim()) { setError('Rejection reason is required.'); return; }
    rejectPR(pr.id, approverName, reason);
    handleClose();
  };

  const handleClose = () => {
    setIsApprovalModalOpen(false);
    setSelectedPRId(null);
    setRejecting(false);
    setReason('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={handleClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 z-10 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">
              {rejecting ? 'Reject Purchase Requisition' : `Approve at Level ${isL2Pending ? '2' : '1'}`}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">PR {pr.id} — {pr.department}</p>
          </div>
          <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* PR Summary */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-500 font-bold">Raised By</span><span className="font-extrabold text-slate-800">{pr.requestedBy} ({pr.department})</span></div>
            <div className="flex justify-between"><span className="text-slate-500 font-bold">Priority</span>
              <span className={`font-extrabold ${pr.priority === 'Urgent' ? 'text-red-600' : pr.priority === 'Normal' ? 'text-blue-600' : 'text-slate-500'}`}>{pr.priority}</span>
            </div>
            <div className="flex justify-between"><span className="text-slate-500 font-bold">Date Needed</span><span className="font-extrabold text-slate-800">{new Date(pr.dateNeeded).toLocaleDateString('en-PH')}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 font-bold">Items</span><span className="font-extrabold text-slate-800">{pr.items.length} line item(s)</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-2 mt-1">
              <span className="text-slate-700 font-extrabold">Total Estimated Cost</span>
              <span className="font-black text-[#2D6A24] text-sm">₱{pr.totalEstimatedCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {isL2Pending && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] font-bold text-amber-800">
              ⚠ This PR exceeds ₱50,000 and requires Level 2 (Procurement Manager) approval.
            </div>
          )}

          {rejecting && (
            <div className="space-y-2">
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Rejection Reason *</label>
              <textarea
                value={reason}
                onChange={e => { setReason(e.target.value); setError(''); }}
                rows={3}
                placeholder="Provide a clear reason for rejecting this requisition..."
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
              />
              {error && <p className="text-[10px] text-red-600 font-bold">{error}</p>}
            </div>
          )}

          {pr.remarks && (
            <div className="text-[10px] text-slate-500 font-medium italic">Remarks: &ldquo;{pr.remarks}&rdquo;</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          {!rejecting ? (
            <>
              <button onClick={() => setRejecting(true)} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-colors">
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
              <button onClick={handleApprove} className="flex items-center gap-1.5 px-5 py-2 bg-[#2D6A24] hover:bg-[#23531B] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-colors">
                <CheckCircle className="w-3.5 h-3.5" /> Approve L{isL2Pending ? '2' : '1'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setRejecting(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer">Back</button>
              <button onClick={handleReject} className="flex items-center gap-1.5 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer transition-colors">
                <XCircle className="w-3.5 h-3.5" /> Confirm Rejection
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
