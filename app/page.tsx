'use client';

import React from 'react';
import { useInventory } from '../context/InventoryContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SubNavigation from '../components/SubNavigation';
import TrackingWorkspace from '../components/TrackingWorkspace';
import TransactionsWorkspace from '../components/TransactionsWorkspace';
import LocationsWorkspace from '../components/LocationsWorkspace';
import ReportsWorkspace from '../components/ReportsWorkspace';
import WidgetStack from '../components/WidgetStack';
import Drawer from '../components/Drawer';
import TransferWizard from '../components/TransferWizard';
import SettingsModal from '../components/SettingsModal';
import SupportModal from '../components/SupportModal';

import LoginGateway from '../components/LoginGateway';
import CentralLaunchpad from '../components/CentralLaunchpad';
import ECommerceWorkspace from '../components/ecommerce/ECommerceWorkspace';
import { Truck, CheckCircle } from 'lucide-react';

export default function Home() {
  const { activeTab, isAuthenticated, currentView } = useInventory();

  // Route protection - Force Login Gateway if unauthenticated
  if (!isAuthenticated) {
    return <LoginGateway />;
  }

  // Dynamically swap the central workspace view when inside Inventory dashboard
  const renderWorkspace = () => {
    switch (activeTab) {
      case 'Tracking':
        return <TrackingWorkspace />;
      case 'Transactions':
        return <TransactionsWorkspace />;
      case 'Locations':
        return <LocationsWorkspace />;
      case 'Reports & Alerts':
        return <ReportsWorkspace />;
      default:
        return <TrackingWorkspace />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased animate-fade-in">
      {/* Column 1: Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Container for Central Content and Right Widget Stack */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Main Terminal Header */}
        <Header />

        {/* Sub-Navigation Tabs Row */}
        {currentView === 'inventory' && <SubNavigation />}

        {/* Bottom Section: Workspace + Right Widgets */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          
          {/* Column 2: Central Core Workspace (Dynamic views) */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {currentView === 'launchpad' ? (
              <CentralLaunchpad />
            ) : currentView === 'ecommerce' ? (
              <ECommerceWorkspace />
            ) : currentView === 'supply_chain' ? (
              <SupplyChainWorkspace />
            ) : currentView === 'sales' ? (
              <SalesWorkspace />
            ) : currentView === 'helpdesk' ? (
              <HelpdeskWorkspace />
            ) : (
              renderWorkspace()
            )}
          </main>

          {/* Column 3: Right-Side Contextual Widget Stack */}
          {currentView === 'inventory' && <WidgetStack />}

        </div>

      </div>

      {/* Floating Sliding Drawers & Modal Dialogs */}
      <Drawer />
      <TransferWizard />
      <SettingsModal />
      <SupportModal />

    </div>
  );
}

// ── SUPPLY CHAIN SIMULATION CORE WORKSPACE ──
function SupplyChainWorkspace() {
  const [syncing, setSyncing] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  
  const handleOptimize = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="flex-1 bg-slate-50 p-6 flex flex-col min-h-0 overflow-y-auto font-sans select-none animate-fade-in">
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Supply Chain & Logistics Terminal
          </h2>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
            Optimize carrier routes, forecast future item demand, and manage inbound/outbound shipments.
          </p>
        </div>
        <button
          onClick={handleOptimize}
          disabled={syncing}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2D6A24] hover:bg-[#23531B] disabled:bg-emerald-800/40 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <Truck className={`w-3.5 h-3.5 ${syncing ? 'animate-bounce' : ''}`} />
          <span>{syncing ? 'Optimizing Routes...' : 'Run Route Optimizer'}</span>
        </button>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[10px] font-bold flex items-center gap-1.5 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Logistics routes optimized! Est. search times reduced by 15 mins.</span>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-5 flex-shrink-0">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Active Shipments</span>
          <span className="text-xl font-black text-slate-800 mt-1 block">3</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">SCM Route Efficiency</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">94.2%</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Auto-Restock Items</span>
          <span className="text-xl font-black text-slate-800 mt-1 block">2</span>
        </div>
      </div>

      {/* Shipments Log */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col min-h-[220px]">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
          Shipment Tracking Ledger
        </span>
        <div className="border border-slate-100 rounded-xl overflow-hidden flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-3">Shipment Ref</th>
                <th className="p-3">Carrier</th>
                <th className="p-3">Route Nodes</th>
                <th className="p-3 text-center">Items Qty</th>
                <th className="p-3 text-center">Sync status</th>
                <th className="p-3">Est. Delivery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              <tr className="hover:bg-slate-50/30">
                <td className="p-3 font-extrabold text-slate-800">SCM-SH-9920</td>
                <td className="p-3">LBC Express</td>
                <td className="p-3">Indang Hub ➔ Dasma Warehouse</td>
                <td className="p-3 text-center">250 sacks</td>
                <td className="p-3 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200/50">In Transit</span>
                </td>
                <td className="p-3 font-semibold text-slate-500">2 hrs ago (Delayed)</td>
              </tr>
              <tr className="hover:bg-slate-50/30">
                <td className="p-3 font-extrabold text-slate-800">SCM-SH-9921</td>
                <td className="p-3">Cavite Transport</td>
                <td className="p-3">Manila Port ➔ Indang Warehouse</td>
                <td className="p-3 text-center">800 units</td>
                <td className="p-3 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/50">Delivered</span>
                </td>
                <td className="p-3 font-semibold text-slate-500">Today, 09:30 AM</td>
              </tr>
              <tr className="hover:bg-slate-50/30">
                <td className="p-3 font-extrabold text-slate-800">SCM-SH-9922</td>
                <td className="p-3">J&T Cargo</td>
                <td className="p-3">Silang Zone 3 ➔ Indang Hub</td>
                <td className="p-3 text-center">150 units</td>
                <td className="p-3 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/50">Processing</span>
                </td>
                <td className="p-3 font-semibold text-slate-500">Tomorrow, 14:00 PM</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── SALES ORDER SIMULATION CORE WORKSPACE ──
function SalesWorkspace() {
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleApproveQuote = (id: string) => {
    setSuccess(`Quote ${id} converted to active Sales Order and inventory reserved.`);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="flex-1 bg-slate-50 p-6 flex flex-col min-h-0 overflow-y-auto font-sans select-none animate-fade-in">
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Sales Order Management Terminal
          </h2>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
            Create customer quotes, process order fulfillment pipelines, and track CRM contacts.
          </p>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[10px] font-bold flex items-center gap-1.5 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>{success}</span>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-5 flex-shrink-0">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Open Quotations</span>
          <span className="text-xl font-black text-slate-800 mt-1 block">12</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Fulfilled Today</span>
          <span className="text-xl font-black text-slate-800 mt-1 block">48</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Sales Revenue</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">₱85,400</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col min-h-[220px]">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
          Customer Orders Pipeline
        </span>
        <div className="border border-slate-100 rounded-xl overflow-hidden flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer details</th>
                <th className="p-3">Items list</th>
                <th className="p-3 text-right">Total Price (₱)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              <tr className="hover:bg-slate-50/30">
                <td className="p-3 font-extrabold text-slate-800">SO-10920</td>
                <td className="p-3">
                  <div className="font-extrabold">Juan Dela Cruz</div>
                  <div className="text-[10px] text-slate-400">juan@gmail.com</div>
                </td>
                <td className="p-3 text-slate-500 font-semibold">Hybrid Rice Seeds (x2)</td>
                <td className="p-3 text-right font-black">₱3,600</td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/50">Fulfilled</span>
                </td>
                <td className="p-3 text-right text-slate-300 italic font-semibold">Synced</td>
              </tr>
              <tr className="hover:bg-slate-50/30">
                <td className="p-3 font-extrabold text-slate-800">SO-10921</td>
                <td className="p-3">
                  <div className="font-extrabold">Maria Santos</div>
                  <div className="text-[10px] text-slate-400">maria@outlook.com</div>
                </td>
                <td className="p-3 text-slate-500 font-semibold">Organic Fertilizer (x5)</td>
                <td className="p-3 text-right font-black">₱3,250</td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/50">Fulfilled</span>
                </td>
                <td className="p-3 text-right text-slate-300 italic font-semibold">Synced</td>
              </tr>
              <tr className="hover:bg-slate-50/30">
                <td className="p-3 font-extrabold text-slate-800">SO-10922</td>
                <td className="p-3">
                  <div className="font-extrabold">Pedro Penduko</div>
                  <div className="text-[10px] text-slate-400">pedro@yahoo.com</div>
                </td>
                <td className="p-3 text-slate-500 font-semibold">Raw Honey (x12)</td>
                <td className="p-3 text-right font-black">₱3,000</td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/50">Pending L1</span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleApproveQuote('SO-10922')}
                    className="px-3 py-1 bg-emerald-50 text-[#2D6A24] hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    Approve Order
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── CUSTOMER SERVICE / HELPDESK SIMULATION CORE WORKSPACE ──
function HelpdeskWorkspace() {
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleResolveTicket = (id: string) => {
    setSuccess(`Ticket ${id} marked as RESOLVED. Notification sent to customer.`);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="flex-1 bg-slate-50 p-6 flex flex-col min-h-0 overflow-y-auto font-sans select-none animate-fade-in">
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Customer Support Helpdesk
          </h2>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
            Track support tickets, SLA rules compliance metrics, and communications history logs.
          </p>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[10px] font-bold flex items-center gap-1.5 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>{success}</span>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-5 flex-shrink-0">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Open Tickets</span>
          <span className="text-xl font-black text-slate-800 mt-1 block">4</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">SLA Compliance</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">98.2%</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Avg Resolve Time</span>
          <span className="text-xl font-black text-slate-800 mt-1 block">1.2 hrs</span>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col min-h-[220px]">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
          Support Incident Registry
        </span>
        <div className="border border-slate-100 rounded-xl overflow-hidden flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-3">Ticket ID</th>
                <th className="p-3">Customer Name</th>
                <th className="p-3">Support Issue description</th>
                <th className="p-3 text-center">Priority</th>
                <th className="p-3 text-center">SLA status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              <tr className="hover:bg-slate-50/30">
                <td className="p-3 font-extrabold text-slate-800">TKT-88492</td>
                <td className="p-3">Juan Dela Cruz</td>
                <td className="p-3 text-slate-500 font-semibold">Wrong product received (order WOO-8849)</td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-[9px] font-black uppercase">High</span>
                </td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[9px] font-black uppercase">In SLA</span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleResolveTicket('TKT-88492')}
                    className="px-3 py-1 bg-emerald-50 text-[#2D6A24] hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/30">
                <td className="p-3 font-extrabold text-slate-800">TKT-88493</td>
                <td className="p-3">Maria Santos</td>
                <td className="p-3 text-slate-500 font-semibold">Payment gateway charged twice on WooCommerce</td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-black uppercase">Normal</span>
                </td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[9px] font-black uppercase">In SLA</span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleResolveTicket('TKT-88493')}
                    className="px-3 py-1 bg-emerald-50 text-[#2D6A24] hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
