'use client';

import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { ProcurementTab } from '../../types/procurement';
import { ClipboardList, Users, ShoppingCart, PackageCheck } from 'lucide-react';

const tabs: { id: ProcurementTab; label: string; icon: React.ElementType }[] = [
  { id: 'Requisitions',    label: 'Purchase Requisitions',        icon: ClipboardList },
  { id: 'Suppliers',       label: 'Supplier Management',          icon: Users },
  { id: 'Purchase Orders', label: 'Purchase Order Management',    icon: ShoppingCart },
  { id: 'Goods Receipt',   label: 'Goods Receipt & Invoice',      icon: PackageCheck },
];

export default function ProcurementSubNavigation() {
  const { activeTab, setActiveTab } = useProcurement();

  return (
    <div className="bg-white border-b border-slate-200/80 px-8 py-2 flex items-center select-none flex-shrink-0">
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
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
