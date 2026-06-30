/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Supplier } from '../../types/procurement';
import { X, Star } from 'lucide-react';

const CATEGORIES = ['Agricultural', 'IT Equipment', 'Office Supplies', 'Maintenance', 'Logistics', 'Other'];
const STATUSES = ['Active', 'Inactive'] as const;

export default function SupplierDrawer() {
  const {
    isSupplierDrawerOpen,
    setIsSupplierDrawerOpen,
    addSupplier,
    editSupplier,
    editingSupplier
  } = useProcurement();

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [status, setStatus] = useState<typeof STATUSES[number]>('Active');
  const [leadTimeDays, setLeadTimeDays] = useState(7);
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [taxId, setTaxId] = useState('');
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (editingSupplier) {
      setName(editingSupplier.name);
      setContactPerson(editingSupplier.contactPerson);
      setEmail(editingSupplier.email);
      setPhone(editingSupplier.phone);
      setAddress(editingSupplier.address);
      setCategory(editingSupplier.category);
      setStatus(editingSupplier.status === 'Blacklisted' ? 'Inactive' : (editingSupplier.status as typeof STATUSES[number]));
      setLeadTimeDays(editingSupplier.leadTimeDays);
      setPaymentTerms(editingSupplier.paymentTerms);
      setTaxId(editingSupplier.taxId);
      setRating(editingSupplier.rating);
    } else {
      setName('');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setAddress('');
      setCategory(CATEGORIES[0]);
      setStatus('Active');
      setLeadTimeDays(7);
      setPaymentTerms('Net 30');
      setTaxId('');
      setRating(3);
    }
    setErrors([]);
  }, [editingSupplier, isSupplierDrawerOpen]);

  if (!isSupplierDrawerOpen) return null;

  const validate = () => {
    const errs: string[] = [];
    if (!name.trim()) errs.push('Supplier Name is required.');
    if (!contactPerson.trim()) errs.push('Contact Person is required.');
    if (!email.trim() || !email.includes('@')) errs.push('A valid email address is required.');
    if (!phone.trim()) errs.push('Phone number is required.');
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    if (editingSupplier) {
      const updatedSupplier: Supplier = {
        ...editingSupplier,
        name,
        contactPerson,
        email,
        phone,
        address,
        category,
        status: editingSupplier.status === 'Blacklisted' ? 'Blacklisted' : status,
        leadTimeDays,
        paymentTerms,
        taxId,
        rating,
      };
      editSupplier(updatedSupplier);
    } else {
      addSupplier({
        name,
        contactPerson,
        email,
        phone,
        address,
        category,
        status,
        leadTimeDays,
        paymentTerms,
        taxId,
        rating,
      });
    }

    handleClose();
  };

  const handleClose = () => {
    setIsSupplierDrawerOpen(false);
    setErrors([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-lg bg-white h-full flex flex-col shadow-2xl z-10 animate-slide-in-right">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800">
              {editingSupplier ? `Edit Supplier Profile (${editingSupplier.id})` : 'Add Supplier'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              Configure supplier catalog, rating parameters, and delivery terms.
            </p>
          </div>
          <button 
            onClick={handleClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[10px] text-red-700 font-bold space-y-1">
              {errors.map((err, i) => <div key={i}>• {err}</div>)}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Supplier Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AgriSource PH Inc."
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tax ID (TIN)
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="000-000-000-000"
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0917xxxxxxx"
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 focus:outline-none bg-white cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Status
                </label>
                {editingSupplier && editingSupplier.status === 'Blacklisted' ? (
                  <div className="px-3 py-1.5 text-xs font-extrabold text-red-700 bg-red-50 rounded-lg border border-red-200 select-none">
                    Blacklisted
                  </div>
                ) : (
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as typeof STATUSES[number])}
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 focus:outline-none bg-white cursor-pointer"
                  >
                    {STATUSES.map(stat => (
                      <option key={stat} value={stat}>{stat}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Lead Time (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g. Net 30, COD"
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Supplier Rating
              </label>
              <div className="flex gap-1.5 items-center mt-1">
                {([1, 2, 3, 4, 5] as const).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className="w-5 h-5"
                      fill={num <= rating ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Business Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="Full address details..."
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2D6A24] resize-none"
              />
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-[#2D6A24] hover:bg-[#23531B] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
          >
            {editingSupplier ? 'Save Supplier' : 'Add Supplier'}
          </button>
        </div>

      </div>
    </div>
  );
}
