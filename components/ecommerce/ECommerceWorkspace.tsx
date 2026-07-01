'use client';

import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { 
  Globe, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Plus, 
  FileText, 
  Database,
  CreditCard,
  Layers
} from 'lucide-react';

interface EcomOrder {
  id: string;
  customerName: string;
  email: string;
  items: string;
  totalPrice: number;
  channel: 'Shopify' | 'WooCommerce' | 'Shopee' | 'Lazada';
  status: 'Synced' | 'Pending' | 'Discrepancy';
  date: string;
  erpRef?: string;
}

interface PimProduct {
  sku: string;
  name: string;
  category: string;
  erpPrice: number;
  shopifyPrice: number;
  wooPrice: number;
  shopeePrice: number;
  syncStatus: 'In Sync' | 'Price Mismatch' | 'Out of Stock';
  lastPushed: string;
}

interface PaymentReconciliation {
  gatewayId: string;
  orderId: string;
  channel: string;
  gateway: 'Shopify Payments' | 'Stripe' | 'ShopeePay' | 'Lazada Wallet';
  amount: number;
  fee: number;
  netPayout: number;
  matchStatus: 'Matched' | 'Discrepancy' | 'Unreconciled';
}

export default function ECommerceWorkspace() {
  const { items: inventoryItems } = useInventory();
  const [activeTab, setActiveTab] = useState<'orders' | 'stock' | 'pim' | 'payments'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 1. Order Sync State
  const [orders, setOrders] = useState<EcomOrder[]>([
    { id: 'SHO-1082', customerName: 'Juan Dela Cruz', email: 'juan@gmail.com', items: 'Hybrid Rice Seeds (x2)', totalPrice: 3600, channel: 'Shopify', status: 'Synced', date: '2026-07-01T07:45:00Z', erpRef: 'SO-10920' },
    { id: 'WOO-8849', customerName: 'Maria Santos', email: 'maria@outlook.com', items: 'Organic Fertilizer (x5)', totalPrice: 3250, channel: 'WooCommerce', status: 'Synced', date: '2026-07-01T07:20:00Z', erpRef: 'SO-10921' },
    { id: 'LAZ-4418', customerName: 'Jose Rizal', email: 'pepe@lazada.ph', items: 'Raw Honey (x1)', totalPrice: 250, channel: 'Lazada', status: 'Pending', date: '2026-07-01T06:50:00Z' },
    { id: 'SHP-9920', customerName: 'Andres Bonifacio', email: 'bonifacio@shopee.ph', items: 'Industrial Gloves (x10)', totalPrice: 1500, channel: 'Shopee', status: 'Discrepancy', date: '2026-07-01T06:12:00Z' },
  ]);

  // 2. Product PIM State
  const [pimCatalog, setPimCatalog] = useState<PimProduct[]>([
    { sku: 'AGRI-SEED-042', name: 'Rambutan Seeds', category: 'Agriculture', erpPrice: 1500, shopifyPrice: 1500, wooPrice: 1500, shopeePrice: 1500, syncStatus: 'In Sync', lastPushed: '2026-07-01T01:00:00Z' },
    { sku: 'AGRI-PROD-001', name: 'Honey (1L)', category: 'Agriculture', erpPrice: 250, shopifyPrice: 280, wooPrice: 250, shopeePrice: 250, syncStatus: 'Price Mismatch', lastPushed: '2026-06-30T18:30:00Z' },
    { sku: 'COMP-MNT-012', name: 'Server Monitor', category: 'Electronics', erpPrice: 8500, shopifyPrice: 8500, wooPrice: 8500, shopeePrice: 8500, syncStatus: 'In Sync', lastPushed: '2026-07-01T02:15:00Z' },
    { sku: 'COMP-LPT-001', name: 'ThinkPad Laptop', category: 'Electronics', erpPrice: 45000, shopifyPrice: 45000, wooPrice: 45000, shopeePrice: 45000, syncStatus: 'Out of Stock', lastPushed: '2026-06-29T12:00:00Z' }
  ]);

  // 3. Payment Reconciliation State
  const [reconciliations, setReconciliations] = useState<PaymentReconciliation[]>([
    { gatewayId: 'TXN-SH-091', orderId: 'SHO-1082', channel: 'Shopify', gateway: 'Shopify Payments', amount: 3600, fee: 108, netPayout: 3492, matchStatus: 'Matched' },
    { gatewayId: 'TXN-WO-129', orderId: 'WOO-8849', channel: 'WooCommerce', gateway: 'Stripe', amount: 3250, fee: 97.5, netPayout: 3152.5, matchStatus: 'Matched' },
    { gatewayId: 'TXN-LZ-562', orderId: 'LAZ-4418', channel: 'Lazada', gateway: 'Lazada Wallet', amount: 250, fee: 12.5, netPayout: 237.5, matchStatus: 'Unreconciled' },
    { gatewayId: 'TXN-SP-883', orderId: 'SHP-9920', channel: 'Shopee', gateway: 'ShopeePay', amount: 1500, fee: 75, netPayout: 1425, matchStatus: 'Discrepancy' }
  ]);

  const triggerToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSyncAll = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      // Auto resolve pending order
      setOrders(prev => prev.map(o => o.status === 'Pending' ? { ...o, status: 'Synced', erpRef: `SO-${Math.floor(10000 + Math.random() * 90000)}` } : o));
      // Auto resolve payment discrepancies
      setReconciliations(prev => prev.map(r => r.matchStatus === 'Unreconciled' ? { ...r, matchStatus: 'Matched' } : r));
      triggerToast('E-commerce order directories, stock levels, and payment gateways synchronized successfully!');
    }, 2000);
  };

  const handleManualOrderSync = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        if (o.status !== 'Synced') {
          triggerToast(`Order ${id} details successfully synced to ERP database!`);
          return { ...o, status: 'Synced', erpRef: `SO-${Math.floor(10000 + Math.random() * 90000)}` };
        }
      }
      return o;
    }));
  };

  const handlePushPrice = (sku: string) => {
    setPimCatalog(prev => prev.map(p => {
      if (p.sku === sku) {
        triggerToast(`Pushed ERP pricing of ₱${p.erpPrice.toLocaleString()} to Shopify & WooCommerce catalog.`);
        return { ...p, shopifyPrice: p.erpPrice, wooPrice: p.erpPrice, syncStatus: 'In Sync', lastPushed: new Date().toISOString() };
      }
      return p;
    }));
  };

  const handleReconcileGateway = (gatewayId: string) => {
    setReconciliations(prev => prev.map(r => {
      if (r.gatewayId === gatewayId) {
        triggerToast(`Payment gate transaction ${gatewayId} successfully reconciled!`);
        return { ...r, matchStatus: 'Matched' };
      }
      return r;
    }));
  };

  return (
    <div className="flex-1 bg-slate-50 p-6 flex flex-col min-h-0 overflow-hidden font-sans select-none">
      
      {/* ── HEADER ROW ── */}
      <div className="flex items-center justify-between flex-shrink-0 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 text-[#2D6A24] border border-emerald-100 rounded-xl">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-800">
              E-Commerce Multi-Channel Integration Workspace
            </h2>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              Sync orders, PIM catalog details, safety stock margins, and payment reconciliation gateways.
            </p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <input 
              type="checkbox" 
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="rounded text-[#2D6A24] focus:ring-0 focus:ring-offset-0 cursor-pointer" 
            />
            <span>Auto-sync API</span>
          </label>

          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2D6A24] hover:bg-[#23531B] disabled:bg-emerald-800/40 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Synchronizing...' : 'Force Global Sync'}</span>
          </button>
        </div>
      </div>

      {/* ── TOAST NOTIFICATION ── */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3 z-50 animate-slide-in-right">
          <div className="p-1 text-emerald-500 bg-emerald-500/10 rounded-lg">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-[11px] font-bold">
            {successMsg}
          </div>
        </div>
      )}

      {/* ── TAB SELECTOR ── */}
      <div className="flex border-b border-slate-200 flex-shrink-0 bg-white rounded-xl p-1 mb-5 shadow-xs">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'orders' ? 'bg-emerald-50 text-[#2D6A24]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Order Sync</span>
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex-1 py-2 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'stock' ? 'bg-emerald-50 text-[#2D6A24]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Stock Updates</span>
        </button>
        <button
          onClick={() => setActiveTab('pim')}
          className={`flex-1 py-2 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'pim' ? 'bg-emerald-50 text-[#2D6A24]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>PIM Catalog</span>
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 py-2 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'payments' ? 'bg-emerald-50 text-[#2D6A24]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Customer & Payments</span>
        </button>
      </div>

      {/* ── CORE VIEW CONTENT ── */}
      <div className="flex-1 min-h-0 bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col shadow-xs overflow-y-auto">
        
        {/* ── TAB 1: ORDER SYNC ── */}
        {activeTab === 'orders' && (
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Real-Time Order Synchronization logs
              </span>
              <div className="w-64 relative">
                <Search className="absolute left-2.5 top-1.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter order ID or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 min-h-[280px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">E-Com ID</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Customer details</th>
                    <th className="p-3">Synced line items</th>
                    <th className="p-3 text-right">Total (₱)</th>
                    <th className="p-3 text-center">Sync status</th>
                    <th className="p-3">ERP Ref</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {orders
                    .filter(o => o.id.includes(searchQuery) || o.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/20">
                        <td className="p-3 font-extrabold text-slate-800">{order.id}</td>
                        <td className="p-3">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-100 border border-slate-200/50">
                            {order.channel}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-extrabold text-slate-800">{order.customerName}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{order.email}</div>
                        </td>
                        <td className="p-3 text-slate-500 font-semibold">{order.items}</td>
                        <td className="p-3 text-right font-black text-slate-800">
                          ₱{order.totalPrice.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider border ${
                            order.status === 'Synced' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/50'
                              : order.status === 'Pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200/50'
                              : 'bg-red-50 text-red-800 border-red-200/50 font-black'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[10px] text-slate-600">
                          {order.erpRef || <span className="text-slate-300 italic">Unlinked</span>}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleManualOrderSync(order.id)}
                            disabled={order.status === 'Synced'}
                            className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider border rounded-lg cursor-pointer ${
                              order.status === 'Synced'
                                ? 'bg-slate-50 text-slate-300 border-slate-200/50 cursor-not-allowed'
                                : 'bg-emerald-50 text-[#2D6A24] border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            Sync to ERP
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: STOCK UPDATES ── */}
        {activeTab === 'stock' && (
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Multi-Channel Stock Availability (Overselling Protection)
              </span>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 font-bold flex gap-1.5 items-center">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Overselling margin active: 10% safety buffer applied to channels automatically.</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 min-h-[280px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">SKU</th>
                    <th className="p-3">Product details</th>
                    <th className="p-3 text-center">ERP physical stock</th>
                    <th className="p-3 text-center">Shopify count</th>
                    <th className="p-3 text-center">WooCommerce</th>
                    <th className="p-3 text-center">Lazada</th>
                    <th className="p-3 text-center">Shopee</th>
                    <th className="p-3 text-center">Sync status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {pimCatalog.map(prod => {
                    const invItem = inventoryItems.find(i => i.sku === prod.sku);
                    const physicalQty = invItem ? invItem.stockQty : 0;
                    const channelQty = Math.max(0, Math.floor(physicalQty * 0.9));

                    return (
                      <tr key={prod.sku} className="hover:bg-slate-50/20">
                        <td className="p-3 font-extrabold text-slate-800">{prod.sku}</td>
                        <td className="p-3">
                          <div className="font-extrabold text-slate-800">{prod.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{prod.category}</div>
                        </td>
                        <td className="p-3 text-center font-black text-slate-800">{physicalQty}</td>
                        <td className="p-3 text-center text-slate-500 font-bold">{channelQty}</td>
                        <td className="p-3 text-center text-slate-500 font-bold">{channelQty}</td>
                        <td className="p-3 text-center text-slate-500 font-bold">{channelQty}</td>
                        <td className="p-3 text-center text-slate-500 font-bold">{channelQty}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider border ${
                            prod.syncStatus === 'In Sync' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/50'
                              : prod.syncStatus === 'Price Mismatch'
                              ? 'bg-amber-50 text-amber-800 border-amber-200/50'
                              : 'bg-red-50 text-red-800 border-red-200/50 font-black'
                          }`}>
                            {prod.syncStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: PRODUCT PIM ── */}
        {activeTab === 'pim' && (
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Product Information Management (PIM) Price Synchronization
              </span>
              <button
                onClick={() => triggerToast('Successfully published catalog metadata changes to all connected online store databases.')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#2D6A24] border border-emerald-200 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Publish Catalog Item
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 min-h-[280px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">SKU</th>
                    <th className="p-3">Product catalog name</th>
                    <th className="p-3 text-right">ERP price (₱)</th>
                    <th className="p-3 text-right">Shopify (₱)</th>
                    <th className="p-3 text-right">WooCommerce (₱)</th>
                    <th className="p-3 text-center">Sync status</th>
                    <th className="p-3">Last updated</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {pimCatalog.map(prod => (
                    <tr key={prod.sku} className="hover:bg-slate-50/20">
                      <td className="p-3 font-extrabold text-slate-800">{prod.sku}</td>
                      <td className="p-3 font-extrabold text-slate-800">{prod.name}</td>
                      <td className="p-3 text-right font-black text-slate-800">
                        ₱{prod.erpPrice.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-slate-600">
                        ₱{prod.shopifyPrice.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-slate-600">
                        ₱{prod.wooPrice.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider border ${
                          prod.syncStatus === 'In Sync' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200/50'
                            : 'bg-amber-50 text-amber-800 border-amber-200/50'
                        }`}>
                          {prod.syncStatus}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 font-semibold">
                        {new Date(prod.lastPushed).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handlePushPrice(prod.sku)}
                          disabled={prod.syncStatus === 'In Sync'}
                          className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider border rounded-lg cursor-pointer ${
                            prod.syncStatus === 'In Sync'
                              ? 'bg-slate-50 text-slate-300 border-slate-200/50 cursor-not-allowed'
                              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          Push Price
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 4: CUSTOMER & PAYMENTS ── */}
        {activeTab === 'payments' && (
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Payment Gateway Reconciliation Feed
            </span>

            <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 min-h-[280px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Gateway ID</th>
                    <th className="p-3">Linked Order</th>
                    <th className="p-3">Gateway</th>
                    <th className="p-3 text-right">Gross (₱)</th>
                    <th className="p-3 text-right">Fee (₱)</th>
                    <th className="p-3 text-right">Net payout (₱)</th>
                    <th className="p-3 text-center">Match status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {reconciliations.map(recon => (
                    <tr key={recon.gatewayId} className="hover:bg-slate-50/20">
                      <td className="p-3 font-mono font-extrabold text-slate-800">{recon.gatewayId}</td>
                      <td className="p-3 font-extrabold text-slate-800">{recon.orderId}</td>
                      <td className="p-3 text-slate-500 font-bold">{recon.gateway}</td>
                      <td className="p-3 text-right font-bold text-slate-700">
                        ₱{recon.amount.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-red-600 font-bold">
                        -₱{recon.fee.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-black text-[#2D6A24]">
                        ₱{recon.netPayout.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider border ${
                          recon.matchStatus === 'Matched' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200/50'
                            : recon.matchStatus === 'Unreconciled'
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-red-50 text-red-800 border-red-200/50 font-black'
                        }`}>
                          {recon.matchStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleReconcileGateway(recon.gatewayId)}
                          disabled={recon.matchStatus === 'Matched'}
                          className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider border rounded-lg cursor-pointer ${
                            recon.matchStatus === 'Matched'
                              ? 'bg-slate-50 text-slate-300 border-slate-200/50 cursor-not-allowed'
                              : 'bg-emerald-50 text-[#2D6A24] border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          Reconcile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
