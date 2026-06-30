'use client';

import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { ArrowDown, ArrowUp, Calendar, AlertTriangle, Layers } from 'lucide-react';

export default function TransactionsWorkspace() {
  const { transactions, items, searchQuery } = useInventory();

  // Helper to format ISO dates
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // FEFO proximity calculations (uses June 30, 2026 as reference today date to align with mock timestamps)
  const getExpirationStatus = (dateStr?: string) => {
    if (!dateStr) return null;
    const today = new Date('2026-06-30');
    const exp = new Date(dateStr);
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return {
        label: 'Expired',
        badgeClass: 'bg-red-100 text-red-800 border-red-200',
        alert: true
      };
    } else if (diffDays <= 14) {
      return {
        label: `CRITICAL FEFO: Expiring in ${diffDays} days`,
        badgeClass: 'bg-red-100 text-red-600 border-red-200 font-extrabold animate-pulse',
        alert: true
      };
    } else if (diffDays <= 30) {
      return {
        label: `Near Expiry: ${diffDays} days`,
        badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
        alert: false
      };
    } else {
      return {
        label: `${diffDays} days remaining`,
        badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
        alert: false
      };
    }
  };

  // Filter transactions based on global search
  const filteredTransactions = transactions.filter(tx => {
    const item = items.find(i => i.sku === tx.sku);
    const itemName = item?.name || '';
    const matchString = `${tx.id} ${tx.sku} ${tx.type} ${tx.operator} ${itemName}`.toLowerCase();
    return matchString.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6 bg-slate-50">
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
        {/* Workspace Info Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center select-none">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">Physical Stock Movement Ledger</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Real-time audit log of stock entries and fulfillments</p>
          </div>
          <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider">
            FEFO Tracking Active
          </span>
        </div>

        {/* Ledger Table */}
        <div className="flex-1 overflow-auto">
          {filteredTransactions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
              <Layers className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-bold text-sm">No transaction entries matched search</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing or changing your search terms</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Item Name</th>
                  <th className="p-4 text-center">Type</th>
                  <th className="p-4 text-right">Quantity Changed</th>
                  <th className="p-4">Operator</th>
                  <th className="p-4 text-center">Expiration Proximity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredTransactions.map((tx) => {
                  const item = items.find(i => i.sku === tx.sku);
                  const isStockIn = tx.type === 'Stock-In';
                  const expStatus = getExpirationStatus(tx.expirationDate);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* ID */}
                      <td className="p-4 font-mono text-slate-500 font-bold">{tx.id}</td>

                      {/* Timestamp */}
                      <td className="p-4 text-slate-500 tabular-nums">
                        {formatDate(tx.timestamp)}
                      </td>

                      {/* SKU */}
                      <td className="p-4 font-extrabold text-slate-900">{tx.sku}</td>

                      {/* Item Name */}
                      <td className="p-4 font-bold text-slate-800">{item?.name || 'Unknown Item'}</td>

                      {/* Type Indicator */}
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                            isStockIn
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {isStockIn ? (
                            <>
                              <ArrowDown className="w-3 h-3 text-emerald-600 stroke-[3]" />
                              <span>Stock-In</span>
                            </>
                          ) : (
                            <>
                              <ArrowUp className="w-3 h-3 text-orange-600 stroke-[3]" />
                              <span>Stock-Out</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className={`p-4 text-right font-extrabold tabular-nums text-sm ${
                        isStockIn ? 'text-emerald-600' : 'text-orange-600'
                      }`}>
                        {isStockIn ? '+' : '-'}{tx.qty} {item?.uom || 'units'}
                      </td>

                      {/* Operator */}
                      <td className="p-4 text-slate-600 font-semibold">{tx.operator}</td>

                      {/* Expiration warning pill */}
                      <td className="p-4 text-center">
                        {expStatus ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 border rounded-lg text-[9px] uppercase tracking-wider ${expStatus.badgeClass}`}
                          >
                            {expStatus.alert && (
                              <AlertTriangle className="w-3 h-3 text-red-500 fill-red-100 animate-pulse" />
                            )}
                            <Calendar className="w-3 h-3" />
                            <span>{expStatus.label}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No Expiry Tracked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
