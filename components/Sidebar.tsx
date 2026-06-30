'use client';

import React from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useInventory } from '../context/InventoryContext';
import { useProcurement } from '../context/ProcurementContext';
import { SubNavigationTab } from '../types/inventory';
import { ProcurementTab } from '../types/procurement';
import { 
  ArrowLeftRight, 
  MapPin, 
  AlertTriangle, 
  Settings, 
  HelpCircle,
  Package,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Users,
  ShoppingCart,
  PackageCheck
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isProcurementPage = pathname ? pathname.startsWith('/procurement') : false;

  // Context Hooks
  const invContext = useInventory();
  const procContext = useProcurement();

  // Collapsed State (synchronized through Inventory Context for layout consistency)
  const { isSidebarCollapsed, setIsSidebarCollapsed } = invContext;

  // Choose tab controller dynamically
  const activeTab = isProcurementPage ? procContext.activeTab : invContext.activeTab;
  
  const handleTabChange = (tabId: string) => {
    if (isProcurementPage) {
      procContext.setActiveTab(tabId as ProcurementTab);
    } else {
      invContext.setActiveTab(tabId as SubNavigationTab);
      invContext.clearSelection();
    }
  };

  const handleSettingsClick = () => {
    invContext.setIsSettingsOpen(true);
  };

  const handleSupportClick = () => {
    invContext.setIsSupportOpen(true);
  };

  // Define Menu Items per Module
  const inventoryMenu = [
    { id: 'Tracking',        label: 'Inventory Tracking',             icon: Package },
    { id: 'Transactions',    label: 'Stock Transactions',             icon: ArrowLeftRight },
    { id: 'Locations',       label: 'Warehouse Location Tracking',    icon: MapPin },
    { id: 'Reports & Alerts',label: 'Inventory Reporting & Alerts',  icon: AlertTriangle },
  ];

  const procurementMenu = [
    { id: 'Requisitions',    label: 'Purchase Requisitions',        icon: ClipboardList },
    { id: 'Suppliers',       label: 'Supplier Management',          icon: Users },
    { id: 'Purchase Orders', label: 'Purchase Order Management',    icon: ShoppingCart },
    { id: 'Goods Receipt',   label: 'Goods Receipt & Invoice',      icon: PackageCheck },
  ];

  const menuItems = isProcurementPage ? procurementMenu : inventoryMenu;

  return (
    <aside
      className={`relative bg-[#2D6A24] text-white flex flex-col justify-between flex-shrink-0 select-none shadow-lg transition-[width] duration-300 ease-in-out z-20 ${
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

      {/* ── Top block: logo + switcher + nav ── */}
      <div className="flex flex-col min-h-0">

        {/* Branding header */}
        <div className={`flex items-center gap-3 border-[#23531B]/40 py-5 transition-all duration-300 ${
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

        {/* ── Module Switcher ── */}
        {!isSidebarCollapsed ? (
          <div className="px-4 py-1.5 bg-[#23531B]/30 flex rounded-xl mx-3.5 gap-1 text-[10px] font-black uppercase tracking-wider border border-[#23531B]/40">
            <button
              onClick={() => router.push('/')}
              className={`flex-1 py-1 rounded-lg transition-colors text-center cursor-pointer ${
                !isProcurementPage ? 'bg-[#3E7D32] text-white shadow-sm' : 'text-emerald-200/80 hover:text-white'
              }`}
            >
              Inventory
            </button>
            <button
              onClick={() => router.push('/procurement')}
              className={`flex-1 py-1 rounded-lg transition-colors text-center cursor-pointer ${
                isProcurementPage ? 'bg-[#3E7D32] text-white shadow-sm' : 'text-emerald-200/80 hover:text-white'
              }`}
            >
              Procurement
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 items-center py-1.5 mx-2 bg-[#23531B]/20 rounded-xl border border-[#23531B]/35">
            <button
              onClick={() => router.push('/')}
              title="Switch to Inventory"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                !isProcurementPage ? 'bg-[#3E7D32] text-white' : 'text-emerald-300 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/procurement')}
              title="Switch to Procurement"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isProcurementPage ? 'bg-[#3E7D32] text-white' : 'text-emerald-300 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        )}

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
                    ? 'bg-[#3E7D32] text-white shadow-inner font-extrabold'
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
          onClick={handleSettingsClick}
          title={isSidebarCollapsed ? 'Settings' : undefined}
          className={`w-full flex items-center rounded-lg text-xs font-bold text-[#c2e4bb] hover:bg-[#3E7D32]/40 hover:text-white transition-all ${
            isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'
          }`}
        >
          <Settings className="w-4 h-4 text-[#aee2a4] shrink-0" />
          {!isSidebarCollapsed && <span>Settings</span>}
        </button>

        <button
          onClick={handleSupportClick}
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
