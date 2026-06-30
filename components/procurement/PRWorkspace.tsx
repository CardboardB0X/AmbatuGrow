'use client';

import React, { useState } from 'react';
import {
  Plus,
  CheckCircle,
  XCircle,
  ChevronRight,
  Clock,
  AlertTriangle,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import type { PRStatus, PRPriority } from '../../types/procurement';

// ─── Filter Tab Definition ────────────────────────────────────────────────────

type FilterTab =
  | 'All'
  | 'Pending L1 Approval'
  | 'Pending L2 Approval'
  | 'Approved'
  | 'Rejected'
  | 'Converted to PO';

const FILTER_TABS: FilterTab[] = [
  'All',
  'Pending L1 Approval',
  'Pending L2 Approval',
  'Approved',
  'Rejected',
  'Converted to PO',
];

// ─── Badge Helpers ────────────────────────────────────────────────────────────

function getPriorityBadge(priority: PRPriority) {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold';
  switch (priority) {
    case 'Urgent':
      return (
        <span className={`${base} bg-red-100 text-red-700`}>
          <AlertTriangle className="w-3 h-3 mr-1" />
          Urgent
        </span>
      );
    case 'Normal':
      return (
        <span className={`${base} bg-blue-100 text-blue-700`}>
          Normal
        </span>
      );
    case 'Low':
      return (
        <span className={`${base} bg-slate-100 text-slate-600`}>
          Low
        </span>
      );
    default:
      return <span className={`${base} bg-slate-100 text-slate-600`}>{priority}</span>;
  }
}

function getStatusBadge(status: PRStatus) {
  const base = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap';
  switch (status) {
    case 'Draft':
      return <span className={`${base} bg-slate-100 text-slate-600`}><FileText className="w-3 h-3" />Draft</span>;
    case 'Pending L1 Approval':
      return <span className={`${base} bg-yellow-100 text-yellow-700`}><Clock className="w-3 h-3" />Pending L1</span>;
    case 'Pending L2 Approval':
      return <span className={`${base} bg-orange-100 text-orange-700`}><Clock className="w-3 h-3" />Pending L2</span>;
    case 'Approved':
      return <span className={`${base} bg-green-100 text-green-700`}><CheckCircle className="w-3 h-3" />Approved</span>;
    case 'Rejected':
      return <span className={`${base} bg-red-100 text-red-700`}><XCircle className="w-3 h-3" />Rejected</span>;
    case 'Converted to PO':
      return <span className={`${base} bg-blue-100 text-blue-700`}><ArrowRight className="w-3 h-3" />Converted to PO</span>;
    default:
      return <span className={`${base} bg-slate-100 text-slate-600`}>{status}</span>;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PRWorkspace() {
  const {
    prs,
    activeRole,
    setIsPRDrawerOpen,
    setIsApprovalModalOpen,
    setSelectedPRId,
    convertPRtoPO,
    setActiveTab,
  } = useProcurement();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');

  // ── Derived stats ──────────────────────────────────────────────────────────
  const pendingCount = prs.filter(
    (pr) => pr.status === 'Pending L1 Approval' || pr.status === 'Pending L2 Approval'
  ).length;
  const approvedCount = prs.filter((pr) => pr.status === 'Approved').length;
  const rejectedCount = prs.filter((pr) => pr.status === 'Rejected').length;
  const convertedCount = prs.filter((pr) => pr.status === 'Converted to PO').length;

  // ── Filtered rows ──────────────────────────────────────────────────────────
  const filteredPRs =
    activeFilter === 'All'
      ? prs
      : prs.filter((pr) => pr.status === activeFilter);

  // ── Action handlers ────────────────────────────────────────────────────────
  const handleOpenApprovalModal = (prId: string) => {
    setSelectedPRId(prId);
    setIsApprovalModalOpen(true);
  };

  const handleConvertToPO = (prId: string) => {
    const newPoId = convertPRtoPO(prId);
    if (newPoId) {
      setActiveTab('Purchase Orders');
    }
  };

  // ── Stat cards config ──────────────────────────────────────────────────────
  const statCards = [
    {
      label: 'Pending Approval',
      value: pendingCount,
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      count: 'text-yellow-800',
    },
    {
      label: 'Approved',
      value: approvedCount,
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      count: 'text-green-800',
    },
    {
      label: 'Rejected',
      value: rejectedCount,
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      count: 'text-red-800',
    },
    {
      label: 'Converted to PO',
      value: convertedCount,
      icon: <ArrowRight className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      count: 'text-blue-800',
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 gap-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Purchase Requisitions</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage and approve purchase requisition requests
          </p>
        </div>
        <button
          onClick={() => setIsPRDrawerOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90 active:scale-95"
          style={{ backgroundColor: '#2D6A24' }}
        >
          <Plus className="w-4 h-4" />
          Raise New PR
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`flex items-center gap-4 p-4 rounded-xl border ${card.bg} ${card.border}`}
          >
            <div className="flex-shrink-0 p-2 rounded-lg bg-white/70 shadow-sm">
              {card.icon}
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-wide ${card.text}`}>
                {card.label}
              </p>
              <p className={`text-2xl font-bold ${card.count}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-1 flex-wrap">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab;
          const tabCount =
            tab === 'Pending L1 Approval'
              ? prs.filter((p) => p.status === 'Pending L1 Approval').length
              : tab === 'Pending L2 Approval'
              ? prs.filter((p) => p.status === 'Pending L2 Approval').length
              : tab === 'Approved'
              ? approvedCount
              : tab === 'Rejected'
              ? rejectedCount
              : tab === 'Converted to PO'
              ? convertedCount
              : null;

          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
              style={isActive ? { backgroundColor: '#2D6A24' } : undefined}
            >
              {tab}
              {tabCount !== null && (
                <span
                  className={`inline-flex items-center justify-center rounded-full text-xs w-5 h-5 font-semibold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tabCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {[
                { label: 'PR ID', align: 'text-left' },
                { label: 'Raised By', align: 'text-left' },
                { label: 'Department', align: 'text-left' },
                { label: 'Priority', align: 'text-left' },
                { label: 'Est. Cost (\u20b1)', align: 'text-right' },
                { label: 'Level', align: 'text-center' },
                { label: 'Status', align: 'text-left' },
                { label: 'Date Needed', align: 'text-left' },
                { label: 'Actions', align: 'text-left' },
              ].map((col) => (
                <th
                  key={col.label}
                  className={`${col.align} px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPRs.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <FileText className="w-10 h-10 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">
                      No purchase requisitions found
                    </p>
                    <p className="text-xs text-slate-400">
                      {activeFilter !== 'All'
                        ? `There are no PRs with status "${activeFilter}".`
                        : 'Raise a new PR to get started.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPRs.map((pr) => {
                const dateNeeded = new Date(pr.dateNeeded).toLocaleDateString('en-PH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                const canApproveL1 =
                  pr.status === 'Pending L1 Approval' &&
                  (activeRole === 'Procurement Officer' ||
                    activeRole === 'Procurement Manager');

                const canApproveL2 =
                  pr.status === 'Pending L2 Approval' &&
                  activeRole === 'Procurement Manager';

                const canConvert =
                  pr.status === 'Approved' &&
                  (activeRole === 'Procurement Officer' ||
                    activeRole === 'Procurement Manager');

                return (
                  <tr key={pr.id} className="hover:bg-slate-50 transition-colors group">
                    {/* PR ID */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                        <span className="font-mono font-semibold text-slate-700 text-xs">
                          {pr.id}
                        </span>
                      </div>
                    </td>

                    {/* Raised By */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{pr.requestedBy}</span>
                        <span className="text-xs text-slate-400">{pr.requestorRole}</span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3 text-slate-600">{pr.department}</td>

                    {/* Priority */}
                    <td className="px-4 py-3">{getPriorityBadge(pr.priority)}</td>

                    {/* Est. Cost */}
                    <td className="px-4 py-3 text-right font-semibold text-slate-800 tabular-nums">
                      &#8369;{pr.totalEstimatedCost.toLocaleString('en-PH')}
                    </td>

                    {/* Approval Level */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          pr.approvalLevel === 2
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-teal-100 text-teal-700'
                        }`}
                      >
                        L{pr.approvalLevel}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">{getStatusBadge(pr.status)}</td>

                    {/* Date Needed */}
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {dateNeeded}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {canApproveL1 && (
                          <>
                            <button
                              onClick={() => handleOpenApprovalModal(pr.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve L1
                            </button>
                            <button
                              onClick={() => handleOpenApprovalModal(pr.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        )}

                        {canApproveL2 && (
                          <>
                            <button
                              onClick={() => handleOpenApprovalModal(pr.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve L2
                            </button>
                            <button
                              onClick={() => handleOpenApprovalModal(pr.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        )}

                        {canConvert && (
                          <button
                            onClick={() => handleConvertToPO(pr.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            Convert to PO
                          </button>
                        )}

                        {!canApproveL1 && !canApproveL2 && !canConvert && (
                          <span className="text-xs text-slate-400 italic">&#8212;</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <span>
          Showing{' '}
          <span className="font-semibold text-slate-600">{filteredPRs.length}</span> of{' '}
          <span className="font-semibold text-slate-600">{prs.length}</span> requisitions
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          Role:{' '}
          <span className="font-semibold text-slate-600">{activeRole}</span>
        </span>
      </div>
    </div>
  );
}
