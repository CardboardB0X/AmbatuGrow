'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInventory } from '../context/InventoryContext';
import { 
  Layers, 
  ShoppingBag, 
  Truck, 
  DollarSign, 
  Users, 
  LineChart, 
  LifeBuoy, 
  Briefcase, 
  Globe, 
  BarChart3, 
  Lock, 
  Loader2 
} from 'lucide-react';

interface ModuleCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  telemetryText: string;
  telemetryColor: string;
  allowedRoles: string[];
}

export default function CentralLaunchpad() {
  const router = useRouter();
  const { 
    userRole, 
    setCurrentView,
    searchQuery
  } = useInventory();

  const [loadingModule, setLoadingModule] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleLaunchModule = (mod: ModuleCard) => {
    setLoadingModule(mod.title);

    setTimeout(() => {
      setLoadingModule(null);
      if (mod.id === 'inventory') {
        setCurrentView('inventory');
      } else if (mod.id === 'procurement') {
        router.push('/procurement');
      } else {
        setSuccessToast(`Simulation completed: ${mod.title} sandbox interface initialized successfully!`);
        setTimeout(() => setSuccessToast(null), 3000);
      }
    }, 1500);
  };

  const erpModules: ModuleCard[] = [
    {
      id: 'inventory',
      title: 'Inventory & Warehouse Management',
      description: 'Tracks item stock levels, executes transactions, maps zone locations, and evaluates alerts.',
      icon: Layers,
      telemetryText: '2 Low Stock Warnings',
      telemetryColor: 'bg-amber-100 text-amber-800 border-amber-200/50',
      allowedRoles: ['System Administrator', 'Inventory Officer', 'Procurement Officer']
    },
    {
      id: 'procurement',
      title: 'Procurement (Purchasing)',
      description: 'Initiates purchase requisitions, handles supplier profiles, tracks PO status, and performs 3-way matching.',
      icon: ShoppingBag,
      telemetryText: '4 Pending Approvals',
      telemetryColor: 'bg-blue-100 text-blue-800 border-blue-200/50',
      allowedRoles: ['System Administrator', 'Inventory Officer', 'Procurement Officer']
    },
    {
      id: 'supply_chain',
      title: 'Supply Chain Management',
      description: 'Conducts demand forecasting, coordinates supplier logistics, plans routes, and balances warehouse distribution.',
      icon: Truck,
      telemetryText: '3 Active Shipments',
      telemetryColor: 'bg-slate-100 text-slate-800 border-slate-200/50',
      allowedRoles: ['System Administrator']
    },
    {
      id: 'finance',
      title: 'Finance and Accounting',
      description: 'Controls the general ledger repository, organizes accounts payable, manages receivables, and compiles tax compliance reports.',
      icon: DollarSign,
      telemetryText: 'Ledger: Fully Balanced',
      telemetryColor: 'bg-emerald-100 text-emerald-800 border-emerald-200/50',
      allowedRoles: ['System Administrator']
    },
    {
      id: 'hr',
      title: 'Human Resources Module',
      description: 'Oversees centralized employee files, processes payroll metrics, manages hiring recruitment, and monitors attendance.',
      icon: Users,
      telemetryText: '98% Attendance Today',
      telemetryColor: 'bg-emerald-100 text-emerald-800 border-emerald-200/50',
      allowedRoles: ['System Administrator']
    },
    {
      id: 'sales',
      title: 'Sales Order Management',
      description: 'Orchestrates customer quotations, processes order fulfillments, manages CRM segments, and tracks performance metrics.',
      icon: LineChart,
      telemetryText: '12 Open Quotations',
      telemetryColor: 'bg-purple-100 text-purple-800 border-purple-200/50',
      allowedRoles: ['System Administrator']
    },
    {
      id: 'helpdesk',
      title: 'Customer Service / Helpdesk',
      description: 'Handles ticket systems, supports user self-service portals, archives communication histories, and tracks SLA rules.',
      icon: LifeBuoy,
      telemetryText: '1 SLA Breach Warning',
      telemetryColor: 'bg-red-100 text-red-800 border-red-200/50',
      allowedRoles: ['System Administrator']
    },
    {
      id: 'project_mgnt',
      title: 'Project Management Module',
      description: 'Defines work breakdown structures, manages resource allocation, charts cost bounds, and logs task milestones.',
      icon: Briefcase,
      telemetryText: 'Next Milestone: May 29',
      telemetryColor: 'bg-indigo-100 text-indigo-800 border-indigo-200/50',
      allowedRoles: ['System Administrator']
    },
    {
      id: 'ecommerce',
      title: 'E-Commerce Integration',
      description: 'Performs real-time order synchronization, updates stock counts, and centralizes product information management records.',
      icon: Globe,
      telemetryText: 'All Gateways Synced',
      telemetryColor: 'bg-emerald-100 text-emerald-800 border-emerald-200/50',
      allowedRoles: ['System Administrator']
    },
    {
      id: 'business_intelligence',
      title: 'Business Intelligence Engine',
      description: 'Configures custom operational reports, monitors real-time database logs, and enforces role-based data security.',
      icon: BarChart3,
      telemetryText: 'EOD Auto-Report Active',
      telemetryColor: 'bg-slate-100 text-slate-800 border-slate-200/50',
      allowedRoles: ['System Administrator']
    }
  ];

  // Filtering modules on query matching
  const filteredModules = erpModules.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-50 flex flex-col font-sans select-none relative overflow-y-auto min-h-0">
      
      {/* ── FULL SCREEN ROUTE LOADER SIMULATION ── */}
      {loadingModule && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center z-50 transition-all">
          <Loader2 className="w-12 h-12 text-[#2D6A24] animate-spin" />
          <h3 className="text-white font-extrabold text-sm uppercase tracking-widest mt-4">
            Launching {loadingModule}...
          </h3>
          <p className="text-[10px] text-emerald-200/80 font-bold mt-1">
            Setting up secure workspace directory nodes
          </p>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {successToast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3 z-50 animate-slide-in-right">
          <div className="p-1 text-emerald-500 bg-emerald-500/10 rounded-lg">
            <CheckCircleIcon />
          </div>
          <div className="text-[11px] font-bold">
            {successToast}
          </div>
        </div>
      )}

      {/* ── BENTO GRID CONTAINER ── */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Directory details */}
        <div className="mb-6 space-y-1.5 text-center md:text-left">
          <h3 className="text-lg font-black text-slate-800 tracking-tight">
            Central Application Bento Directory
          </h3>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Select a module to launch secure database environments. Unauthorized modules are secure-locked based on permissions.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredModules.map((mod) => {
            const Icon = mod.icon;
            
            // Check if card is unlocked for current role
            const isUnlocked = mod.allowedRoles.includes(userRole);

            return (
              <div
                key={mod.id}
                onClick={() => isUnlocked && handleLaunchModule(mod)}
                className={`relative bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-all duration-300 ${
                  isUnlocked 
                    ? 'hover:-translate-y-1 hover:shadow-md hover:bg-[#2D6A24]/[0.015] hover:border-emerald-300/40 cursor-pointer' 
                    : 'opacity-40 select-none cursor-not-allowed'
                }`}
              >
                
                {/* Top Card items */}
                <div className="space-y-4">
                  
                  {/* Icon & Lock indicator */}
                  <div className="flex justify-between items-start">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${
                      isUnlocked 
                        ? 'bg-emerald-50 text-[#2D6A24] border-emerald-100' 
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {!isUnlocked && (
                      <div className="p-1 bg-red-50 text-red-600 rounded-md border border-red-100 shadow-xs" title="Restricted Access">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-xs text-slate-800 leading-tight">
                      {mod.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-normal">
                      {mod.description}
                    </p>
                  </div>

                </div>

                {/* Bottom Telemetry Status Badge */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    Telemetry status
                  </span>
                  
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                    isUnlocked ? mod.telemetryColor : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    {mod.telemetryText}
                  </span>
                </div>

              </div>
            );
          })}
        </div>

      </main>

    </div>
  );
}

// Simple local check icon to prevent custom import complications
function CheckCircleIcon() {
  return (
    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
