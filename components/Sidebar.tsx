'use client';

import React from 'react';
import Image from 'next/image';
import { useInventory } from '../context/InventoryContext';
import { SubNavigationTab } from '../types/inventory';
import { 
  ArrowLeftRight, 
  MapPin, 
  AlertTriangle, 
  Settings, 
  HelpCircle,
  Package,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const { 
    activeTab, 
    setActiveTab, 
    clearSelection,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    setIsSettingsOpen,
    setIsSupportOpen
  } = useInventory();

  const menuItems = [
    { id: 'Tracking' as SubNavigationTab,        label: 'Inventory Tracking',             icon: Package },
    { id: 'Transactions' as SubNavigationTab,    label: 'Stock Transactions',             icon: ArrowLeftRight },
    { id: 'Locations' as SubNavigationTab,       label: 'Warehouse Location Tracking',    icon: MapPin },
    { id: 'Reports & Alerts' as SubNavigationTab,label: 'Inventory Reporting & Alerts',  icon: AlertTriangle },
  ];

  const handleTabChange = (tabId: SubNavigationTab) => {
    setActiveTab(tabId);
    clearSelection();
  };

  return (
    <aside
      className={`relative bg-[#2D6A24] text-white flex flex-col justify-between flex-shrink-0 select-none shadow-lg transition-[width] duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* ── Collapse toggle pill – sits on the right edge of the sidebar ── */}
      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-30
                   w-6 h-6 rounded-full
                   bg-[#3E7D32] hover:bg-[#23531B]
                   border border-emerald-300/40
                   flex items-center justify-center
                   text-white shadow-md
                   hover:scale-110 transition-all cursor-pointer"
      >
        {isSidebarCollapsed
          ? <ChevronRight className="w-3.5 h-3.5" />
          : <ChevronLeft  className="w-3.5 h-3.5" />}
      </button>

      {/* ── Top block: logo + nav ── */}
      <div className="flex flex-col min-h-0">

        {/* Branding header */}
        <div className={`flex items-center gap-3 border-b border-[#23531B]/40 py-5 transition-all duration-300 ${
          isSidebarCollapsed ? 'px-3 justify-center' : 'px-5'
        }`}>
          {/* Logo image */}
          <div className={`flex-shrink-0 bg-white rounded-xl shadow-md flex items-center justify-center overflow-hidden transition-all duration-300 ${
            isSidebarCollapsed ? 'w-10 h-10' : 'w-12 h-12'
          }`}>
            <Image
              src="/logo.png"
              alt="AmbatуGrow Logo"
              width={48}
              height={48}
              className="object-contain w-full h-full p-1"
              priority
            />
          </div>

          {/* Brand text – hidden when collapsed */}
          {!isSidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-extrabold text-[13px] tracking-widest text-white leading-tight">
                AMBATUGROW
              </h1>
              <p className="text-[9px] text-emerald-200/80 font-bold tracking-wider mt-0.5">
                ERP SYSTEM
              </p>
            </div>
          )}
        </div>

        {/* Navigation menu */}
        <nav className={`flex-1 py-4 space-y-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'px-2' : 'px-3'
        }`}>
          {menuItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                title={isSidebarCollapsed ? label : undefined}
                className={`w-full flex items-center rounded-lg text-xs font-bold transition-all duration-150 ${
                  isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
                } ${
                  isActive
                    ? 'bg-[#3E7D32] text-white shadow-inner'
                    : 'text-[#c2e4bb] hover:bg-[#3E7D32]/40 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#aee2a4]'}`} />
                {!isSidebarCollapsed && <span className="truncate">{label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Bottom block: Settings + Support ── */}
      <div className={`border-t border-[#23531B]/40 py-3 space-y-1 transition-all duration-300 ${
        isSidebarCollapsed ? 'px-2' : 'px-3'
      }`}>
        <button
          onClick={() => setIsSettingsOpen(true)}
          title={isSidebarCollapsed ? 'Settings' : undefined}
          className={`w-full flex items-center rounded-lg text-xs font-bold text-[#c2e4bb] hover:bg-[#3E7D32]/40 hover:text-white transition-all ${
            isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'
          }`}
        >
          <Settings className="w-4 h-4 text-[#aee2a4] shrink-0" />
          {!isSidebarCollapsed && <span>Settings</span>}
        </button>

        <button
          onClick={() => setIsSupportOpen(true)}
          title={isSidebarCollapsed ? 'Support' : undefined}
          className={`w-full flex items-center rounded-lg text-xs font-bold text-[#c2e4bb] hover:bg-[#3E7D32]/40 hover:text-white transition-all ${
            isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-[#aee2a4] shrink-0" />
          {!isSidebarCollapsed && <span>Support</span>}
        </button>
      </div>

    </aside>
  );
}
