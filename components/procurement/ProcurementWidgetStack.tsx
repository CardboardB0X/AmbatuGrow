'use client';

import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Clock, AlertTriangle, CheckCircle, FileCheck, Activity } from 'lucide-react';

export default function ProcurementWidgetStack() {
  const {
    prs,
    pos,
    invoices,
    procLogs
  } = useProcurement();

  // Widget 1: Pending Approvals
  const pendingL1 = prs.filter(pr => pr.status === 'Pending L1 Approval');
  const pendingL2 = prs.filter(pr => pr.status === 'Pending L2 Approval');

  // Widget 2: PO Pipeline
  const draftPOs = pos.filter(po => po.status === 'Draft');
  const sentPOs = pos.filter(po => po.status === 'Sent to Supplier');
  const partialPOs = pos.filter(po => po.status === 'Partially Received');
  
  const totalPOValue = pos.reduce((sum, po) => sum + (po.status !== 'Cancelled' ? po.totalAmount : 0), 0);

  // Widget 3: Overdue POs
  const today = new Date().toISOString();
  const overduePOs = pos.filter(po => {
    const isPending = po.status === 'Sent to Supplier' || po.status === 'Partially Received';
    const isPastExpected = po.expectedDelivery < today;
    return isPending && isPastExpected;
  });

  // Widget 4: Reconciliation / Unmatched Invoices
  const openInvoices = invoices.filter(inv => inv.status === 'Pending' || inv.status === 'Discrepancy');

  const getRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-PH', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <aside className="w-80 border-l border-slate-200 bg-white p-6 flex flex-col gap-6 overflow-y-auto select-none flex-shrink-0">
      
      {/* WIDGET 1: PENDING APPROVALS */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between text-slate-800">
          <h4 className="text-xs font-black uppercase tracking-wider">Approvals Inbox</h4>
          <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
            {pendingL1.length + pendingL2.length} Awaiting
          </span>
        </div>

        <div className="space-y-2">
          {pendingL2.length > 0 && (
            <div className="bg-red-50 border border-red-200/50 rounded-xl p-3 text-[11px] text-red-800 font-bold flex gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <div>Level 2 Approval Required</div>
                <div className="text-[10px] text-red-500 mt-0.5">
                  {pendingL2.length} requisition(s) exceeding ₱50,000 limit.
                </div>
              </div>
            </div>
          )}

          {pendingL1.length > 0 && (
            <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-3 text-[11px] text-amber-800 font-bold flex gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <div>Level 1 Review Pending</div>
                <div className="text-[10px] text-amber-500 mt-0.5">
                  {pendingL1.length} PR(s) in review queue.
                </div>
              </div>
            </div>
          )}

          {pendingL1.length === 0 && pendingL2.length === 0 && (
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 text-center text-xs font-bold text-slate-400">
              Approval queue is empty!
            </div>
          )}
        </div>
      </section>

      {/* WIDGET 2: PIPELINE PROGRESS */}
      <section className="space-y-3">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">PO Pipeline</h4>
        <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
          <div className="p-2 bg-slate-50 border border-slate-200/50 rounded-lg">
            <div className="text-slate-400 uppercase tracking-wider">Drafts</div>
            <div className="text-base text-slate-700 mt-0.5 font-black">{draftPOs.length}</div>
          </div>
          <div className="p-2 bg-blue-50 border border-blue-200/50 rounded-lg">
            <div className="text-blue-500 uppercase tracking-wider">In Flight</div>
            <div className="text-base text-blue-700 mt-0.5 font-black">{sentPOs.length + partialPOs.length}</div>
          </div>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">Total Procurement Value</span>
          <span className="text-sm font-black text-[#2D6A24] mt-0.5 block">
            ₱{totalPOValue.toLocaleString()}
          </span>
        </div>
      </section>

      {/* WIDGET 3: OVERDUE ORDERS */}
      <section className="space-y-3">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Delivery Alerts</h4>
        <div className="space-y-2">
          {overduePOs.length > 0 ? (
            overduePOs.map(po => (
              <div key={po.id} className="p-3 bg-red-50 border border-red-200/40 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="min-w-0 text-slate-800">
                  <h5 className="font-extrabold text-[11px]">{po.id}</h5>
                  <p className="text-[9px] font-bold text-red-600 mt-0.5">Overdue Delivery</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{po.supplierName}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3.5 bg-emerald-50/40 border border-emerald-200/40 rounded-xl text-[10px] text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All active PO shipments are on schedule!</span>
            </div>
          )}
        </div>
      </section>

      {/* WIDGET 4: RECONCILIATION */}
      <section className="space-y-3">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Invoice Matching</h4>
        <div className="space-y-2">
          {openInvoices.length > 0 ? (
            openInvoices.map(inv => (
              <div key={inv.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                <FileCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div className="min-w-0 text-slate-800 flex-1">
                  <div className="flex justify-between items-start">
                    <h5 className="font-extrabold text-[11px]">{inv.id}</h5>
                    <span className={`text-[8px] px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                      inv.status === 'Discrepancy' ? 'bg-red-50 text-red-600' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{inv.supplierName}</p>
                  <p className="text-[10px] font-bold text-slate-700 mt-0.5">₱{inv.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3.5 bg-slate-50 border border-slate-200/50 rounded-xl text-[10px] text-slate-400 font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>All invoices matched and reconciled.</span>
            </div>
          )}
        </div>
      </section>

      {/* WIDGET 5: RECENT ACTIVITY LOG */}
      <section className="flex-1 flex flex-col min-h-0 space-y-3">
        <div className="flex items-center justify-between text-slate-800">
          <h4 className="text-xs font-black uppercase tracking-wider">Procurement logs</h4>
          <Activity className="w-4 h-4 text-slate-400" />
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-4 font-semibold text-[10px]">
          {procLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex gap-3">
              {/* Dot line indicator */}
              <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  log.message.includes('discrepancy') || log.message.includes('rejected')
                    ? 'bg-red-500'
                    : log.message.includes('approved')
                    ? 'bg-[#2D6A24]'
                    : 'bg-blue-500'
                }`} />
                <div className="w-px flex-1 bg-slate-200 my-1"></div>
              </div>

              <div className="flex-1 min-w-0 text-slate-800">
                <div className="leading-tight text-slate-700">{log.message}</div>
                <div className="text-[9px] text-slate-400 mt-1">
                  {getRelativeTime(log.timestamp)} by {log.operator} ({log.role})
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </aside>
  );
}
