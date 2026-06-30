'use client';

import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { HelpCircle, Ticket, Check, AlertCircle } from 'lucide-react';

export default function SupportModal() {
  const {
    isSupportOpen,
    setIsSupportOpen,
    logActivity
  } = useInventory();

  // Form State
  const [operatorName, setOperatorName] = useState('Inventory Officer');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [ticketId, setTicketId] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Active FAQ article tabs
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  if (!isSupportOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!subject.trim()) {
      setError('Please provide a ticket subject');
      return;
    }
    if (!details.trim()) {
      setError('Please provide ticket description details');
      return;
    }

    const tId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketId(tId);

    // Log ticket event to Audit timeline logs
    logActivity(`[SUPPORT TICKET] Logged support request "${subject}" (${tId}) - Priority: ${priority}`);

    setSuccess(true);
    setSubject('');
    setDetails('');
  };

  const handleClose = () => {
    setIsSupportOpen(false);
    setSuccess(false);
    setError('');
  };

  const faqs = [
    {
      title: 'How do I adjust safety stock thresholds?',
      content: 'You can adjust safety stock thresholds per item by clicking the "Edit" link in the Tracking grid. To configure a default safety threshold for all items, click "Settings" at the bottom of the sidebar.'
    },
    {
      title: 'How do I perform an Inter-Warehouse Transfer?',
      content: 'Navigate to "Warehouse Location Tracking" and click "Initiate Stock Transfer Wizard". Alternatively, click the transfer icon directly in the Tracking table. Specify the SKU, target zone, and quantity, then execute.'
    },
    {
      title: 'How is expiration FEFO warning calculated?',
      content: 'Batches are monitored dynamically. If the timestamp expiration falls within 14 days of June 30, 2026, the Stock Transaction ledger will flag the row with an active warning pill.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center select-none animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={handleClose}
      ></div>

      {/* Dialog box */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex h-[500px]">
        
        {/* Left Column: Log Ticket Form */}
        <div className="w-1/2 p-6 border-r border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="w-5 h-5 text-[#2D6A24]" />
              <h3 className="text-sm font-extrabold text-slate-800">
                Log Support Helpdesk Ticket
              </h3>
            </div>

            {success ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="font-extrabold text-sm text-emerald-800">Support Ticket Logged!</h4>
                <p className="text-xs text-slate-700 font-bold">Ticket ID: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{ticketId}</span></p>
                <p className="text-[10px] text-slate-400 max-w-xs mt-1">Our system integration helpdesk will review this request. A copy of the event is recorded in the Recent Logs timeline.</p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-4 px-4 py-1.5 bg-[#2D6A24] hover:bg-[#23531B] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                >
                  Log Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {error && (
                  <div className="p-2.5 bg-red-50 border border-red-200/50 rounded-lg flex items-center gap-2 text-[10px] text-red-700 font-bold">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Grid for Name & Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Requester Profile
                    </label>
                    <input
                      type="text"
                      value={operatorName}
                      onChange={(e) => setOperatorName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Ticket Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                      className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Subject / Help Topic <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Relocation database locking error"
                    className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24] focus:border-[#2D6A24]"
                  />
                </div>

                {/* Message Details */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Describe Issue Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide description steps or visual errors you encountered..."
                    rows={4}
                    className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24] focus:border-[#2D6A24] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#2D6A24] hover:bg-[#23531B] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Submit Support Ticket
                </button>
              </form>
            )}
          </div>

          <span className="text-[9px] text-slate-400 font-bold">ITEC 75 System Support Desk &copy; 2026</span>
        </div>

        {/* Right Column: FAQ & Documentation */}
        <div className="w-1/2 p-6 bg-slate-50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-slate-600" />
              <h3 className="text-sm font-extrabold text-slate-800">
                Quick Documentation FAQs
              </h3>
            </div>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {faqs.map((faq, index) => {
                const isOpen = activeFaq === index;
                
                return (
                  <div 
                    key={index} 
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all shadow-xs cursor-pointer"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                  >
                    <div className="p-3.5 flex justify-between items-center bg-slate-50/20">
                      <span className="font-extrabold text-slate-700 text-[11px]">{faq.title}</span>
                      <span className="text-slate-400 text-xs font-black">{isOpen ? '-' : '+'}</span>
                    </div>
                    {isOpen && (
                      <div className="p-3.5 border-t border-slate-100 text-[10px] text-slate-500 font-medium leading-relaxed bg-white">
                        {faq.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Close button */}
          <div className="flex justify-end pt-4 border-t border-slate-200/60">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Close support
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
