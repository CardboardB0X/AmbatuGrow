'use client';

import React, { useRef, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Search, Bell, Grid, AlertTriangle, Plus, ArrowRightLeft, Database } from 'lucide-react';

export default function Header() {
  const {
    activeTab,
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
    setIsTransferOpen,
    editItem,
    generateRequisitionOrder
  } = useInventory();

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
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsNotificationsOpen, setIsQuickMenuOpen]);

  // Get view title based on active tab
  const getTerminalTitle = () => {
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
      // Generate requisition log too
      generateRequisitionOrder([{ sku, qty: reorderQty }]);
    }
  };

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
          placeholder="Search inventory..."
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
            {lowStockItems.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-800">Critical Alerts</span>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  {lowStockItems.length} Low Stock
                </span>
              </div>
              
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {lowStockItems.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs font-semibold">
                    All stock levels are currently healthy!
                  </div>
                ) : (
                  lowStockItems.map((item) => (
                    <div key={item.sku} className="p-3.5 flex flex-col gap-1.5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-slate-800 text-[11px]">{item.sku} ({item.name})</span>
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {item.stockQty} left
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight">
                        Qty has dropped below safety safety stock level of {item.minQty} {item.uom}.
                      </p>
                      <div className="flex justify-end mt-1">
                        <button
                          onClick={() => handleQuickReorder(item.sku)}
                          className="px-3 py-1 bg-[#2D6A24] hover:bg-[#23531B] text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Quick Restock (+{item.maxQty - item.stockQty})
                        </button>
                      </div>
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
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Quick Actions
              </div>
              
              <div className="p-1.5 space-y-0.5">
                <button
                  onClick={() => {
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
                
                <button
                  onClick={() => {
                    setIsTransferOpen(true);
                    setIsQuickMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                  <span>Relocate Stock</span>
                </button>
                
                <div className="h-px bg-slate-100 my-1"></div>

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

        {/* User Card */}
        <div className="flex items-center gap-3 ml-2">
          {/* Circular avatar */}
          <div className="w-9 h-9 rounded-full bg-[#D1E2FF] flex-shrink-0 shadow-inner"></div>
          
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Inventory Officer
          </span>
        </div>

      </div>

    </header>
  );
}
