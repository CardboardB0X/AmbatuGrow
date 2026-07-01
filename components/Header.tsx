'use client';

import React, { useRef, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useInventory } from '../context/InventoryContext';
import { useProcurement } from '../context/ProcurementContext';
import { useSCM } from '../context/SCMContext';
import { useSales } from '../context/SalesContext';
import { useHelpdesk } from '../context/HelpdeskContext';
import { 
  Search, 
  Bell, 
  Grid, 
  Plus, 
  Database, 
  Truck, 
  ClipboardList, 
  LifeBuoy, 
  ShoppingBag
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isProcurementPage = pathname ? pathname.startsWith('/procurement') : false;
  
  const procContext = useProcurement();
  const scmContext = useSCM();
  const salesContext = useSales();
  const helpdeskContext = useHelpdesk();

  const {
    activeTab,
    currentView,
    setCurrentView,
    setModuleTab,
    searchQuery,
    setSearchQuery,
    items,
    isNotificationsOpen,
    setIsNotificationsOpen,
    isQuickMenuOpen,
    setIsQuickMenuOpen,
    setIsDrawerOpen,
    setDrawerMode,
    setEditingItem,
    editItem,
    generateRequisitionOrder,
    userRole,
    setUserRole
  } = useInventory();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsQuickMenuOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsNotificationsOpen, setIsQuickMenuOpen, setIsRoleDropdownOpen]);

  // Get view title based on active tab
  const getTerminalTitle = () => {
    if (isProcurementPage) {
      switch (procContext.activeTab) {
        case 'Requisitions':
          return 'Purchase & Requisition Approvals';
        case 'Suppliers':
          return 'Supplier Directory & Relations';
        case 'Purchase Orders':
          return 'Purchase Order Management';
        case 'Goods Receipt':
          return 'Goods Receipt & Invoice Matching';
        default:
          return 'Procurement Control Center';
      }
    }

    if (currentView === 'launchpad') {
      return 'Central Application Launchpad';
    } else if (currentView === 'supply_chain') {
      return 'Supply Chain & Logistics Terminal';
    } else if (currentView === 'sales') {
      return 'Sales Order Management Terminal';
    } else if (currentView === 'helpdesk') {
      return 'Customer Support Helpdesk';
    } else if (currentView === 'ecommerce') {
      return 'E-Commerce Integration Suite';
    }

    switch (activeTab) {
      case 'Tracking':
        return 'Inventory Tracking Terminal';
      case 'Transactions':
        return 'Stock Transactions Ledger';
      case 'Locations':
        return 'Warehouse Location Tracking';
      case 'Reports & Alerts':
        return 'Inventory Reporting & Alerts';
      default:
        return 'Inventory Tracking Terminal';
    }
  };

  // Find active items below safety stock levels
  const lowStockItems = items.filter(item => item.status === 'Active' && item.stockQty <= item.minQty);

  // Handle reordering directly from notifications list
  const handleQuickReorder = (sku: string) => {
    const item = items.find(i => i.sku === sku);
    if (item) {
      const reorderQty = item.maxQty - item.stockQty;
      editItem({
        ...item,
        stockQty: item.maxQty
      });
      generateRequisitionOrder([{ sku, qty: reorderQty }]);
    }
  };

  // Compile notifications across all modules
  const notifications: {
    id: string;
    module: string;
    title: string;
    description: string;
    time: string;
    type: 'warning' | 'info' | 'success' | 'danger';
    actionLabel?: string;
    onAction?: () => void;
  }[] = [];

  // 1. Inventory Notifications (Low Stock warnings)
  lowStockItems.forEach(item => {
    notifications.push({
      id: `inv-${item.sku}`,
      module: 'Inventory',
      title: `Low Stock Alert`,
      description: `${item.sku} (${item.name}) is at ${item.stockQty} ${item.uom}.`,
      time: 'Level Alert',
      type: 'warning',
      actionLabel: 'Quick Restock',
      onAction: () => handleQuickReorder(item.sku)
    });
  });

  // 2. Procurement Notifications (Pending approvals L1/L2)
  procContext.prs
    .filter(pr => pr.status === 'Pending L1 Approval' || pr.status === 'Pending L2 Approval')
    .forEach(pr => {
      notifications.push({
        id: `proc-${pr.id}`,
        module: 'Procurement',
        title: `PR Pending Approval`,
        description: `PR ${pr.id} raised by ${pr.department}. Cost: ₱${pr.totalEstimatedCost.toLocaleString()}.`,
        time: pr.status === 'Pending L1 Approval' ? 'L1 Approval' : 'L2 Approval',
        type: 'info',
        actionLabel: 'View Requisitions',
        onAction: () => {
          if (!isProcurementPage) {
            router.push('/procurement');
          }
          procContext.setActiveTab('Requisitions');
        }
      });
    });

  // 3. SCM Notifications (In Transit shipments)
  scmContext.shipments
    .filter(sh => sh.status === 'In Transit')
    .forEach(sh => {
      notifications.push({
        id: `scm-${sh.id}`,
        module: 'Supply Chain',
        title: `Transit Dispatch Live`,
        description: `${sh.id} (${sh.carrier}) en route: ${sh.origin} ➔ ${sh.destination}.`,
        time: 'Live Tracking',
        type: 'success',
        actionLabel: 'Track Route',
        onAction: () => {
          if (isProcurementPage) {
            router.push('/');
          }
          setCurrentView('supply_chain');
          setModuleTab('route');
        }
      });
    });

  // 4. Sales Notifications (New unprocessed orders)
  salesContext.salesOrders
    .filter(o => o.status === 'Processed')
    .forEach(o => {
      notifications.push({
        id: `sales-${o.id}`,
        module: 'Sales',
        title: `Fulfillment Dispatch`,
        description: `Order ${o.id} for ${o.customerName} processed and ready for dispatch.`,
        time: 'Fulfillment Ready',
        type: 'info',
        actionLabel: 'Dispatch',
        onAction: () => {
          salesContext.updateOrderStatus(o.id, 'Shipped');
        }
      });
    });

  // 5. Helpdesk Notifications (Open High Priority tickets)
  helpdeskContext.tickets
    .filter(t => t.status === 'Open' && t.priority === 'High')
    .forEach(t => {
      notifications.push({
        id: `helpdesk-${t.id}`,
        module: 'Helpdesk',
        title: `SLA Priority Case`,
        description: `Ticket ${t.id} from ${t.customerName} awaits agent response.`,
        time: 'SLA Breach Threat',
        type: 'danger',
        actionLabel: 'View Ticket',
        onAction: () => {
          if (isProcurementPage) {
            router.push('/');
          }
          setCurrentView('helpdesk');
          setModuleTab('tickets');
        }
      });
    });

  // Reset database back to default mock data
  const handleResetData = () => {
    localStorage.removeItem('erp_items');
    localStorage.removeItem('erp_transactions');
    localStorage.removeItem('erp_logs');
    window.location.reload();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between select-none z-30 flex-shrink-0 relative">
      
      {/* Title */}
      <div className="flex items-center">
        <h2 className="text-xl font-extrabold text-[#2D6A24] tracking-tight">
          {getTerminalTitle()}
        </h2>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-sm mx-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ERP modules..."
          className="w-full pl-9 pr-4 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2D6A24] focus:border-[#2D6A24] placeholder-slate-400 font-medium text-slate-700"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Header Actions / Overlays */}
      <div className="flex items-center gap-4 relative">
        
        {/* Bell Notifications Button */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsQuickMenuOpen(false);
            }}
            className={`relative p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-none ${
              isNotificationsOpen ? 'bg-slate-100' : ''
            }`}
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-800">Critical Alerts</span>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">
                  {notifications.length} Active
                </span>
              </div>
              
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs font-semibold">
                    All system modules operating inside healthy safety boundaries.
                  </div>
                ) : (
                  notifications.map((alert) => (
                    <div key={alert.id} className="p-3.5 flex flex-col gap-1.5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                          alert.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200/40' :
                          alert.type === 'danger' ? 'bg-red-50 text-red-700 border border-red-200/40' :
                          alert.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/40' :
                          'bg-blue-50 text-blue-700 border border-blue-200/40'
                        }`}>
                          {alert.module}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">{alert.time}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-extrabold text-slate-800 text-[10px]">{alert.title}</span>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">
                          {alert.description}
                        </p>
                      </div>
                      {alert.actionLabel && alert.onAction && (
                        <div className="flex justify-end mt-1">
                          <button
                            onClick={() => {
                              alert.onAction?.();
                              setIsNotificationsOpen(false);
                            }}
                            className="px-2.5 py-1 bg-[#2D6A24] hover:bg-[#23531B] text-white rounded text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            {alert.actionLabel}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3x3 Grid dots Action Menu Button */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => {
              setIsQuickMenuOpen(!isQuickMenuOpen);
              setIsNotificationsOpen(false);
            }}
            className={`p-1.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-none ${
              isQuickMenuOpen ? 'bg-slate-100' : ''
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>

          {/* Quick Menu Dropdown Panel */}
          {isQuickMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                ERP Actions Center
              </div>
              
              <div className="p-1.5 space-y-0.5">
                {/* 1. Inventory Action */}
                <button
                  onClick={() => {
                    if (isProcurementPage) {
                      router.push('/');
                    }
                    setCurrentView('inventory');
                    setModuleTab('default');
                    setDrawerMode('add');
                    setEditingItem(null);
                    setIsDrawerOpen(true);
                    setIsQuickMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-700" />
                  <span>Add Inventory Item</span>
                </button>

                {/* 2. Procurement Action */}
                <button
                  onClick={() => {
                    if (!isProcurementPage) {
                      router.push('/procurement');
                    }
                    setTimeout(() => {
                      procContext.setActiveTab('Requisitions');
                      procContext.setIsPRDrawerOpen(true);
                    }, 100);
                    setIsQuickMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  <span>Raise Purchase Req (PR)</span>
                </button>

                {/* 3. SCM Dispatch Action */}
                <button
                  onClick={() => {
                    if (isProcurementPage) {
                      router.push('/');
                    }
                    setCurrentView('supply_chain');
                    setModuleTab('route');
                    setIsQuickMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Dispatch Cargo Carrier</span>
                </button>

                {/* 4. Sales Order Action */}
                <button
                  onClick={() => {
                    if (isProcurementPage) {
                      router.push('/');
                    }
                    setCurrentView('sales');
                    setModuleTab('quotes');
                    setIsQuickMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <ClipboardList className="w-4 h-4 text-purple-600" />
                  <span>Issue Quotation / Order</span>
                </button>

                {/* 5. Support Incident Action */}
                <button
                  onClick={() => {
                    if (isProcurementPage) {
                      router.push('/');
                    }
                    setCurrentView('helpdesk');
                    setModuleTab('tickets');
                    setIsQuickMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <LifeBuoy className="w-4 h-4 text-rose-600" />
                  <span>File Support Ticket</span>
                </button>
                
                <div className="h-px bg-slate-100 my-1"></div>

                {/* Database Reset Action */}
                <button
                  onClick={handleResetData}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Database className="w-4 h-4 shrink-0" />
                  <span>Reset Mock Database</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Card with Role Switcher Dropdown */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2.5 ml-2 hover:bg-slate-100 p-1.5 rounded-xl transition-colors cursor-pointer select-none"
          >
            {/* Circular avatar */}
            <div className="w-8 h-8 rounded-full bg-[#D1E2FF] flex-shrink-0 shadow-inner flex items-center justify-center font-black text-[10px] text-[#2D6A24]">
              {userRole === 'System Administrator' ? 'SA' : userRole === 'Inventory Officer' ? 'IO' : 'PO'}
            </div>
            
            <div className="flex flex-col items-start leading-none text-left">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">
                {userRole === 'System Administrator' ? 'Admin Gateway' : userRole}
              </span>
              <span className="text-[8px] font-bold text-slate-400 block mt-0.5">
                Click to switch role
              </span>
            </div>
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-56 bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-xl z-55 animate-slide-up-fade">
              <div className="px-3 py-1.5 border-b border-slate-100 mb-1.5">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Ecosystem Identity</span>
                <span className="block text-[10px] font-bold text-slate-700 mt-1">Switch simulated role:</span>
              </div>
              
              <div className="space-y-0.5">
                {[
                  'System Administrator',
                  'Inventory Officer',
                  'Procurement Officer'
                ].map((role) => {
                  const isActive = userRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => {
                        setUserRole(role as 'System Administrator' | 'Inventory Officer' | 'Procurement Officer');
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#2D6A24] text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-slate-300'}`}></div>
                      <span>{role}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
