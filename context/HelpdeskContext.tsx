'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { HelpdeskTicket, FAQArticle } from '../types/helpdesk';

interface HelpdeskContextType {
  tickets: HelpdeskTicket[];
  articles: FAQArticle[];
  addTicket: (t: Omit<HelpdeskTicket, 'id' | 'dateCreated' | 'slaDeadline' | 'internalNotes'>) => void;
  resolveTicket: (id: string) => void;
  addTicketNote: (id: string, note: string) => void;
  voteArticleHelpfulness: (id: string, helpful: boolean) => void;
  slaRules: { High: number; Medium: number; Low: number }; // SLA response targets in minutes
}

const HelpdeskContext = createContext<HelpdeskContextType | undefined>(undefined);

export function HelpdeskProvider({ children }: { children: React.ReactNode }) {
  const slaRules = { High: 30, Medium: 240, Low: 480 }; // response targets in minutes

  const [articles, setArticles] = useState<FAQArticle[]>([
    { id: 'ART-001', category: 'Orders', title: 'How do I request a product return?', content: 'Navigate to E-Commerce Sync order details, and request returns within 7 calendar days of delivery receipts.', helpfulness: 18 },
    { id: 'ART-002', category: 'Inventory', title: 'What is the safety buffer stock threshold?', content: 'A default 10% safety buffer is automatically subtracted from online storefront channels to prevent stockouts during parallel physical transactions.', helpfulness: 24 },
    { id: 'ART-003', category: 'Payments', title: 'Which payment options are supported?', content: 'The ERP sync supports Gcash, ShopeePay, PayMaya, Stripe Credit Card, and Cash on Delivery.', helpfulness: 11 },
  ]);

  const [tickets, setTickets] = useState<HelpdeskTicket[]>([
    { id: 'TKT-88492', customerName: 'Juan Dela Cruz', email: 'juan@gmail.com', issue: 'Wrong product received (ordered seeds, got fertilizer).', priority: 'High', status: 'Open', assignedAgent: 'Agent Sarah', dateCreated: '2026-07-01T08:00:00Z', slaDeadline: '2026-07-01T08:30:00Z', internalNotes: ['Called warehouse team to verify package dispatch logs.'] },
    { id: 'TKT-88493', customerName: 'Maria Santos', email: 'maria@outlook.com', issue: 'Payment gateway charged twice on WooCommerce storefront.', priority: 'Medium', status: 'In Progress', assignedAgent: 'Agent Mark', dateCreated: '2026-07-01T07:15:00Z', slaDeadline: '2026-07-01T11:15:00Z', internalNotes: ['Contacted payment gateway support provider (Stripe).'] },
  ]);

  // SLA violation automatic checkers and client-side mount initialization
  useEffect(() => {
    // Set dynamic live countdowns relative to current local load time asynchronously
    const timeout = setTimeout(() => {
      setTickets(prev =>
        prev.map((t, idx) => {
          const mins = idx === 0 ? 30 : 240;
          return {
            ...t,
            dateCreated: new Date().toISOString(),
            slaDeadline: new Date(Date.now() + mins * 60 * 1000).toISOString()
          };
        })
      );
    }, 0);

    const interval = setInterval(() => {
      setTickets(prev =>
        prev.map(t => {
          if (t.status !== 'Resolved' && t.status !== 'Closed') {
            const hasBreached = new Date() > new Date(t.slaDeadline);
            if (hasBreached && t.priority !== 'High') {
              return { ...t, priority: 'High', internalNotes: [...t.internalNotes, 'System auto-escalated priority due to SLA target breach.'] };
            }
          }
          return t;
        })
      );
    }, 10000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const addTicket = (t: Omit<HelpdeskTicket, 'id' | 'dateCreated' | 'slaDeadline' | 'internalNotes'>) => {
    const id = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;
    const minutesToAdd = t.priority === 'High' ? 30 : t.priority === 'Medium' ? 240 : 480;
    const slaDeadline = new Date(Date.now() + minutesToAdd * 60 * 1000).toISOString();

    const newTicket: HelpdeskTicket = {
      ...t,
      id,
      dateCreated: new Date().toISOString(),
      slaDeadline,
      internalNotes: ['Support ticket created successfully.'],
    };

    setTickets(prev => [newTicket, ...prev]);
  };

  const resolveTicket = (id: string) => {
    setTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'Resolved', internalNotes: [...t.internalNotes, 'Ticket resolved by active agent.'] } : t))
    );
  };

  const addTicketNote = (id: string, note: string) => {
    setTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, internalNotes: [...t.internalNotes, note] } : t))
    );
  };

  const voteArticleHelpfulness = (id: string, helpful: boolean) => {
    setArticles(prev =>
      prev.map(art => (art.id === id ? { ...art, helpfulness: art.helpfulness + (helpful ? 1 : -1) } : art))
    );
  };

  return (
    <HelpdeskContext.Provider value={{
      tickets,
      articles,
      addTicket,
      resolveTicket,
      addTicketNote,
      voteArticleHelpfulness,
      slaRules
    }}>
      {children}
    </HelpdeskContext.Provider>
  );
}

export function useHelpdesk() {
  const context = useContext(HelpdeskContext);
  if (!context) {
    throw new Error('useHelpdesk must be used within a HelpdeskProvider');
  }
  return context;
}
