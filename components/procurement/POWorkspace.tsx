'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Download,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Package,
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import { PurchaseOrder } from '../../types/procurement';

// ─── Types ────────────────────────────────────────────────────────────────────

type POStatusFilter =
  | 'All'
  | 'Draft'
  | 'Approved'
  | 'Sent to Supplier'
  | 'Partially Received'
  | 'Fully Received'
  | 'Cancelled';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NON_OVERDUE_STATUSES: PurchaseOrder['status'][] = ['Fully Received', 'Cancelled'];

function isOverdue(po: PurchaseOrder): boolean {
  if (NON_OVERDUE_STATUSES.includes(po.status)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const delivery = new Date(po.expectedDelivery);
  delivery.setHours(0, 0, 0, 0);
  return delivery < today;
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatPeso(value: number): string {
  return value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Status badge colours ─────────────────────────────────────────────────────

const STATUS_BADGE: Record<PurchaseOrder['status'], string> = {
  Draft: 'bg-gray-100 text-gray-700 border border-gray-300',
  Approved: 'bg-blue-100 text-blue-700 border border-blue-300',
  'Sent to Supplier': 'bg-indigo-100 text-indigo-700 border border-indigo-300',
  'Partially Received': 'bg-yellow-100 text-yellow-700 border border-yellow-300',
  'Fully Received': 'bg-green-100 text-green-700 border border-green-300',
  Cancelled: 'bg-red-100 text-red-700 border border-red-300',
};

const STATUS_ICON: Record<PurchaseOrder['status'], React.ReactNode> = {
  Draft: <Clock size={12} className="inline mr-1 -mt-0.5" />,
  Approved: <CheckCircle size={12} className="inline mr-1 -mt-0.5" />,
  'Sent to Supplier': <Send size={12} className="inline mr-1 -mt-0.5" />,
  'Partially Received': <Package size={12} className="inline mr-1 -mt-0.5" />,
  'Fully Received': <CheckCircle size={12} className="inline mr-1 -mt-0.5" />,
  Cancelled: <XCircle size={12} className="inline mr-1 -mt-0.5" />,
};

const FILTER_TABS: POStatusFilter[] = [
  'All',
  'Draft',
  'Approved',
  'Sent to Supplier',
  'Partially Received',
  'Fully Received',
  'Cancelled',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function POWorkspace() {
  const {
    pos,
    activeRole,
    updatePOStatus,
    exportPOasCSV,
    setEditingPO,
    setIsPODrawerOpen,
    setSelectedPOId,
    setIsGRNModalOpen,
    setIsInvoiceModalOpen,
  } = useProcurement();

  const [activeFilter, setActiveFilter] = useState<POStatusFilter>('All');

  // ── Derived stats ────────────────────────────────────────────────────────
  const totalPOs = pos.length;

  const pendingDraftCount = useMemo(
    () => pos.filter((po) => po.status === 'Draft' || po.status === 'Approved').length,
    [pos],
  );

  const activeSentCount = useMemo(
    () => pos.filter((po) => po.status === 'Sent to Supplier').length,
    [pos],
  );

  const overdueCount = useMemo(() => pos.filter(isOverdue).length, [pos]);

  // ── Filtered + sorted list ───────────────────────────────────────────────
  const filteredPOs = useMemo(() => {
    const filtered =
      activeFilter === 'All' ? [...pos] : pos.filter((po) => po.status === activeFilter);

    // Sort: overdue POs bubble to top, then by dateIssued descending
    return filtered.sort((a, b) => {
      const aOverdue = isOverdue(a) ? 1 : 0;
      const bOverdue = isOverdue(b) ? 1 : 0;
      if (bOverdue !== aOverdue) return bOverdue - aOverdue;
      return new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime();
    });
  }, [pos, activeFilter]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  function poHasGRN(po: PurchaseOrder): boolean {
    return po.linkedGrnIds.length > 0;
  }

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleCreatePO() {
    setEditingPO(null);
    setIsPODrawerOpen(true);
  }

  function handleEditPO(po: PurchaseOrder) {
    setEditingPO(po);
    setIsPODrawerOpen(true);
  }

  function handleMarkSent(po: PurchaseOrder) {
    updatePOStatus(po.id, 'Sent to Supplier');
  }

  function handleReceiveGoods(po: PurchaseOrder) {
    setSelectedPOId(po.id);
    setIsGRNModalOpen(true);
  }

  function handleMatchInvoice(po: PurchaseOrder) {
    setSelectedPOId(po.id);
    setIsInvoiceModalOpen(true);
  }

  function handleCancelPO(po: PurchaseOrder) {
    updatePOStatus(po.id, 'Cancelled');
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="bg-slate-50 min-h-full p-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Purchase Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage, track, and receive all purchase orders
          </p>
        </div>
        <button
          onClick={handleCreatePO}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 active:bg-green-900 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow transition-colors duration-150"
        >
          <Plus size={16} />
          Create PO
        </button>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {/* Total POs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Package size={20} className="text-green-700" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total POs</p>
            <p className="text-2xl font-bold text-gray-800">{totalPOs}</p>
          </div>
        </div>

        {/* Pending / Draft */}
        <div className="bg-white rounded-xl border border-yellow-200 shadow-sm p-4 flex items-center gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
            <Clock size={20} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending / Draft</p>
            <p className="text-2xl font-bold text-yellow-700">{pendingDraftCount}</p>
          </div>
        </div>

        {/* Active / Sent */}
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-4 flex items-center gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Send size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active / Sent</p>
            <p className="text-2xl font-bold text-blue-700">{activeSentCount}</p>
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-4 flex items-center gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Overdue</p>
            <p className="text-2xl font-bold text-red-700">{overdueCount}</p>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4">
        <div className="flex overflow-x-auto">
          {FILTER_TABS.map((tab) => {
            const count =
              tab === 'All'
                ? pos.length
                : pos.filter((po) => po.status === tab).length;
            const isActive = activeFilter === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={[
                  'flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-150 whitespace-nowrap',
                  isActive
                    ? 'border-green-700 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                ].join(' ')}
              >
                {tab}
                <span
                  className={[
                    'inline-flex items-center justify-center text-xs rounded-full px-1.5 py-0.5 min-w-[20px] font-semibold',
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500',
                  ].join(' ')}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">PO ID</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Linked PR</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Supplier</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Date Issued</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Expected Delivery</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Subtotal (₱)</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">VAT (₱)</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Total (₱)</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPOs.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                    <Package size={36} className="mx-auto mb-2 opacity-40" />
                    <p className="font-medium">No purchase orders found</p>
                    <p className="text-xs mt-1">
                      {activeFilter !== 'All'
                        ? `No POs with status "${activeFilter}".`
                        : 'Create your first PO using the button above.'}
                    </p>
                  </td>
                </tr>
              )}
              {filteredPOs.map((po, idx) => {
                const overdue = isOverdue(po);
                const hasGRN = poHasGRN(po);
                const canReceive =
                  po.status === 'Sent to Supplier' || po.status === 'Partially Received';
                const canEdit = po.status === 'Draft';
                const canMarkSent = po.status === 'Approved';
                const canCancel =
                  activeRole === 'Procurement Manager' &&
                  (po.status === 'Draft' || po.status === 'Approved');

                return (
                  <tr
                    key={po.id}
                    className={[
                      'border-b border-gray-100 last:border-0 transition-colors duration-100',
                      overdue
                        ? 'bg-red-50 hover:bg-red-100'
                        : idx % 2 === 0
                          ? 'hover:bg-slate-50'
                          : 'bg-gray-50/40 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    {/* PO ID */}
                    <td className="px-4 py-3 font-mono font-semibold text-green-800 whitespace-nowrap">
                      {po.id}
                    </td>

                    {/* Linked PR */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {po.prId ? (
                        <span className="font-mono text-indigo-700 text-xs bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5">
                          {po.prId}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Supplier */}
                    <td
                      className="px-4 py-3 text-gray-700 whitespace-nowrap max-w-[180px] truncate"
                      title={po.supplierName}
                    >
                      {po.supplierName}
                    </td>

                    {/* Date Issued */}
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDate(po.dateIssued)}
                    </td>

                    {/* Expected Delivery */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={overdue ? 'text-red-700 font-semibold' : 'text-gray-600'}>
                        {formatDate(po.expectedDelivery)}
                      </span>
                    </td>

                    {/* Subtotal */}
                    <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap font-mono tabular-nums">
                      {formatPeso(po.subtotal)}
                    </td>

                    {/* VAT (12%) */}
                    <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap font-mono tabular-nums">
                      {formatPeso(po.tax)}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 text-right font-semibold text-gray-800 whitespace-nowrap font-mono tabular-nums">
                      {formatPeso(po.totalAmount)}
                    </td>

                    {/* Status + Overdue badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-wrap items-center gap-1">
                        <span
                          className={[
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                            STATUS_BADGE[po.status],
                          ].join(' ')}
                        >
                          {STATUS_ICON[po.status]}
                          {po.status}
                        </span>
                        {overdue && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-red-600 text-white text-xs font-bold px-2 py-0.5">
                            <AlertTriangle size={10} className="-mt-0.5" />
                            Overdue
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">

                        {/* Export CSV — always visible */}
                        <button
                          onClick={() => exportPOasCSV(po.id)}
                          title="Export as CSV"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition-colors"
                        >
                          <Download size={12} />
                          CSV
                        </button>

                        {/* Edit — Draft only */}
                        {canEdit && (
                          <button
                            onClick={() => handleEditPO(po)}
                            title="Edit PO"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-50 hover:bg-green-100 text-green-700 border border-green-300 transition-colors"
                          >
                            Edit
                          </button>
                        )}

                        {/* Mark Sent — Approved only */}
                        {canMarkSent && (
                          <button
                            onClick={() => handleMarkSent(po)}
                            title="Mark as Sent to Supplier"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-300 transition-colors"
                          >
                            <Send size={12} />
                            Mark Sent
                          </button>
                        )}

                        {/* Receive Goods — Sent / Partially Received */}
                        {canReceive && (
                          <button
                            onClick={() => handleReceiveGoods(po)}
                            title="Receive Goods"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-300 transition-colors"
                          >
                            <Package size={12} />
                            Receive
                          </button>
                        )}

                        {/* Match Invoice — any PO with linked GRNs */}
                        {hasGRN && (
                          <button
                            onClick={() => handleMatchInvoice(po)}
                            title="Match Supplier Invoice"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 transition-colors"
                          >
                            <CheckCircle size={12} />
                            Invoice
                          </button>
                        )}

                        {/* Cancel — Draft/Approved, Procurement Manager only */}
                        {canCancel && (
                          <button
                            onClick={() => handleCancelPO(po)}
                            title="Cancel PO"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 transition-colors"
                          >
                            <XCircle size={12} />
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer ──────────────────────────────────────────────── */}
        {filteredPOs.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing{' '}
              <span className="font-semibold text-gray-700">{filteredPOs.length}</span>{' '}
              {filteredPOs.length === 1 ? 'purchase order' : 'purchase orders'}
              {activeFilter !== 'All' && (
                <>
                  {' '}with status{' '}
                  <span className="font-semibold text-gray-700">&ldquo;{activeFilter}&rdquo;</span>
                </>
              )}
            </p>
            {overdueCount > 0 && (
              <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                <AlertTriangle size={12} />
                {overdueCount} overdue {overdueCount === 1 ? 'order' : 'orders'} — immediate action required
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
