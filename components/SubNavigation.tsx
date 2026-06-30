'use client';

import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { SubNavigationTab } from '../types/inventory';
import { 
  Layers, 
  History, 
  Map, 
  AlertTriangle 
} from 'lucide-react';

export default function SubNavigation() {
  const { activeTab, setActiveTab, clearSelection } = useInventory();

  const tabs = [
    { id: 'Tracking' as SubNavigationTab, label: 'Tracking', icon: Layers },
    { id: 'Transactions' as SubNavigationTab, label: 'Transactions', icon: History },
    { id: 'Locations' as SubNavigationTab, label: 'Locations', icon: Map },
    { id: 'Reports & Alerts' as SubNavigationTab, label: 'Reports & Alerts', icon: AlertTriangle },
  ];

  const handleTabClick = (tabId: SubNavigationTab) => {
    setActiveTab(tabId);
    clearSelection();
  };

  return (
    <div className="bg-white border-b border-slate-200/80 px-8 py-2 flex items-center select-none flex-shrink-0">
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? 'bg-white text-emerald-700 shadow-sm border border-emerald-500/10'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
