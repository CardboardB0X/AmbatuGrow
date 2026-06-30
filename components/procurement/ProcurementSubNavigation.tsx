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
    <nav className="bg-white border-b border-slate-200 px-6 flex items-center gap-1 flex-shrink-0 overflow-x-auto">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              isActive
                ? 'border-[#2D6A24] text-[#2D6A24]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
