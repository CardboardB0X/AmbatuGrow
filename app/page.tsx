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

// Modals, Launchpad & Login
import LoginGateway from '../components/LoginGateway';
import CentralLaunchpad from '../components/CentralLaunchpad';

export default function Home() {
  const { activeTab, isAuthenticated, currentView } = useInventory();

  // Route protection - Force Login Gateway if unauthenticated
  if (!isAuthenticated) {
    return <LoginGateway />;
  }

  // Render Launchpad Hub directory
  if (currentView === 'launchpad') {
    return <CentralLaunchpad />;
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
        <SubNavigation />

        {/* Bottom Section: Workspace + Right Widgets */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          
          {/* Column 2: Central Core Workspace (Dynamic views) */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {renderWorkspace()}
          </main>

          {/* Column 3: Right-Side Contextual Widget Stack */}
          <WidgetStack />

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
