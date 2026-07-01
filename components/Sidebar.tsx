/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
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
  PackageCheck,
  Home,
  ShoppingBag,
  Truck,
  LineChart,
  LifeBuoy,
  Lock,
  Activity,
  LogOut,
  Globe,
  MessageSquare,
  FileText,
  CreditCard
} from 'lucide-react';

interface Tier1Module {
  id: string;
  title: string;
  icon: React.ElementType;
  route: string;
  allowedRoles: string[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isProcurementPage = pathname ? pathname.startsWith('/procurement') : false;

  // Contexts
  const invContext = useInventory();
  const procContext = useProcurement();

  const { 
    isSidebarCollapsed, 
    setIsSidebarCollapsed, 
    userRole, 
    setUserRole, 
    setIsAuthenticated, 
    setCurrentView,
    moduleTab,
    setModuleTab
  } = invContext;

  // Active module state for Tier 1 selection
  const [activeTier1, setActiveTier1] = useState(isProcurementPage ? 'procurement' : 'inventory');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Sync active Tier 1 when route changes
  useEffect(() => {
    setActiveTier1(isProcurementPage ? 'procurement' : 'inventory');
  }, [isProcurementPage]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClose = () => setShowUserMenu(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const handleSettingsClick = () => {
    invContext.setIsSettingsOpen(true);
  };

  const handleSupportClick = () => {
    invContext.setIsSupportOpen(true);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Define 6 modules matching the Central Launchpad Bento Grid
  const tier1Modules: Tier1Module[] = [
    { id: 'inventory',   title: 'Inventory & Warehouse',      icon: Package,     route: '/',            allowedRoles: ['System Administrator', 'Inventory Officer', 'Procurement Officer'] },
    { id: 'procurement', title: 'Procurement (Purchasing)',   icon: ShoppingBag, route: '/procurement', allowedRoles: ['System Administrator', 'Inventory Officer', 'Procurement Officer'] },
    { id: 'supply_chain',title: 'Supply Chain Management',    icon: Truck,       route: '#',            allowedRoles: ['System Administrator', 'Inventory Officer'] },
    { id: 'sales',       title: 'Sales Order Management',     icon: LineChart,   route: '#',            allowedRoles: ['System Administrator'] },
    { id: 'helpdesk',    title: 'Helpdesk Support',           icon: LifeBuoy,    route: '#',            allowedRoles: ['System Administrator'] },
    { id: 'ecommerce',   title: 'E-Commerce Integration',     icon: Globe,       route: '#',            allowedRoles: ['System Administrator'] },
  ];

  const handleModuleClick = (mod: Tier1Module) => {
    const isUnlocked = mod.allowedRoles.includes(userRole);
    if (!isUnlocked) {
      showToast(`Permission Denied: Active role "${userRole}" lacks access credentials.`);
      return;
    }

    setActiveTier1(mod.id);

    if (mod.id === 'procurement') {
      if (!isProcurementPage) {
        router.push('/procurement');
      }
    } else {
      if (isProcurementPage) {
        router.push('/');
      }
      setCurrentView(mod.id as 'launchpad' | 'inventory' | 'ecommerce' | 'supply_chain' | 'sales' | 'helpdesk');
      
      // Initialize default sub-navigation tab for each module
      if (mod.id === 'supply_chain') {
        setModuleTab('demand');
      } else if (mod.id === 'sales') {
        setModuleTab('quotes');
      } else if (mod.id === 'helpdesk') {
        setModuleTab('tickets');
      } else if (mod.id === 'ecommerce') {
        setModuleTab('orders');
      } else if (mod.id === 'inventory') {
        setModuleTab('default');
      }
    }
  };

  // Submenus for Tier 2 depending on Active Module
  const renderTier2Content = () => {
    if (activeTier1 === 'inventory') {
      const inventoryMenu = [
        { id: 'Tracking',        label: 'Inventory Tracking',             icon: Package },
        { id: 'Transactions',    label: 'Stock Transactions',             icon: ArrowLeftRight },
        { id: 'Locations',       label: 'Warehouse Locations',            icon: MapPin },
        { id: 'Reports & Alerts',label: 'Reporting & Alerts',            icon: AlertTriangle },
      ];

      return (
        <div className="flex-1 flex flex-col justify-between py-4">
          <div className="space-y-4">
            <div className="px-4">
              <span className="block text-[8px] font-black text-emerald-300 uppercase tracking-widest leading-none">
                Module core
              </span>
              <span className="block text-xs font-black text-white mt-1 uppercase tracking-wider truncate">
                Inventory Control
              </span>
            </div>
            
            <nav className="px-2 space-y-0.5">
              {inventoryMenu.map(item => {
                const isActive = !isProcurementPage && invContext.activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isProcurementPage) {
                        router.push('/');
                      }
                      setCurrentView('inventory');
                      invContext.setActiveTab(item.id as SubNavigationTab);
                      invContext.clearSelection();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold rounded-lg transition-all text-left cursor-pointer ${
                      isActive 
                        ? 'bg-[#3E7D32] text-white shadow-inner font-extrabold'
                        : 'text-[#c2e4bb] hover:bg-[#3E7D32]/40 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0 opacity-80" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      );
    }

    if (activeTier1 === 'procurement') {
      const procurementMenu = [
        { id: 'Requisitions',    label: 'Purchase Requisitions',        icon: ClipboardList },
        { id: 'Suppliers',       label: 'Supplier Directory',           icon: Users },
        { id: 'Purchase Orders', label: 'Order Management',             icon: ShoppingCart },
        { id: 'Goods Receipt',   label: 'Receipt & Invoice',            icon: PackageCheck },
      ];

      return (
        <div className="flex-1 flex flex-col justify-between py-4">
          <div className="space-y-4">
            <div className="px-4">
              <span className="block text-[8px] font-black text-emerald-300 uppercase tracking-widest leading-none">
                Module core
              </span>
              <span className="block text-xs font-black text-white mt-1 uppercase tracking-wider truncate">
                Procurement Hub
              </span>
            </div>

            <nav className="px-2 space-y-0.5">
              {procurementMenu.map(item => {
                const isActive = isProcurementPage && procContext.activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (!isProcurementPage) {
                        router.push('/procurement');
                      }
                      procContext.setActiveTab(item.id as ProcurementTab);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold rounded-lg transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#3E7D32] text-white shadow-inner font-extrabold'
                        : 'text-[#c2e4bb] hover:bg-[#3E7D32]/40 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0 opacity-80" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      );
    }

    if (activeTier1 === 'supply_chain') {
      const supplyMenu = [
        { id: 'demand',      label: 'Demand Forecasting',    icon: LineChart },
        { id: 'logistics',   label: 'Supplier Logistics',    icon: Truck },
        { id: 'route',       label: 'Route Planner',         icon: MapPin },
        { id: 'distrib',     label: 'Warehouse Distribution',icon: Package },
      ];

      return (
        <div className="flex-1 flex flex-col justify-between py-4">
          <div className="space-y-4">
            <div className="px-4">
              <span className="block text-[8px] font-black text-emerald-300 uppercase tracking-widest leading-none">
                Module core
              </span>
              <span className="block text-xs font-black text-white mt-1 uppercase tracking-wider truncate">
                Supply Chain SCM
              </span>
            </div>

            <nav className="px-2 space-y-0.5">
              {supplyMenu.map(item => {
                const isActive = moduleTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setModuleTab(item.id);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold rounded-lg transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#3E7D32] text-white shadow-inner font-extrabold'
                        : 'text-[#c2e4bb] hover:bg-[#3E7D32]/40 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0 opacity-80" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      );
    }

    if (activeTier1 === 'sales') {
      const salesMenu = [
        { id: 'quotes',      label: 'Customer Quotes',      icon: ClipboardList },
        { id: 'fulfill',     label: 'Order Fulfillment',    icon: PackageCheck },
        { id: 'crm',         label: 'CRM Segments',         icon: Users },
        { id: 'analytics',   label: 'Sales Analytics',      icon: Activity },
      ];

      return (
        <div className="flex-1 flex flex-col justify-between py-4">
          <div className="space-y-4">
            <div className="px-4">
              <span className="block text-[8px] font-black text-emerald-300 uppercase tracking-widest leading-none">
                Module core
              </span>
              <span className="block text-xs font-black text-white mt-1 uppercase tracking-wider truncate">
                Sales Control
              </span>
            </div>

            <nav className="px-2 space-y-0.5">
              {salesMenu.map(item => {
                const isActive = moduleTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setModuleTab(item.id);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold rounded-lg transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#3E7D32] text-white shadow-inner font-extrabold'
                        : 'text-[#c2e4bb] hover:bg-[#3E7D32]/40 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0 opacity-80" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      );
    }

    if (activeTier1 === 'helpdesk') {
      const helpdeskMenu = [
        { id: 'tickets',     label: 'Support Tickets',      icon: LifeBuoy },
        { id: 'portal',      label: 'Self-Service Portal',  icon: Globe },
        { id: 'comms',       label: 'Communications Log',   icon: MessageSquare },
        { id: 'sla',         label: 'SLA Compliance',       icon: Settings },
      ];

      return (
        <div className="flex-1 flex flex-col justify-between py-4">
          <div className="space-y-4">
            <div className="px-4">
              <span className="block text-[8px] font-black text-emerald-300 uppercase tracking-widest leading-none">
                Module core
              </span>
              <span className="block text-xs font-black text-white mt-1 uppercase tracking-wider truncate">
                Helpdesk Support
              </span>
            </div>

            <nav className="px-2 space-y-0.5">
              {helpdeskMenu.map(item => {
                const isActive = moduleTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setModuleTab(item.id);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold rounded-lg transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#3E7D32] text-white shadow-inner font-extrabold'
                        : 'text-[#c2e4bb] hover:bg-[#3E7D32]/40 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0 opacity-80" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      );
    }

    if (activeTier1 === 'ecommerce') {
      const ecomMenu = [
        { id: 'orders',   label: 'Order Sync Logs',      icon: ClipboardList },
        { id: 'stock',    label: 'Stock Availability',   icon: PackageCheck },
        { id: 'pim',      label: 'PIM Product Catalog',  icon: FileText },
        { id: 'payments', label: 'Payments Gateway',     icon: CreditCard },
      ];

      return (
        <div className="flex-1 flex flex-col justify-between py-4">
          <div className="space-y-4">
            <div className="px-4">
              <span className="block text-[8px] font-black text-emerald-300 uppercase tracking-widest leading-none">
                Module core
              </span>
              <span className="block text-xs font-black text-white mt-1 uppercase tracking-wider truncate">
                E-Commerce Sync
              </span>
            </div>

            <nav className="px-2 space-y-0.5">
              {ecomMenu.map(item => {
                const isActive = moduleTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isProcurementPage) {
                        router.push('/');
                      }
                      setCurrentView('ecommerce');
                      setModuleTab(item.id);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold rounded-lg transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#3E7D32] text-white shadow-inner font-extrabold'
                        : 'text-[#c2e4bb] hover:bg-[#3E7D32]/40 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0 opacity-80" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-full flex-shrink-0 select-none shadow-lg z-20">
      
      {/* ── TIER 1: ICON NAVIGATION BAR (FAR LEFT) ── */}
      <div className="w-[72px] bg-[#1F4A18] flex flex-col justify-between items-center py-4 border-r border-[#153410]/65 relative">
        
        {/* Top Logo */}
        <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center overflow-hidden p-1 select-none">
          <Image
            src="/logo.png"
            alt="AmbatуGrow Logo"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </div>

        {/* Modules Stack */}
        <div className="flex-1 w-full my-6 flex flex-col items-center gap-2.5 overflow-y-auto scrollbar-none px-1">
          {tier1Modules.map((mod) => {
            const isUnlocked = mod.allowedRoles.includes(userRole);
            const isActive = activeTier1 === mod.id;
            const ModIcon = mod.icon;

            return (
              <button
                key={mod.id}
                onClick={() => handleModuleClick(mod)}
                title={mod.title}
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#3E7D32] text-white shadow-md border border-emerald-300/20' 
                    : isUnlocked
                    ? 'text-emerald-300 hover:bg-[#3E7D32]/45 hover:text-white'
                    : 'text-slate-500 hover:bg-slate-800/30 cursor-not-allowed opacity-35'
                }`}
              >
                <ModIcon className="w-5 h-5 shrink-0" />
                
                {/* Lock icon overlay for unauthorized modules */}
                {!isUnlocked && (
                  <span className="absolute bottom-1 right-1 bg-red-800 border border-red-950 p-[1.5px] rounded">
                    <Lock className="w-1.5 h-1.5 text-white" />
                  </span>
                )}

                {/* Active indicator line */}
                {isActive && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 bg-white rounded-r-md"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Actions Row */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Exit Button */}
          <button
            onClick={() => {
              if (isProcurementPage) {
                router.push('/');
              }
              setCurrentView('launchpad');
            }}
            title="Exit to Launchpad Menu"
            className="w-11 h-11 rounded-xl flex items-center justify-center text-emerald-300 hover:bg-emerald-800/35 hover:text-white transition-colors cursor-pointer"
          >
            <Home className="w-5 h-5 shrink-0" />
          </button>

          {/* User Profile Avatar at the bottom of Tier 1 */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
              }}
              className="w-10 h-10 rounded-full bg-[#D1E2FF] flex items-center justify-center font-black text-xs text-blue-700 hover:scale-105 transition-all border border-emerald-300/35 cursor-pointer shadow-sm focus:outline-none"
            >
              AD
            </button>

            {/* User Menu Dropdown (Popup) */}
            {showUserMenu && (
              <div className="absolute left-16 bottom-0 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden text-slate-800 animate-fade-in">
                <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/50">
                  <div className="text-[10px] font-black text-slate-700 leading-tight">
                    Chopaw Administrator
                  </div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 font-mono">
                    Role: {userRole}
                  </div>
                </div>

                <span className="block px-3.5 py-1 text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  Switch Active Role
                </span>
                
                <button
                  onClick={() => setUserRole('System Administrator')}
                  className={`w-full text-left px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    userRole === 'System Administrator' ? 'text-[#2D6A24] bg-emerald-50/50 font-black' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  System Administrator
                </button>
                
                <button
                  onClick={() => setUserRole('Inventory Officer')}
                  className={`w-full text-left px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    userRole === 'Inventory Officer' ? 'text-[#2D6A24] bg-emerald-50/50 font-black' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Inventory Officer
                </button>
                
                <button
                  onClick={() => setUserRole('Procurement Officer')}
                  className={`w-full text-left px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    userRole === 'Procurement Officer' ? 'text-[#2D6A24] bg-emerald-50/50 font-black' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Procurement Officer
                </button>

                <div className="h-px bg-slate-100 my-1"></div>

                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Slide collapse button anchored to Tier 1 but overlays exactly on right edge of Tier 2 ── */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          title={isSidebarCollapsed ? 'Expand sub-navigation' : 'Collapse sub-navigation'}
          className="absolute top-1/2 -translate-y-1/2 z-30
                     w-6 h-6 rounded-full
                     bg-[#3E7D32] hover:bg-[#23531B]
                     border border-emerald-300/40
                     flex items-center justify-center
                     text-white shadow-md
                     hover:scale-110 transition-[left,transform,background-color] duration-300 cubic-bezier(0.4, 0, 0.2, 1) will-change-[left] cursor-pointer"
          style={{
            left: isSidebarCollapsed ? '60px' : '268px',
          }}
        >
          {isSidebarCollapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <ChevronLeft  className="w-3.5 h-3.5" />}
        </button>

      </div>

      {/* ── TIER 2: SUB-NAVIGATION PANEL (COLLAPSIBLE) ── */}
      <div className={`bg-[#2D6A24] text-white flex flex-col justify-between transition-[width] duration-300 cubic-bezier(0.4, 0, 0.2, 1) will-change-[width] overflow-hidden relative border-r border-[#23531B]/40 ${
        isSidebarCollapsed ? 'w-0 border-r-0' : 'w-52'
      }`}>
        
        {/* Inner Content that clips correctly during width transition */}
        <div className="w-full flex-1 flex flex-col justify-between min-w-[208px] overflow-hidden h-full">
          
          {/* Dynamic sub navigation links */}
          {renderTier2Content()}

          {/* Settings & Support in Tier 2 Footer */}
          <div className="border-t border-[#23531B]/40 p-3 space-y-1 bg-[#23531B]/20 flex-shrink-0">
            <button
              onClick={handleSettingsClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#c2e4bb] hover:bg-[#3E7D32]/40 hover:text-white transition-all text-left cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#aee2a4] shrink-0" />
              <span>Settings</span>
            </button>

            <button
              onClick={handleSupportClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#c2e4bb] hover:bg-[#3E7D32]/40 hover:text-white transition-all text-left cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-[#aee2a4] shrink-0" />
              <span>Support</span>
            </button>
          </div>

        </div>

        {/* Toast Notification Container inside Sidebar */}
        {toastMessage && (
          <div className="absolute bottom-28 left-3 right-3 bg-slate-900 border border-slate-700/80 text-white text-[10px] font-bold p-2.5 rounded-xl shadow-xl z-50 animate-fade-in text-center leading-normal">
            {toastMessage}
          </div>
        )}

      </div>

    </div>
  );
}
