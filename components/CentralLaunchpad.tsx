'use client';

import React, { useState, useEffect, useMemo } from 'react';

import { useInventory } from '../context/InventoryContext';
import { useSales } from '../context/SalesContext';
import { useProcurement } from '../context/ProcurementContext';
import { useSCM } from '../context/SCMContext';
import { useHelpdesk } from '../context/HelpdeskContext';
import { 
  Layers, 
  ShoppingBag, 
  Truck, 
  LineChart, 
  LifeBuoy, 
  Lock, 
  Loader2,
  RefreshCw,
  CheckCircle,
  Globe
} from 'lucide-react';

interface ModuleCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  telemetryText: string;
  telemetryColor: string; // Tailwind bg class
  allowedRoles: string[]; // roles that can access this card
}

interface SyncedOrder {
  id: string;
  channel: 'Shopify' | 'WooCommerce' | 'Shopee' | 'Lazada';
  item: string;
  qty: number;
  total: number;
  time: string;
  status: 'Synced' | 'Pending' | 'Flagged';
}

export default function CentralLaunchpad() {
  const { 
    userRole, 
    setCurrentView,
    setModuleTab,
    searchQuery,
    items,
    logs: itemsLogs
  } = useInventory();
  const salesContext = useSales();
  const procContext = useProcurement();
  const scmContext = useSCM();
  const helpdeskContext = useHelpdesk();

  const lowStockCount = items.filter(i => i.status === 'Active' && i.stockQty <= i.minQty).length;
  const pendingApprovalsCount = procContext?.prs.filter(p => p.status === 'Pending L1 Approval' || p.status === 'Pending L2 Approval').length ?? 0;
  const inTransitCount = scmContext?.shipments.filter(s => s.status === 'In Transit').length ?? 0;
  const salesRevenue = salesContext?.totalRevenue ?? 0;
  const openTicketsCount = helpdeskContext?.tickets.filter(t => t.status === 'Open').length ?? 0;

  const [loadingModule, setLoadingModule] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  const [logsBaseTime] = useState<number>(() => Date.now());
  
  // Real-time synced orders feed state
  const [syncedOrders, setSyncedOrders] = useState<SyncedOrder[]>([
    { id: 'SHO-1082', channel: 'Shopify', item: 'Hybrid Rice Seeds', qty: 2, total: 3600, time: '2m ago', status: 'Synced' },
    { id: 'WOO-8849', channel: 'WooCommerce', item: 'Organic Fertilizer', qty: 5, total: 3250, time: '12m ago', status: 'Synced' },
    { id: 'LAZ-4418', channel: 'Lazada', item: 'Raw Honey (1L)', qty: 1, total: 250, time: '25m ago', status: 'Synced' },
    { id: 'SHP-9920', channel: 'Shopee', item: 'Industrial Gloves', qty: 10, total: 1500, time: '44m ago', status: 'Synced' },
  ]);

  const handleLaunchModule = (mod: ModuleCard) => {
    setLoadingModule(mod.title);

    setTimeout(() => {
      setLoadingModule(null);
      if (mod.id === 'inventory') {
        setCurrentView('inventory');
        setModuleTab('default');
      } else if (mod.id === 'procurement') {
        setCurrentView('procurement');
        setModuleTab('Requisitions');
      } else if (mod.id === 'supply_chain') {
        setCurrentView('supply_chain');
        setModuleTab('demand');
      } else if (mod.id === 'sales') {
        setCurrentView('sales');
        setModuleTab('quotes');
      } else if (mod.id === 'helpdesk') {
        setCurrentView('helpdesk');
        setModuleTab('tickets');
      } else {
        setSuccessToast(`Simulation completed: ${mod.title} sandbox interface initialized successfully!`);
        setTimeout(() => setSuccessToast(null), 3000);
      }
    }, 1500);
  };

  const handleManualSync = () => {
    setSyncing(true);
    
    // Simulate real-time API syncing
    setTimeout(() => {
      setSyncing(false);
      setLastSyncTime('Just now');
      
      // Prepend a fresh mock synced order
      const newOrder: SyncedOrder = {
        id: `SHO-${Math.floor(1000 + Math.random() * 9000)}`,
        channel: 'Shopify',
        item: 'Hybrid Rice Seeds',
        qty: 1,
        total: 1800,
        time: 'Just now',
        status: 'Synced'
      };
      
      setSyncedOrders(prev => [newOrder, ...prev.slice(0, 4)]);

      // Add the order to the sales database (triggers automatic inventory deduction!)
      salesContext.addSalesOrder({
        customerName: 'Shopify Checkout Client',
        email: 'shopify-buyer@gmail.com',
        items: [{
          sku: 'AGRI-SEED-042',
          name: 'Hybrid Rice Seeds',
          qty: 1,
          price: 1800
        }],
        discount: 0,
        status: 'Processed'
      });

      setSuccessToast('E-Commerce multi-channel directories synchronized and deducted from active stocks!');
      setTimeout(() => setSuccessToast(null), 3000);
    }, 2000);
  };

  // Simulating relative time ticker updates
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncTime(prev => {
        if (prev === 'Just now') return '1m ago';
        if (prev.endsWith('m ago')) {
          const mins = parseInt(prev) + 1;
          return `${mins}m ago`;
        }
        return prev;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 5 core operational modules to keep
  const erpModules: ModuleCard[] = [
    {
      id: 'inventory',
      title: 'Inventory & Warehouse Management',
      description: 'Tracks item stock levels, executes transactions, maps zone locations, and evaluates alerts.',
      icon: Layers,
      telemetryText: lowStockCount === 1 ? '1 Low Stock Warning' : `${lowStockCount} Low Stock Warnings`,
      telemetryColor: lowStockCount > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      allowedRoles: ['System Administrator', 'Inventory Officer', 'Procurement Officer']
    },
    {
      id: 'procurement',
      title: 'Procurement (Purchasing)',
      description: 'Initiates purchase requisitions, handles supplier profiles, tracks PO status, and performs 3-way matching.',
      icon: ShoppingBag,
      telemetryText: pendingApprovalsCount === 1 ? '1 Pending Approval' : `${pendingApprovalsCount} Pending Approvals`,
      telemetryColor: pendingApprovalsCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200',
      allowedRoles: ['System Administrator', 'Inventory Officer', 'Procurement Officer']
    },
    {
      id: 'supply_chain',
      title: 'Supply Chain Management',
      description: 'Conducts demand forecasting, coordinates supplier logistics, plans routes, and balances warehouse distribution.',
      icon: Truck,
      telemetryText: inTransitCount === 1 ? '1 Active Shipment' : `${inTransitCount} Active Shipments`,
      telemetryColor: inTransitCount > 0 ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200',
      allowedRoles: ['System Administrator', 'Inventory Officer']
    },
    {
      id: 'sales',
      title: 'Sales Order Management',
      description: 'Orchestrates customer quotations, processes order fulfillments, manages CRM segments, and tracks performance metrics.',
      icon: LineChart,
      telemetryText: `₱${salesRevenue.toLocaleString()} Revenue`,
      telemetryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      allowedRoles: ['System Administrator']
    },
    {
      id: 'helpdesk',
      title: 'Customer Service / Helpdesk',
      description: 'Handles ticket systems, supports user self-service portals, archives communication histories, and tracks SLA rules.',
      icon: LifeBuoy,
      telemetryText: openTicketsCount === 1 ? '1 Open Ticket' : `${openTicketsCount} Open Tickets`,
      telemetryColor: openTicketsCount > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-700 border-slate-200',
      allowedRoles: ['System Administrator']
    }
  ];

  // Filter modules based on header search query
  const filteredModules = erpModules.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedLogs = useMemo(() => {
    const base = logsBaseTime || 1782800000000;
    return [
      ...(itemsLogs || []).map(l => ({
        module: 'INVENTORY',
        color: 'text-slate-300',
        tagColor: 'bg-slate-800 text-slate-300 border-slate-700',
        timestamp: l.timestamp || 'Just now',
        message: l.message,
        unix: l.id ? parseInt(l.id.replace('LOG-', '')) || base : base
      })),
      ...(procContext?.procLogs || []).map((l, idx) => ({
        module: 'PROCUREMENT',
        color: 'text-amber-300',
        tagColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        timestamp: l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : 'Active',
        message: l.message,
        unix: l.timestamp ? new Date(l.timestamp).getTime() : base - idx * 1000
      })),
      ...(scmContext?.scmLogs || []).map((l, idx) => ({
        module: 'LOGISTICS',
        color: 'text-cyan-300',
        tagColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
        timestamp: 'Telemetry',
        message: l,
        unix: base - idx * 1000 - 500
      })),
      ...(salesContext?.salesOrders || []).map(o => {
        const timeVal = o.dateRaised ? new Date(o.dateRaised).getTime() : base;
        return {
          module: 'SALES',
          color: 'text-emerald-300',
          tagColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
          timestamp: o.dateRaised ? new Date(o.dateRaised).toLocaleTimeString() : 'Just now',
          message: `Sales Order processed: ${o.id} for ${o.customerName} (₱${o.total.toLocaleString()})`,
          unix: timeVal
        };
      }),
      ...(helpdeskContext?.tickets || []).map(t => {
        const timeVal = t.dateCreated ? new Date(t.dateCreated).getTime() : base;
        return {
          module: 'HELPDESK',
          color: 'text-rose-300',
          tagColor: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
          timestamp: t.dateCreated ? new Date(t.dateCreated).toLocaleTimeString() : 'Just now',
          message: `Support incident ${t.id} raised: "${t.issue}" (Priority: ${t.priority})`,
          unix: timeVal
        };
      })
    ].sort((a, b) => b.unix - a.unix).slice(0, 25);
  }, [itemsLogs, procContext?.procLogs, scmContext?.scmLogs, salesContext?.salesOrders, helpdeskContext?.tickets, logsBaseTime]);

  return (
    <div className="flex-1 bg-slate-50 flex flex-col font-sans select-none relative overflow-y-auto min-h-0">
      
      {/* ── FULL SCREEN ROUTE LOADER SIMULATION ── */}
      {loadingModule && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center z-50 transition-all">
          <Loader2 className="w-12 h-12 text-[#2D6A24] animate-spin" />
          <h3 className="text-white font-extrabold text-sm uppercase tracking-widest mt-4">
            Launching {loadingModule}...
          </h3>
          <p className="text-[10px] text-emerald-200/80 font-bold mt-1">
            Setting up secure workspace directory nodes
          </p>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {successToast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3 z-50 animate-slide-in-right">
          <div className="p-1 text-emerald-500 bg-emerald-500/10 rounded-lg">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-[11px] font-bold">
            {successToast}
          </div>
        </div>
      )}

      {/* ── CENTRAL SPLIT VIEW: Bento modules left, E-commerce dashboard right ── */}
      <div className="flex-1 p-8 flex flex-col lg:flex-row gap-8 min-h-0">
        
        {/* LEFT COLUMN: Bento directory grid */}
        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              Operational Modules Directory
            </h3>
            <p className="text-xs text-slate-400 font-bold leading-normal">
              Select an authorized module below to launch terminal interfaces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredModules.map((mod) => {
              const Icon = mod.icon;
              const isUnlocked = mod.allowedRoles.includes(userRole);

              return (
                <div
                  key={mod.id}
                  onClick={() => isUnlocked && handleLaunchModule(mod)}
                  className={`relative bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-all duration-300 ${
                    isUnlocked 
                      ? 'hover:-translate-y-1 hover:shadow-md hover:bg-[#2D6A24]/[0.015] hover:border-emerald-300/40 cursor-pointer' 
                      : 'opacity-40 select-none cursor-not-allowed'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${
                        isUnlocked 
                          ? 'bg-emerald-50 text-[#2D6A24] border-emerald-100' 
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {!isUnlocked && (
                        <div className="p-1 bg-red-50 text-red-600 rounded-md border border-red-100 shadow-xs" title="Restricted Access">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-xs text-slate-800 leading-tight">
                        {mod.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      Telemetry Status
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                      isUnlocked ? mod.telemetryColor : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}>
                      {mod.telemetryText}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredModules.length === 0 && (
              <div className="col-span-2 p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-white text-xs font-bold text-slate-400">
                No operational modules match your search filters.
              </div>
            )}
          </div>

          {/* Real-time System Logs Terminal Console */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                  Ecosystem Live Console Terminal
                </h4>
              </div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                ACTIVE FEED (TICKING)
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 h-52 overflow-y-auto space-y-2 font-mono text-[9px] leading-relaxed shadow-inner">
              {sortedLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2.5 border-b border-slate-900 pb-1.5 last:border-b-0 last:pb-0">
                  <span className="text-slate-500 shrink-0 font-bold">
                    [{log.timestamp}]
                  </span>
                  <span className={`px-1.5 py-0.5 rounded border text-[7.5px] font-extrabold tracking-wider uppercase shrink-0 ${log.tagColor}`}>
                    {log.module}
                  </span>
                  <span className={`font-semibold ${log.color}`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: E-Commerce Sync Dashboard */}
        <div className="w-full lg:w-96 flex flex-col gap-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex-shrink-0">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 text-[#2D6A24] rounded-lg border border-emerald-100">
                  <Globe className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  E-Commerce Sync
                </h4>
              </div>
              <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span>Active</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-bold leading-normal">
              Real-time multi-channel inventory & order catalog synchronization dashboard.
            </p>
          </div>

          {/* Sync Stats Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-2.5 text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Products</span>
              <span className="text-xs font-black text-slate-700 mt-1 block">142</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-2.5 text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Synced today</span>
              <span className="text-xs font-black text-slate-700 mt-1 block">48</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-2.5 text-center">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Success</span>
              <span className="text-xs font-black text-emerald-600 mt-1 block">100%</span>
            </div>
          </div>

          {/* Channels Connection Grid */}
          <div className="space-y-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
              Multi-Channel Gateways
            </span>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
              <div className="p-2 border border-slate-100 rounded-lg flex items-center justify-between bg-slate-50/50">
                <span className="text-slate-600">Shopify</span>
                <span className="text-[8px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-black uppercase">OK</span>
              </div>
              <div className="p-2 border border-slate-100 rounded-lg flex items-center justify-between bg-slate-50/50">
                <span className="text-slate-600">WooCommerce</span>
                <span className="text-[8px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-black uppercase">OK</span>
              </div>
              <div className="p-2 border border-slate-100 rounded-lg flex items-center justify-between bg-slate-50/50">
                <span className="text-slate-600">Lazada</span>
                <span className="text-[8px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-black uppercase">OK</span>
              </div>
              <div className="p-2 border border-slate-100 rounded-lg flex items-center justify-between bg-slate-50/50">
                <span className="text-slate-600">Shopee</span>
                <span className="text-[8px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-black uppercase">OK</span>
              </div>
            </div>
          </div>

          {/* Synced Orders Feed */}
          <div className="flex-1 flex flex-col min-h-0 space-y-2.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
              Recent Synced Orders Feed
            </span>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-[160px]">
              {syncedOrders.map(order => (
                <div key={order.id} className="p-2.5 border border-slate-100 hover:bg-slate-50/30 rounded-xl flex items-center justify-between gap-3 text-[10px] font-bold">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-800 font-extrabold">{order.id}</span>
                      <span className="text-[8px] text-slate-400 font-semibold">{order.time}</span>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5 truncate">{order.item} · Qty {order.qty}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-slate-700">₱{order.total.toLocaleString()}</div>
                    <div className="text-[8px] text-emerald-600 uppercase tracking-widest mt-0.5 font-black">{order.channel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="w-full py-2.5 bg-[#2D6A24] hover:bg-[#23531B] disabled:bg-emerald-800/40 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing Channels...' : 'Sync Channels Now'}</span>
            </button>

            <button
              onClick={() => setCurrentView('ecommerce')}
              className="w-full py-2.5 border border-emerald-200 hover:bg-emerald-50 text-[#2D6A24] rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Open E-Commerce Hub</span>
            </button>
          </div>

          <div className="text-[9px] text-slate-400 font-bold text-center">
            Last Synced: {lastSyncTime}
          </div>

        </div>

      </div>

    </div>
  );
}
