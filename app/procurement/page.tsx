'use client';

import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { useInventory } from '../../context/InventoryContext';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import ProcurementSubNavigation from '../../components/procurement/ProcurementSubNavigation';
import PRWorkspace from '../../components/procurement/PRWorkspace';
import SuppliersWorkspace from '../../components/procurement/SuppliersWorkspace';
import POWorkspace from '../../components/procurement/POWorkspace';
import GRNWorkspace from '../../components/procurement/GRNWorkspace';
import ProcurementWidgetStack from '../../components/procurement/ProcurementWidgetStack';

// Modals, Drawers & Login
import PRDrawer from '../../components/procurement/PRDrawer';
import PODrawer from '../../components/procurement/PODrawer';
import SupplierDrawer from '../../components/procurement/SupplierDrawer';
import ApprovalModal from '../../components/procurement/ApprovalModal';
import GRNModal from '../../components/procurement/GRNModal';
import InvoiceModal from '../../components/procurement/InvoiceModal';
import LoginGateway from '../../components/LoginGateway';

export default function ProcurementPage() {
  const { activeTab } = useProcurement();
  const { isAuthenticated } = useInventory();

  // Route protection - Force Login Gateway if unauthenticated
  if (!isAuthenticated) {
    return <LoginGateway />;
  }

  // Dynamically swap the central procurement workspaces
  const renderWorkspace = () => {
    switch (activeTab) {
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
        <ProcurementSubNavigation />

        {/* Bottom Section: Workspace + Right Widgets */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          
          {/* Column 2: Central Core Workspace */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {renderWorkspace()}
          </main>

          {/* Column 3: Right-Side Contextual Widget Stack */}
          <ProcurementWidgetStack />

        </div>

      </div>

      {/* Floating sliding Drawers and Modals */}
      <PRDrawer />
      <PODrawer />
      <SupplierDrawer />
      <ApprovalModal />
      <GRNModal />
      <InvoiceModal />

    </div>
  );
}
