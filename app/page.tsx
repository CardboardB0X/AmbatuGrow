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

export default function Home() {
  const { activeTab, isAuthenticated, currentView } = useInventory();
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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased animate-fade-in">
      {/* Column 1: Left Navigation Sidebar */}
      <Sidebar />

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

    </div>
  );
}
