'use client';

import React, { useState } from 'react';
import { useSCM } from '../../context/SCMContext';
import { useInventory } from '../../context/InventoryContext';
import { 
  LineChart, 
  Truck, 
  Star, 
  CheckCircle, 
  ArrowLeftRight, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function SCMWorkspace() {
  const { 
    shipments, 
    forecastItems, 
    growthMultiplier, 
    setGrowthMultiplier, 
    addShipment, 
    scmLogs 
  } = useSCM();

  const { items: inventoryItems, zones, moduleTab, setModuleTab } = useInventory();
  const activeTab = ['demand', 'logistics', 'route', 'distrib'].includes(moduleTab)
    ? (moduleTab as 'demand' | 'logistics' | 'route' | 'distrib')
    : 'demand';

  // Input states for new shipment schedule
  const [newCarrier, setNewCarrier] = useState('LBC Express');
  const [newQty, setNewQty] = useState(100);
  const [newOrigin, setNewOrigin] = useState('Indang Hub');
  const [newDestination, setNewDestination] = useState('Dasma Warehouse');

  // Stock transfer states
  const [transferSku, setTransferSku] = useState(inventoryItems[0]?.sku || '');
  const [transferFrom, setTransferFrom] = useState('Warehouse A - Zone 1');
  const [transferTo, setTransferTo] = useState('Warehouse B - Zone 2');
  const [transferQty, setTransferQty] = useState(10);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const handleScheduleShipment = (e: React.FormEvent) => {
    e.preventDefault();
    addShipment({
      carrier: newCarrier,
      qty: newQty,
      origin: newOrigin,
      destination: newDestination,
      status: 'Processing',
      departureTime: new Date().toISOString(),
      eta: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
    setNewQty(100);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferSuccess(true);
    setTimeout(() => setTransferSuccess(false), 3000);
  };

  // SCM Subnavigation Configuration
  const tabs = [
    { id: 'demand' as const, label: 'Demand Forecasting', icon: LineChart },
    { id: 'logistics' as const, label: 'Supplier Coordination', icon: Star },
    { id: 'route' as const, label: 'Logistics & Routes', icon: Truck },
    { id: 'distrib' as const, label: 'Distribution & Transfers', icon: ArrowLeftRight },
  ];

  return (
    <div className="flex-1 bg-slate-50 p-6 flex flex-col min-h-0 overflow-y-auto font-sans select-none animate-slide-up-fade">
      {/* Module Title */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Supply Chain & Logistics Terminal
          </h2>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
            ITEC 75 ERP Module — Manage forecasting, route telemetry, and inter-location allocations.
          </p>
        </div>
      </div>

      {/* ── TAB SELECTION BAR (UNIFIED DESIGN) ── */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl mb-5 flex-shrink-0 border border-slate-200/40">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setModuleTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-white text-emerald-700 shadow-sm border border-emerald-500/10'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT CONTAINERS ── */}
      <div className="flex-grow flex flex-col min-h-[400px]">
        
        {/* ── TAB 1: DEMAND FORECASTING ── */}
        {activeTab === 'demand' && (
          <div className="flex-grow flex flex-col gap-6 animate-slide-up-fade">
            {/* Interactive growth control */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row gap-5 items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">SCM AI Predictive Growth Control</span>
                <p className="text-xs text-slate-500 mt-1">Adjust growth multiplier parameters to recalculate Safety Target Stock levels in real-time.</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                <span className="text-xs font-bold text-slate-500">Scale:</span>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.5" 
                  step="0.1" 
                  value={growthMultiplier}
                  onChange={(e) => setGrowthMultiplier(parseFloat(e.target.value))}
                  className="w-40 accent-[#2D6A24] cursor-pointer"
                />
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-black text-emerald-700 min-w-[50px] text-center">
                  {(growthMultiplier * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Interactive SVG Chart comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col min-h-[250px]">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Historical Sales vs Forecast (Trendline Plot)</span>
                
                {/* SVG Visual Plot */}
                <div className="flex-grow relative h-40 w-full border border-slate-100 rounded-xl bg-slate-50/50 p-2 overflow-hidden flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Gridlines */}
                    <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" />
                    <line x1="0" y1="75" x2="100" y2="75" stroke="#f1f5f9" strokeWidth="0.5" />
                    
                    {/* Historical Trendline (solid grey line) */}
                    <path
                      d="M 5 80 Q 20 60, 40 70 T 70 50"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    
                    {/* Forecasted Trendline (dashed green line scaling with growthMultiplier) */}
                    <path
                      d={`M 70 50 L 85 ${50 - 15 * growthMultiplier} L 98 ${45 - 25 * growthMultiplier}`}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeDasharray="4 3"
                      strokeLinecap="round"
                    />

                    {/* Chart Nodes */}
                    <circle cx="70" cy="50" r="3.5" fill="#f59e0b" />
                    <circle cx="98" cy={(45 - 25 * growthMultiplier).toString()} r="3.5" fill="#10b981" />
                  </svg>
                  
                  {/* Legend Overlay */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-3.5 text-[9px] font-bold text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-slate-400 inline-block"></span> Historical Sales</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 border-t-2 border-dashed border-emerald-500 inline-block"></span> Forecast (AI Target)</span>
                  </div>
                </div>
              </div>

              {/* Recommendations Scorecard */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Re-order Actions</span>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[11px] font-black text-red-900 uppercase">Fertilizer Deficit</div>
                        <p className="text-[10px] text-red-700/80 font-bold mt-0.5">Stock level (45) falls below projected buffer. Auto PO creation recommended.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="w-full py-2 bg-[#2D6A24] hover:bg-[#23531B] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">
                  Generate Reorder Requisitions
                </button>
              </div>
            </div>

            {/* Forecast Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">SCM Forecast Telemetry Matrix</span>
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-3">SKU Code</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3 text-center">On-Hand Qty</th>
                      <th className="p-3 text-center">Forecast Status</th>
                      <th className="p-3 text-right">Adjusted Target Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {forecastItems.map(item => {
                      const computedTarget = Math.round(item.recommendedStock * growthMultiplier);
                      return (
                        <tr key={item.sku} className="hover:bg-slate-50/50">
                          <td className="p-3 font-extrabold text-slate-800">{item.sku}</td>
                          <td className="p-3">{item.name}</td>
                          <td className="p-3 text-center font-bold">{item.currentStock}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              item.predictedDemand === 'High' ? 'bg-red-50 text-red-700 border border-red-200/50' :
                              item.predictedDemand === 'Stable' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {item.predictedDemand}
                            </span>
                          </td>
                          <td className="p-3 text-right font-black text-[#2D6A24]">{computedTarget} units</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: SUPPLIER COORDINATION ── */}
        {activeTab === 'logistics' && (
          <div className="flex-grow flex flex-col gap-6 animate-slide-up-fade">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Scorecard list */}
              <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Supplier Delivery Reliability Index</span>
                <div className="space-y-3.5">
                  <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-slate-800 text-xs">AgriSource PH Inc.</div>
                      <div className="text-[9px] text-slate-400 font-bold mt-1">Lead Time: 5 Days | Category: Agricultural</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">98% On-Time</span>
                      <div className="flex text-amber-400 text-xs">
                        <Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-slate-800 text-xs">TechCraft Indang</div>
                      <div className="text-[9px] text-slate-400 font-bold mt-1">Lead Time: 3 Days | Category: IT Equipment</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">89% On-Time</span>
                      <div className="flex text-amber-400 text-xs">
                        <Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5.0 h-3.5 text-slate-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Automate placement triggers */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Automated Ordering Triggers</span>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1">Collaborate directly on delivery timelines and automatically route requisitions through the Procurement pipeline when threshold alerts breach.</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>Re-order trigger status:</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-black uppercase text-[9px]">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: LOGISTICS & ROUTES ── */}
        {activeTab === 'route' && (
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up-fade">
            
            {/* Real-time SVG map */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col min-h-[350px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Real-Time Transit Telemetry (GPS Tracker)</span>
              
              <div className="flex-grow relative border border-slate-100 rounded-xl bg-slate-900 p-2 overflow-hidden flex items-end">
                {/* SVG Map Layout */}
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Grid layout */}
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Route Paths */}
                  <path d="M 20 20 L 50 50 M 50 50 L 80 80 M 50 50 L 55 25" fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2.5" strokeDasharray="3 3" />

                  {/* Regional nodes */}
                  <circle cx="20" cy="20" r="3.5" fill="#f43f5e" />
                  <text x="25" y="22" fill="#94a3b8" className="text-[5px] font-black uppercase tracking-wider">Indang Hub</text>

                  <circle cx="50" cy="50" r="3.5" fill="#f43f5e" />
                  <text x="55" y="52" fill="#94a3b8" className="text-[5px] font-black uppercase tracking-wider">Dasma Node</text>

                  <circle cx="80" cy="80" r="3.5" fill="#f43f5e" />
                  <text x="85" y="82" fill="#94a3b8" className="text-[5px] font-black uppercase tracking-wider">Silang Warehouse</text>

                  {/* Active Cargo Carrier coordinate representations */}
                  {shipments.map(sh => (
                    <g key={sh.id}>
                      <circle cx={sh.coords.x.toString()} cy={sh.coords.y.toString()} r="4.5" fill="#10b981" className="animate-ping opacity-60" />
                      <circle cx={sh.coords.x.toString()} cy={sh.coords.y.toString()} r="3" fill="#10b981" />
                      <text x={(sh.coords.x + 3).toString()} y={(sh.coords.y - 3).toString()} fill="#ffffff" className="text-[4px] font-bold">
                        {sh.id} ({sh.carrier.split(' ')[0]})
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Inbound/Outbound scheduler */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <form onSubmit={handleScheduleShipment} className="space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Schedule Carrier Dispatch</span>
                
                <div className="space-y-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Carrier Service</label>
                    <select 
                      value={newCarrier} 
                      onChange={(e) => setNewCarrier(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    >
                      <option>LBC Express</option>
                      <option>J&T Cargo</option>
                      <option>Cavite Transport</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Dispatched Qty</label>
                    <input 
                      type="number" 
                      value={newQty} 
                      onChange={(e) => setNewQty(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">From Node</label>
                      <input 
                        type="text" 
                        value={newOrigin} 
                        onChange={(e) => setNewOrigin(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">To Node</label>
                      <input 
                        type="text" 
                        value={newDestination} 
                        onChange={(e) => setNewDestination(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-2 bg-[#2D6A24] hover:bg-[#23531B] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer mt-2">
                  Dispatch Shipment
                </button>
              </form>

              {/* Activity log feed */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-2">SCM Activity Ledger</span>
                <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
                  {scmLogs.map((log, idx) => (
                    <div key={idx} className="text-[9px] text-slate-500 font-bold border-l-2 border-emerald-500 pl-2 py-0.5">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: DISTRIBUTION & TRANSFERS ── */}
        {activeTab === 'distrib' && (
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up-fade">
            
            {/* Stock transfer wizard */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <form onSubmit={handleTransfer} className="space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Inter-Warehouse Stock Transfer Wizard</span>
                
                {transferSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[10px] font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>Authorized stock transfer request initiated. Logs saved to ledger.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Select Product SKU</label>
                    <select 
                      value={transferSku} 
                      onChange={(e) => setTransferSku(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    >
                      {inventoryItems.map(item => (
                        <option key={item.sku} value={item.sku}>{item.name} ({item.sku})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Transfer Qty</label>
                    <input 
                      type="number" 
                      value={transferQty} 
                      onChange={(e) => setTransferQty(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">From Zone</label>
                    <select 
                      value={transferFrom} 
                      onChange={(e) => setTransferFrom(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    >
                      {zones.map(z => <option key={z.name}>{z.name}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">To Zone</label>
                    <select 
                      value={transferTo} 
                      onChange={(e) => setTransferTo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    >
                      {zones.map(z => <option key={z.name}>{z.name}</option>).reverse()}
                    </select>
                  </div>
                </div>

                <button type="submit" className="px-5 py-2.5 bg-[#2D6A24] hover:bg-[#23531B] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer mt-2 flex items-center gap-1.5">
                  <span>Process Transfer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Warehouse capacities */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Location Storage Capacities</span>
                <div className="space-y-4">
                  {zones.map(z => {
                    const pct = Math.round((z.currentOccupancy / z.maxCapacity) * 100);
                    return (
                      <div key={z.name} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>{z.name}</span>
                          <span>{pct}% ({z.currentOccupancy}/{z.maxCapacity} units)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct > 80 ? 'bg-red-500' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
