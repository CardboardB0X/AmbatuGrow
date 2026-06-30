'use client';

import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileCheck,
  CreditCard,
  Eye,
} from 'lucide-react';
import type { GoodsReceiptNote, SupplierInvoice, InvoiceMatchStatus } from '../../types/procurement';

// ─── Badge helpers ────────────────────────────────────────────────────────────

function GRNStatusBadge({ status }: { status: GoodsReceiptNote['status'] }) {
  const map: Record<GoodsReceiptNote['status'], { cls: string; icon: React.ReactNode }> = {
    Complete: {
      cls: 'bg-green-100 text-green-800 border-green-200',
      icon: <CheckCircle className="w-3 h-3" />,
    },
    Partial: {
      cls: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: <AlertTriangle className="w-3 h-3" />,
    },
    Discrepancy: {
      cls: 'bg-red-100 text-red-800 border-red-200',
      icon: <XCircle className="w-3 h-3" />,
    },
  };
  const { cls, icon } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${cls}`}
    >
      {icon}
      {status}
    </span>
  );
}

function InvoiceMatchBadge({ status }: { status: InvoiceMatchStatus }) {
  const map: Record<InvoiceMatchStatus, string> = {
    Pending:              'bg-gray-100 text-gray-600 border-gray-200',
    Matched:              'bg-green-100 text-green-800 border-green-200',
    'Partial Match':      'bg-yellow-100 text-yellow-800 border-yellow-200',
    Discrepancy:          'bg-red-100 text-red-800 border-red-200',
    'Approved for Payment': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Disputed:             'bg-orange-100 text-orange-800 border-orange-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${map[status]}`}
    >
      {status}
    </span>
  );
}

// ─── GRN Row (with inline expansion) ─────────────────────────────────────────

interface GRNRowProps {
  grn: GoodsReceiptNote;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onMatchInvoice: () => void;
}

