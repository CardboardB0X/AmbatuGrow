'use client';

import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { useProcurement } from '../context/ProcurementContext';
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
import SimulationEngine from '../components/SimulationEngine';
import ECommerceWorkspace from '../components/ecommerce/ECommerceWorkspace';
import SCMWorkspace from '../components/scm/SCMWorkspace';
import SalesWorkspace from '../components/sales/SalesWorkspace';
import HelpdeskWorkspace from '../components/helpdesk/HelpdeskWorkspace';

// Procurement Workspaces & Layout Widgets
import ProcurementSubNavigation from '../components/procurement/ProcurementSubNavigation';
import PRWorkspace from '../components/procurement/PRWorkspace';
import SuppliersWorkspace from '../components/procurement/SuppliersWorkspace';
import POWorkspace from '../components/procurement/POWorkspace';
import GRNWorkspace from '../components/procurement/GRNWorkspace';
import ProcurementWidgetStack from '../components/procurement/ProcurementWidgetStack';

// Procurement Drawers & Modals
import PRDrawer from '../components/procurement/PRDrawer';
import PODrawer from '../components/procurement/PODrawer';
import SupplierDrawer from '../components/procurement/SupplierDrawer';
import ApprovalModal from '../components/procurement/ApprovalModal';
import GRNModal from '../components/procurement/GRNModal';
import InvoiceModal from '../components/procurement/InvoiceModal';

// Lucide Icons for Toasts
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

export default function Home() {
  const { activeTab, isAuthenticated, currentView, toast } = useInventory();
  const { activeTab: procActiveTab } = useProcurement();

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

  // Dynamically swap the central workspace view when inside Procurement dashboard
  const renderProcurementWorkspace = () => {
    switch (procActiveTab) {
      case 'Requisitions':
        return <PRWorkspace />;
      case 'Suppliers':
        return <SuppliersWorkspace />;
      case 'Purchase Orders':
        return <POWorkspace />;
      case 'Goods Receipt':
        return <GRNWorkspace />;
      default:
        return <PRWorkspace />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased animate-fade-in relative">
      {/* Column 1: Left Navigation Sidebar */}
      <Sidebar />
      <SimulationEngine />

      {/* Main Container for Central Content and Right Widget Stack */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Main Terminal Header */}
        <Header />

        {/* Sub-Navigation Tabs Row */}
        {currentView === 'inventory' && <SubNavigation />}
        {currentView === 'procurement' && <ProcurementSubNavigation />}

        {/* Bottom Section: Workspace + Right Widgets */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          
          {/* Column 2: Central Core Workspace (Dynamic views) */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {currentView === 'launchpad' ? (
              <CentralLaunchpad />
            ) : currentView === 'ecommerce' ? (
              <ECommerceWorkspace />
            ) : currentView === 'supply_chain' ? (
              <SCMWorkspace />
            ) : currentView === 'sales' ? (
              <SalesWorkspace />
            ) : currentView === 'helpdesk' ? (
              <HelpdeskWorkspace />
            ) : currentView === 'procurement' ? (
              renderProcurementWorkspace()
            ) : (
              renderWorkspace()
            )}
          </main>

          {/* Column 3: Right-Side Contextual Widget Stack */}
          {currentView === 'inventory' && <WidgetStack />}
          {currentView === 'procurement' && <ProcurementWidgetStack />}

        </div>

      </div>

      {/* Floating Sliding Drawers & Modal Dialogs */}
      <Drawer />
      <TransferWizard />
      <SettingsModal />
      <SupportModal />

      {/* Procurement Floating Drawers & Modals */}
      <PRDrawer />
      <PODrawer />
      <SupplierDrawer />
      <ApprovalModal />
      <GRNModal />
      <InvoiceModal />

      {/* Global Toast Notification Card */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-950/95 backdrop-blur-md text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3.5 z-55 animate-slide-in-right max-w-sm border border-slate-800/80">
          <div className={`p-2 rounded-xl shrink-0 border ${
            toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            toast.type === 'error' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
            toast.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
            'bg-slate-500/10 text-slate-400 border-slate-500/20'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
            {toast.type === 'info' && <Info className="w-5 h-5" />}
          </div>
          <div className="flex-grow min-w-0 pr-4">
            <span className="block text-[11px] font-black text-white uppercase tracking-wider">
              {toast.type === 'success' ? 'Task Succeeded' :
               toast.type === 'error' ? 'Execution Error' :
               toast.type === 'warning' ? 'System Warning' :
               'System Notification'}
            </span>
            <span className="block text-[10px] font-bold text-slate-300 mt-0.5 leading-normal">
              {toast.message}
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
