'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInventory } from '../context/InventoryContext';
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
  const router = useRouter();
  const { 
    userRole, 
    setCurrentView,
    setModuleTab,
    searchQuery
  } = useInventory();

  const [loadingModule, setLoadingModule] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  
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
        router.push('/procurement');
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
      setSuccessToast('E-Commerce multi-channel directories synchronized successfully!');
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
      telemetryText: '2 Low Stock Warnings',
      telemetryColor: 'bg-amber-100 text-amber-800 border-amber-200/50',
      allowedRoles: ['System Administrator', 'Inventory Officer', 'Procurement Officer']
    },
    {
      id: 'procurement',
      title: 'Procurement (Purchasing)',
      description: 'Initiates purchase requisitions, handles supplier profiles, tracks PO status, and performs 3-way matching.',
      icon: ShoppingBag,
      telemetryText: '4 Pending Approvals',
      telemetryColor: 'bg-blue-100 text-blue-800 border-blue-200/50',
      allowedRoles: ['System Administrator', 'Inventory Officer', 'Procurement Officer']
    },
    {
      id: 'supply_chain',
      title: 'Supply Chain Management',
      description: 'Conducts demand forecasting, coordinates supplier logistics, plans routes, and balances warehouse distribution.',
      icon: Truck,
      telemetryText: '3 Active Shipments',
      telemetryColor: 'bg-slate-100 text-slate-800 border-slate-200/50',
      allowedRoles: ['System Administrator', 'Inventory Officer']
    },
    {
      id: 'sales',
      title: 'Sales Order Management',
      description: 'Orchestrates customer quotations, processes order fulfillments, manages CRM segments, and tracks performance metrics.',
      icon: LineChart,
      telemetryText: '12 Open Quotations',
      telemetryColor: 'bg-purple-100 text-purple-800 border-purple-200/50',
      allowedRoles: ['System Administrator']
    },
    {
      id: 'helpdesk',
      title: 'Customer Service / Helpdesk',
      description: 'Handles ticket systems, supports user self-service portals, archives communication histories, and tracks SLA rules.',
      icon: LifeBuoy,
      telemetryText: '1 SLA Breach Warning',
      telemetryColor: 'bg-red-100 text-red-800 border-red-200/50',
      allowedRoles: ['System Administrator']
    }
  ];

  // Filter modules based on header search query
  const filteredModules = erpModules.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
