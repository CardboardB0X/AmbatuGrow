'use client';

import React, { useState, useMemo } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Supplier } from '../../types/procurement';
import {
  Plus,
  Star,
  Ban,
  Edit2,
  TrendingUp,
  Package,
  Filter,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < value ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 fill-slate-300'
          }`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

function StatusBadge({ status }: { status: Supplier['status'] }) {
  if (status === 'Active') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
        <CheckCircle2 className="w-3 h-3" />
        Active
      </span>
    );
  }
  if (status === 'Inactive') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        <XCircle className="w-3 h-3" />
        Inactive
      </span>
    );
  }
  // Blacklisted
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
      <Ban className="w-3 h-3" />
      Blacklisted
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  color: 'green' | 'gray' | 'red' | 'blue';
  icon: React.ElementType;
}

function StatCard({ label, value, color, icon: Icon }: StatCardProps) {
  const palette: Record<StatCardProps['color'], string> = {
    green: 'bg-green-50 border-green-200 text-green-700',
    gray: 'bg-slate-100 border-slate-200 text-slate-600',
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
  };
  const iconPalette: Record<StatCardProps['color'], string> = {
    green: 'text-green-600 bg-green-100',
    gray: 'text-slate-500 bg-slate-200',
    red: 'text-red-600 bg-red-100',
    blue: 'text-blue-600 bg-blue-100',
  };
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 flex-1 min-w-0 ${palette[color]}`}>
      <div className={`flex-shrink-0 rounded-lg p-2 ${iconPalette[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium opacity-75 truncate">{label}</p>
        <p className="text-lg font-bold leading-tight truncate">{value}</p>
      </div>
    </div>
  );
}

// ─── Blacklist Confirm Panel ───────────────────────────────────────────────────

interface BlacklistPanelProps {
  supplier: Supplier;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

function BlacklistPanel({ supplier, onConfirm, onCancel }: BlacklistPanelProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Please enter a reason for blacklisting.');
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <tr>
      <td colSpan={11} className="px-0 py-0">
        <div className="mx-4 mb-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800 mb-1">
                Blacklist <span className="font-bold">{supplier.name}</span>?
              </p>
              <p className="text-xs text-red-600 mb-3">
                This action will mark the supplier as blacklisted and prevent future PO creation.
                Provide a reason below.
              </p>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError('');
                }}
                placeholder="Enter blacklist reason…"
                rows={2}
                className="w-full rounded-md border border-red-300 bg-white px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleConfirm}
                  className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                >
                  Confirm Blacklist
                </button>
                <button
                  onClick={onCancel}
                  className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Expanded Performance Row ─────────────────────────────────────────────────

function ExpandedRow({ supplier }: { supplier: Supplier }) {
  return (
    <tr className="bg-slate-50">
      <td colSpan={11} className="px-0 py-0">
        <div className="mx-4 mb-3 rounded-lg border border-slate-200 bg-white p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Orders Value */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              Total Orders Value
            </div>
            <p className="text-sm font-bold text-slate-800">
              ₱{supplier.totalOrdersValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Lead Time */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Package className="w-3.5 h-3.5 text-amber-500" />
              Lead Time
            </div>
            <p className="text-sm font-bold text-slate-800">{supplier.leadTimeDays} days</p>
          </div>

          {/* Payment Terms */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Filter className="w-3.5 h-3.5 text-green-500" />
              Payment Terms
            </div>
            <p className="text-sm font-bold text-slate-800">{supplier.paymentTerms}</p>
          </div>

          {/* Rating */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Star className="w-3.5 h-3.5 text-yellow-400" />
              Performance Rating
            </div>
            <div className="flex items-center gap-2">
              <StarRating value={supplier.rating} />
              <span className="text-xs text-slate-500">({supplier.rating}/5)</span>
            </div>
          </div>

          {/* Blacklist reason if applicable */}
          {supplier.status === 'Blacklisted' && supplier.blacklistReason && (
            <div className="col-span-full flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                <Ban className="w-3.5 h-3.5" />
                Blacklist Reason
              </div>
              <p className="text-xs text-red-700 bg-red-50 rounded-md px-3 py-2 border border-red-100">
                {supplier.blacklistReason}
              </p>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SuppliersWorkspace() {
  const {
    suppliers,
    blacklistSupplier,
    editSupplier,
    setEditingSupplier,
    setIsSupplierDrawerOpen,
  } = useProcurement();

  // ── Filter state ────────────────────────────────────────────────────────────
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // ── Row expansion state ──────────────────────────────────────────────────────
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // ── Blacklist panel state ────────────────────────────────────────────────────
  const [blacklistingId, setBlacklistingId] = useState<string | null>(null);

  // ── Derived values ───────────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = Array.from(new Set(suppliers.map((s) => s.category))).sort();
    return ['All', ...cats];
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const catOk = categoryFilter === 'All' || s.category === categoryFilter;
      const statOk = statusFilter === 'All' || s.status === statusFilter;
      return catOk && statOk;
    });
  }, [suppliers, categoryFilter, statusFilter]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const activeCount = suppliers.filter((s) => s.status === 'Active').length;
  const inactiveCount = suppliers.filter((s) => s.status === 'Inactive').length;
  const blacklistedCount = suppliers.filter((s) => s.status === 'Blacklisted').length;
  const totalPOValue = suppliers.reduce((acc, s) => acc + s.totalOrdersValue, 0);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setIsSupplierDrawerOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsSupplierDrawerOpen(true);
  };

  const handleBlacklistConfirm = (id: string, reason: string) => {
    blacklistSupplier(id, reason);
    setBlacklistingId(null);
  };

  const handleUnblacklist = (supplier: Supplier) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { blacklistReason: _removed, ...rest } = supplier;
    editSupplier({ ...rest, status: 'Active' });
  };

  const handleToggleExpand = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-slate-50 min-h-full p-6 flex flex-col gap-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-tight">Supplier Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, track and evaluate all registered suppliers.
          </p>
        </div>
        <button
          onClick={handleAddSupplier}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2D6A24] text-white text-sm font-semibold hover:bg-[#245720] active:scale-95 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <StatCard
          label="Active Suppliers"
          value={activeCount}
          color="green"
          icon={CheckCircle2}
        />
        <StatCard
          label="Inactive Suppliers"
          value={inactiveCount}
          color="gray"
          icon={XCircle}
        />
        <StatCard
          label="Blacklisted"
          value={blacklistedCount}
          color="red"
          icon={Ban}
        />
        <StatCard
          label="Total PO Value (₱)"
          value={`₱${totalPOValue.toLocaleString('en-PH')}`}
          color="blue"
          icon={TrendingUp}
        />
      </div>

      {/* ── Filters + Table Card ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        {/* Filter bar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-500 mr-1">Filter:</span>

          {/* Category filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none text-xs border border-slate-200 rounded-lg px-3 py-1.5 pr-7 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#2D6A24] cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none text-xs border border-slate-200 rounded-lg px-3 py-1.5 pr-7 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#2D6A24] cursor-pointer"
            >
              {['All', 'Active', 'Inactive', 'Blacklisted'].map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Statuses' : s}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          </div>

          <span className="ml-auto text-xs text-slate-400">
            {filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {/* Expand chevron column */}
                <th className="w-8 px-3 py-3" />
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  Supplier ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  Contact Person
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  Lead Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  Payment Terms
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  Rating
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  Total Orders (₱)
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-6 py-12 text-center text-sm text-slate-400 italic"
                  >
                    No suppliers match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => {
                  const isExpanded = expandedRow === supplier.id;
                  const isBlacklisted = supplier.status === 'Blacklisted';
                  const isBlacklistPanelOpen = blacklistingId === supplier.id;

                  return (
                    <React.Fragment key={supplier.id}>
                      {/* Main data row */}
                      <tr
                        className={`group transition-colors ${
                          isBlacklisted
                            ? 'bg-red-50 hover:bg-red-100'
                            : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        {/* Expand toggle */}
                        <td className="px-3 py-3">
                          <button
                            onClick={() => handleToggleExpand(supplier.id)}
                            className="flex items-center justify-center w-5 h-5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>

                        {/* Supplier ID */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {supplier.id}
                          </span>
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`text-sm font-semibold ${
                              isBlacklisted ? 'text-red-700' : 'text-slate-800'
                            }`}
                          >
                            {supplier.name}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            <Package className="w-3 h-3" />
                            {supplier.category}
                          </span>
                        </td>

                        {/* Contact Person */}
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                          {supplier.contactPerson}
                        </td>

                        {/* Lead Time */}
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                          {supplier.leadTimeDays}d
                        </td>

                        {/* Payment Terms */}
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                          {supplier.paymentTerms}
                        </td>

                        {/* Rating */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StarRating value={supplier.rating} />
                        </td>

                        {/* Total Orders Value */}
                        <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-slate-700">
                          ₱{supplier.totalOrdersValue.toLocaleString('en-PH')}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={supplier.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {/* Edit button */}
                            <button
                              onClick={() => handleEditSupplier(supplier)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-[#2D6A24] text-[#2D6A24] hover:bg-[#2D6A24] hover:text-white transition-colors"
                              title="Edit supplier"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </button>

                            {/* Blacklist / Unblacklist */}
                            {isBlacklisted ? (
                              <button
                                onClick={() => handleUnblacklist(supplier)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-green-600 text-green-700 hover:bg-green-600 hover:text-white transition-colors"
                                title="Restore supplier to Active"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Unblacklist
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  setBlacklistingId(
                                    isBlacklistPanelOpen ? null : supplier.id
                                  )
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-red-400 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                                title="Blacklist this supplier"
                              >
                                <Ban className="w-3 h-3" />
                                Blacklist
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Blacklist confirm panel */}
                      {isBlacklistPanelOpen && !isBlacklisted && (
                        <BlacklistPanel
                          supplier={supplier}
                          onConfirm={(reason) => handleBlacklistConfirm(supplier.id, reason)}
                          onCancel={() => setBlacklistingId(null)}
                        />
                      )}

                      {/* Expanded performance panel */}
                      {isExpanded && <ExpandedRow supplier={supplier} />}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer row count */}
        {filteredSuppliers.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing {filteredSuppliers.length} of {suppliers.length} supplier
              {suppliers.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-slate-400">
              Click a row&apos;s arrow to view performance details
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
