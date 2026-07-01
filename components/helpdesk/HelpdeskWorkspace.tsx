'use client';

import React, { useState, useEffect } from 'react';
import { useHelpdesk } from '../../context/HelpdeskContext';
import { useInventory } from '../../context/InventoryContext';
import { 
  LifeBuoy, 
  Globe, 
  MessageSquare, 
  Settings, 
  CheckCircle,
  ThumbsUp,
  Search,
  Send
} from 'lucide-react';

export default function HelpdeskWorkspace() {
  const { 
    tickets, 
    articles, 
    addTicket, 
    resolveTicket, 
    addTicketNote, 
    voteArticleHelpfulness,
    slaRules 
  } = useHelpdesk();

  const { moduleTab, setModuleTab } = useInventory();
  const activeTab = ['tickets', 'portal', 'comms', 'sla'].includes(moduleTab)
    ? (moduleTab as 'tickets' | 'portal' | 'comms' | 'sla')
    : 'tickets';
  const [currentTime, setCurrentTime] = useState(new Date());

  // Form States
  const [custName, setCustName] = useState('Juan Dela Cruz');
  const [custEmail, setCustEmail] = useState('juan@gmail.com');
  const [ticketIssue, setTicketIssue] = useState('Damaged package arrived.');
  const [priorityVal, setPriorityVal] = useState<'High' | 'Medium' | 'Low'>('High');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Search KB Article State
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Ticket Note State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');

  // Update current time tick for live SLA countdowns
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketIssue) return;

    addTicket({
      customerName: custName,
      email: custEmail,
      issue: ticketIssue,
      priority: priorityVal,
      status: 'Open',
      assignedAgent: 'Agent Sarah'
    });

    setTicketIssue('');
    setTicketSuccess(true);
    setTimeout(() => setTicketSuccess(false), 3000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !newNote) return;

    addTicketNote(selectedTicketId, newNote);
    setNewNote('');
  };

  // Filter KB articles based on search
  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // Helpdesk Subnavigation tabs
  const tabs = [
    { id: 'tickets' as const, label: 'Ticket Board', icon: LifeBuoy },
    { id: 'portal' as const, label: 'Self-Service Portal', icon: Globe },
    { id: 'comms' as const, label: 'Communications History', icon: MessageSquare },
    { id: 'sla' as const, label: 'SLA Compliance Rules', icon: Settings },
  ];

  return (
    <div className="flex-1 bg-slate-50 p-6 flex flex-col min-h-0 overflow-y-auto font-sans select-none animate-slide-up-fade">
      {/* Module Title */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Customer Support Helpdesk
          </h2>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
            ITEC 75 ERP Module — Resolve support cases, host solutions portals, and monitor SLA targets.
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
        
        {/* ── TAB 1: TICKET BOARD ── */}
        {activeTab === 'tickets' && (
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up-fade">
            {/* Ticket List Board */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Support Incident Registry</span>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-3">Ticket ID</th>
                        <th className="p-3">Client Name</th>
                        <th className="p-3">Description / Issue</th>
                        <th className="p-3 text-center">Priority</th>
                        <th className="p-3 text-center">Remaining Time</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {tickets.map(t => {
                        const targetTime = new Date(t.slaDeadline).getTime();
                        const diffMs = targetTime - currentTime.getTime();
                        const minutesRemaining = Math.max(0, Math.floor(diffMs / 1000 / 60));
                        const secondsRemaining = Math.max(0, Math.floor((diffMs / 1000) % 60));
                        const hasBreached = diffMs < 0;

                        return (
                          <tr key={t.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-extrabold text-slate-800">{t.id}</td>
                            <td className="p-3">
                              <div className="font-extrabold">{t.customerName}</div>
                              <div className="text-[9px] text-slate-400 font-bold">{t.email}</div>
                            </td>
                            <td className="p-3 text-slate-500">{t.issue}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                t.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-200/50 animate-pulse' :
                                t.priority === 'Medium' ? 'bg-blue-50 text-blue-700 border border-blue-200/50' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {t.priority}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {t.status === 'Resolved' ? (
                                <span className="text-[10px] text-emerald-600 font-bold">Resolved</span>
                              ) : hasBreached ? (
                                <span className="text-[10px] text-red-600 font-black animate-pulse uppercase">Breached</span>
                              ) : (
                                <span className="text-[10px] text-slate-600 font-black tracking-wider font-mono">
                                  {minutesRemaining}m {secondsRemaining}s
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => setSelectedTicketId(t.id)}
                                className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                              >
                                Notes
                              </button>
                              {t.status !== 'Resolved' && (
                                <button
                                  onClick={() => resolveTicket(t.id)}
                                  className="px-2.5 py-1 bg-emerald-50 text-[#2D6A24] hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                                >
                                  Resolve
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Selected Ticket Notes Editor */}
              {selectedTicket && (
                <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-fade-in flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Notes Log for {selectedTicket.id}</span>
                    <button onClick={() => setSelectedTicketId(null)} className="text-[9px] font-black text-red-600 uppercase cursor-pointer hover:underline">Close</button>
                  </div>
                  <div className="space-y-1.5 max-h-24 overflow-y-auto bg-white border border-slate-100 p-2.5 rounded-lg text-[9px] text-slate-500 font-bold">
                    {selectedTicket.internalNotes.map((note, idx) => (
                      <div key={idx} className="border-l-2 border-emerald-500 pl-2 py-0.5">{note}</div>
                    ))}
                  </div>
                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input 
                      type="text" 
                      value={newNote} 
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add internal action note..."
                      className="flex-grow bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    />
                    <button type="submit" className="px-3 bg-[#2D6A24] text-white rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#23531B]">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Create Ticket Form */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Manually Raise Incident Ticket</span>
                
                {ticketSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[10px] font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>Support ticket created. SLA response countdown started.</span>
                  </div>
                )}

                <div className="space-y-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Customer Name</label>
                    <input 
                      type="text" 
                      value={custName} 
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Customer Email</label>
                    <input 
                      type="email" 
                      value={custEmail} 
                      onChange={(e) => setCustEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Priority Rating</label>
                    <select 
                      value={priorityVal} 
                      onChange={(e) => setPriorityVal(e.target.value as 'High' | 'Medium' | 'Low')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Describe Support Issue</label>
                    <textarea 
                      value={ticketIssue} 
                      onChange={(e) => setTicketIssue(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-2 bg-[#2D6A24] hover:bg-[#23531B] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer mt-2">
                  Raise Support Case
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── TAB 2: SELF-SERVICE PORTAL ── */}
        {activeTab === 'portal' && (
          <div className="flex-grow flex flex-col gap-6 animate-slide-up-fade">
            {/* Search and Category block */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row gap-5 justify-between items-center">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Client FAQs Solutions directory</span>
                <p className="text-xs text-slate-500 mt-1">Promote self-service solutions to minimize operational ticket workloads.</p>
              </div>
              <div className="relative w-full md:w-60 shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs font-bold text-slate-700 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Articles List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArticles.map(art => (
                <div key={art.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[160px] hover:border-emerald-500/20 transition-all">
                  <div>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-wider block w-max mb-3">
                      {art.category}
                    </span>
                    <h3 className="text-xs font-black text-slate-800 leading-snug">{art.title}</h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-2.5">{art.content}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-bold">Was this helpful?</span>
                    <button 
                      onClick={() => voteArticleHelpfulness(art.id, true)}
                      className="flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-emerald-100 transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3 text-emerald-600" />
                      <span>{art.helpfulness} votes</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: COMMUNICATIONS HISTORY ── */}
        {activeTab === 'comms' && (
          <div className="flex-grow bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col animate-slide-up-fade">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Communications History log</span>
            
            <div className="border border-slate-100 rounded-xl p-4 flex flex-col gap-4 text-xs font-medium text-slate-700">
              <div className="flex items-start gap-3">
                <span className="px-2.5 py-1 bg-blue-50 border border-blue-200/50 text-blue-700 rounded-lg text-[9px] font-black uppercase shrink-0">Email</span>
                <div>
                  <div className="font-extrabold text-slate-800">To: juan@gmail.com</div>
                  <p className="text-slate-500 mt-1.5 leading-relaxed">&quot;Your return request for order WOO-8849 has been received. Our team will verify matching receipts shortly.&quot;</p>
                  <div className="text-[9px] text-slate-400 font-bold mt-2">Sent via automated system ➔ 3 hrs ago</div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
                <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200/50 text-[#2D6A24] rounded-lg text-[9px] font-black uppercase shrink-0">Phone</span>
                <div>
                  <div className="font-extrabold text-slate-800">Call Log: Maria Santos (0918-765-4321)</div>
                  <p className="text-slate-500 mt-1.5 leading-relaxed">&quot;Customer called to check WooCommerce payment charged twice. Advised that Stripe payments take 1-3 business days to reconcile.&quot;</p>
                  <div className="text-[9px] text-slate-400 font-bold mt-2">Logged by Agent Sarah ➔ 5 hrs ago</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: SLA COMPLIANCE RULES ── */}
        {activeTab === 'sla' && (
          <div className="flex-grow flex flex-col gap-6 animate-slide-up-fade">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* SLA settings */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">SLA Response Duration Limits</span>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span>High Priority Incidents</span>
                      <span className="text-red-700 bg-red-50 border border-red-200/50 px-2 py-0.5 rounded uppercase font-black text-[10px]">
                        {slaRules.High} Minutes Limit
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span>Medium Priority Incidents</span>
                      <span className="text-blue-700 bg-blue-50 border border-blue-200/50 px-2 py-0.5 rounded uppercase font-black text-[10px]">
                        {slaRules.Medium} Minutes Limit
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span>Low Priority Incidents</span>
                      <span className="text-slate-600 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded uppercase font-black text-[10px]">
                        {slaRules.Low} Minutes Limit
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Escalation details */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">SLA Compliance Rules</span>
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col gap-3 text-[11px] font-bold text-slate-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Timer countdowns are active on all unresolved support cases.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Incidents exceeding SLA response targets automatically turn to &quot;Breached&quot; status.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>System auto-escalates ticket priority level if unresolved past deadline constraints.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