function GRNRow({ grn, isExpanded, onToggleExpand, onMatchInvoice }: GRNRowProps) {
  const dateStr = new Date(grn.dateReceived).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <>
      <tr className="hover:bg-slate-50/60 transition-colors border-b border-slate-100">
        {/* GRN ID */}
        <td className="p-3 font-mono text-[11px] font-bold text-slate-600 whitespace-nowrap">
          {grn.id}
        </td>

        {/* PO Reference */}
        <td className="p-3 text-xs font-bold text-indigo-700 whitespace-nowrap">
          {grn.poId}
        </td>

        {/* Supplier */}
        <td className="p-3 text-xs font-semibold text-slate-700 whitespace-nowrap">
          {grn.supplierName}
        </td>

        {/* Date Received */}
        <td className="p-3 text-xs text-slate-500 tabular-nums whitespace-nowrap">
          {dateStr}
        </td>

        {/* Delivery Ref */}
        <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
          {grn.supplierDeliveryRef || <span className="italic text-slate-300">—</span>}
        </td>

        {/* Items Count */}
        <td className="p-3 text-center text-xs font-extrabold text-slate-800">
          {grn.items.length}
        </td>

        {/* GRN Status */}
        <td className="p-3 whitespace-nowrap">
          <GRNStatusBadge status={grn.status} />
        </td>

        {/* Invoice Match Status */}
        <td className="p-3 whitespace-nowrap">
          <InvoiceMatchBadge status={grn.invoiceMatchStatus} />
        </td>

        {/* Actions */}
        <td className="p-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleExpand}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
              title="View line items"
            >
              <Eye className="w-3 h-3" />
              {isExpanded ? 'Hide' : 'View Details'}
            </button>
            {grn.invoiceMatchStatus === 'Pending' && (
              <button
                onClick={onMatchInvoice}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                title="Match Invoice"
              >
                <FileCheck className="w-3 h-3" />
                Match Invoice
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Inline expansion — GRN line items */}
      {isExpanded && (
        <tr className="bg-indigo-50/40">
          <td colSpan={9} className="px-6 py-4">
            <div className="rounded-xl border border-indigo-100 overflow-hidden shadow-inner">
              <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700">
                  GRN Line Items — {grn.id}
                </span>
                {grn.remarks && (
                  <span className="ml-auto text-[10px] text-slate-500 italic">
                    Remarks: {grn.remarks}
                  </span>
                )}
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-indigo-100">
                    <th className="px-4 py-2">SKU</th>
                    <th className="px-4 py-2">Item Name</th>
                    <th className="px-4 py-2 text-center">Ordered</th>
                    <th className="px-4 py-2 text-center">Received</th>
                    <th className="px-4 py-2 text-center">Accepted</th>
                    <th className="px-4 py-2 text-center">Rejected</th>
                    <th className="px-4 py-2">Rejection Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {grn.items.map((item, idx) => (
                    <tr key={`${grn.id}-item-${idx}`} className="bg-white hover:bg-indigo-50/30 transition-colors">
                      <td className="px-4 py-2 font-mono text-[10px] font-bold text-slate-500">
                        {item.sku}
                      </td>
                      <td className="px-4 py-2 font-semibold text-slate-700">
                        {item.name}
                      </td>
                      <td className="px-4 py-2 text-center tabular-nums font-bold text-slate-600">
                        {item.orderedQty}
                      </td>
                      <td className="px-4 py-2 text-center tabular-nums font-bold text-slate-600">
                        {item.receivedQty}
                      </td>
                      <td className="px-4 py-2 text-center tabular-nums font-extrabold text-emerald-700">
                        {item.acceptedQty}
                      </td>
                      <td className="px-4 py-2 text-center tabular-nums font-extrabold text-red-600">
                        {item.rejectedQty > 0 ? item.rejectedQty : (
                          <span className="text-slate-300 font-normal">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-slate-500">
                        {item.rejectionReason ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 border border-red-100 text-[10px] font-bold text-red-700">
                            <XCircle className="w-2.5 h-2.5" />
                            {item.rejectionReason}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[10px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Invoice Row ──────────────────────────────────────────────────────────────

interface InvoiceRowProps {
  invoice: SupplierInvoice;
  role: string;
  onApprove: () => void;
  disputeOpen: boolean;
  onOpenDispute: () => void;
  onCloseDispute: () => void;
  onSubmitDispute: (notes: string) => void;
}

function InvoiceRow({
  invoice,
  role,
  onApprove,
  disputeOpen,
  onOpenDispute,
  onCloseDispute,
  onSubmitDispute,
}: InvoiceRowProps) {
  const [disputeText, setDisputeText] = useState('');

  const canApprove =
    (invoice.status === 'Matched' || invoice.status === 'Partial Match') &&
    role === 'Procurement Manager';

  const canDispute =
    invoice.status !== 'Disputed' && invoice.status !== 'Approved for Payment';

  const totalFormatted = `₱${invoice.totalAmount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <>
      <tr className="hover:bg-slate-50/60 transition-colors border-b border-slate-100">
        {/* Invoice ID */}
        <td className="p-3 font-mono text-[11px] font-bold text-slate-600 whitespace-nowrap">
          {invoice.id}
        </td>

        {/* Supplier Inv No */}
        <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
          {invoice.supplierInvoiceNo}
        </td>

        {/* Supplier */}
        <td className="p-3 text-xs font-semibold text-slate-700 whitespace-nowrap">
          {invoice.supplierName}
        </td>

        {/* Linked PO */}
        <td className="p-3 text-xs font-bold text-indigo-700 whitespace-nowrap">
          {invoice.linkedPoId}
        </td>

        {/* Linked GRN */}
        <td className="p-3 text-xs font-bold text-violet-700 whitespace-nowrap">
          {invoice.linkedGrnId || <span className="text-slate-300 font-normal italic">—</span>}
        </td>

        {/* Total */}
        <td className="p-3 text-xs font-extrabold tabular-nums text-slate-900 whitespace-nowrap text-right">
          {totalFormatted}
        </td>

        {/* Match Status */}
        <td className="p-3 whitespace-nowrap">
          <InvoiceMatchBadge status={invoice.status} />
        </td>

        {/* Actions */}
        <td className="p-3">
          <div className="flex items-center gap-2 flex-wrap">
            {canApprove && (
              <button
                onClick={onApprove}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                title="Approve for Payment"
              >
                <CreditCard className="w-3 h-3" />
                Approve for Payment
              </button>
            )}
            {canDispute && (
              <button
                onClick={disputeOpen ? onCloseDispute : onOpenDispute}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-orange-200 bg-orange-50 text-[10px] font-bold text-orange-700 hover:bg-orange-100 transition-colors"
                title="Dispute Invoice"
              >
                <AlertTriangle className="w-3 h-3" />
                {disputeOpen ? 'Cancel' : 'Dispute'}
              </button>
            )}
            {invoice.status === 'Approved for Payment' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <CheckCircle className="w-3 h-3" />
                Approved by {invoice.approvedBy}
              </span>
            )}
            {invoice.status === 'Disputed' && invoice.disputeNotes && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 max-w-[180px] truncate"
                title={invoice.disputeNotes}
              >
                <XCircle className="w-3 h-3 flex-shrink-0" />
                {invoice.disputeNotes}
              </span>
            )}
          </div>
        </td>
      </tr>

      {/* Inline dispute form */}
      {disputeOpen && (
        <tr className="bg-orange-50/40">
          <td colSpan={8} className="px-6 py-3">
            <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-white px-4 py-3 shadow-inner">
              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700 mb-1.5">
                  Dispute Invoice — {invoice.id}
                </p>
                <textarea
                  className="w-full rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none font-semibold"
                  rows={2}
                  placeholder="Describe the discrepancy or reason for dispute…"
                  value={disputeText}
                  onChange={(e) => setDisputeText(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    disabled={!disputeText.trim()}
                    onClick={() => {
                      onSubmitDispute(disputeText.trim());
                      setDisputeText('');
                    }}
                    className="px-3 py-1 rounded-lg bg-orange-600 text-white text-[10px] font-bold hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Submit Dispute
                  </button>
                  <button
                    onClick={() => { setDisputeText(''); onCloseDispute(); }}
                    className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Workspace ───────────────────────────────────────────────────────────

export default function GRNWorkspace() {
  const {
    grns,
    invoices,
    activeRole,
    setSelectedPOId,
    setIsInvoiceModalOpen,
    approveInvoiceForPayment,
    disputeInvoice,
    addLog,
  } = useProcurement();

  // GRN row expansion state
  const [expandedGRNId, setExpandedGRNId] = useState<string | null>(null);

  // Invoice dispute open state (one at a time)
  const [openDisputeInvId, setOpenDisputeInvId] = useState<string | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const handleToggleExpand = (grnId: string) => {
    setExpandedGRNId(prev => (prev === grnId ? null : grnId));
  };

  const handleMatchInvoice = (poId: string) => {
    setSelectedPOId(poId);
    setIsInvoiceModalOpen(true);
  };

  const handleApproveInvoice = (invId: string) => {
    approveInvoiceForPayment(invId, activeRole);
  };

  const handleSubmitDispute = (invId: string, notes: string) => {
    disputeInvoice(invId, notes);
    setOpenDisputeInvId(null);
    addLog(
      `Invoice ${invId} disputed via GRN Workspace`,
      activeRole,
      activeRole,
      invId,
    );
  };

  // ── GRN table column headers ──────────────────────────────────────────────
  const grnHeaders = [
    'GRN ID',
    'PO Reference',
    'Supplier',
    'Date Received',
    'Delivery Ref',
    'Items',
    'GRN Status',
    'Invoice Status',
    'Actions',
  ];

  // ── Invoice table column headers ──────────────────────────────────────────
  const invHeaders = [
    'Invoice ID',
    'Supplier Inv No',
    'Supplier',
    'Linked PO',
    'Linked GRN',
    'Total (₱)',
    'Match Status',
    'Actions',
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 bg-slate-50 overflow-y-auto min-h-0">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 select-none">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-slate-800 leading-tight">
            Goods Receipt &amp; Invoice Matching
          </h2>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
            GRNs are created from the Purchase Orders workspace · 3-Way match: PO → GRN → Invoice
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PANEL A — GRN Registry
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">

        {/* Panel header */}
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3 select-none">
          <FileCheck className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-extrabold text-slate-800">GRN Registry</h3>
            <p className="text-[10px] text-slate-400 font-semibold">Goods receipt records linked to purchase orders</p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
            {grns.length} {grns.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {/* GRN Table */}
        <div className="overflow-x-auto">
          {grns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Package className="w-10 h-10 text-slate-300 mb-3" />
              <p className="font-bold text-sm">No Goods Receipt Notes found</p>
              <p className="text-xs text-slate-400 mt-1">
                GRNs are recorded from the Purchase Orders workspace when goods arrive.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold uppercase tracking-widest text-slate-500 select-none">
                  {grnHeaders.map(h => (
                    <th
                      key={h}
                      className={`px-3 py-2.5 whitespace-nowrap${h === 'Items' ? ' text-center' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grns.map(grn => (
                  <GRNRow
                    key={grn.id}
                    grn={grn}
                    isExpanded={expandedGRNId === grn.id}
                    onToggleExpand={() => handleToggleExpand(grn.id)}
                    onMatchInvoice={() => handleMatchInvoice(grn.poId)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PANEL B — Invoice Registry
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">

        {/* Panel header */}
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3 select-none">
          <CreditCard className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-extrabold text-slate-800">Invoice Registry</h3>
            <p className="text-[10px] text-slate-400 font-semibold">Supplier invoices with 3-way match status and payment approval workflow</p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider">
            {invoices.length} {invoices.length === 1 ? 'Invoice' : 'Invoices'}
          </span>
        </div>

        {/* Invoice Table */}
        <div className="overflow-x-auto">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <CreditCard className="w-10 h-10 text-slate-300 mb-3" />
              <p className="font-bold text-sm">No supplier invoices recorded</p>
              <p className="text-xs text-slate-400 mt-1">
                Use &apos;Match Invoice&apos; on a GRN with Pending status to log a new invoice.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold uppercase tracking-widest text-slate-500 select-none">
                  {invHeaders.map(h => (
                    <th
                      key={h}
                      className={`px-3 py-2.5 whitespace-nowrap${h === 'Total (₱)' ? ' text-right' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <InvoiceRow
                    key={inv.id}
                    invoice={inv}
                    role={activeRole}
                    onApprove={() => handleApproveInvoice(inv.id)}
                    disputeOpen={openDisputeInvId === inv.id}
                    onOpenDispute={() => setOpenDisputeInvId(inv.id)}
                    onCloseDispute={() => setOpenDisputeInvId(null)}
                    onSubmitDispute={(notes) => handleSubmitDispute(inv.id, notes)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bottom spacer for scroll breathing room */}
      <div className="h-4 flex-shrink-0" />
    </div>
  );
}
