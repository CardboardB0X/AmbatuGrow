'use client';

import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { InventoryItem } from '../types/inventory';
import { 
  Plus, 
  Download,
  AlertTriangle 
} from 'lucide-react';

export default function TrackingWorkspace() {
  const {
    items,
    searchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedZoneFilter,
    setSelectedZoneFilter,
    selectedSkus,
    toggleSelectSku,
    toggleSelectAll,
    clearSelection,
    bulkDelete,
    bulkStatusChange,
    setIsDrawerOpen,
    setDrawerMode,
    setEditingItem,
    deleteItem,
    editItem
  } = useInventory();

  // Dynamic category extraction
  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))];
  
  // Filter items matching query and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.zone.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    const matchesZone = !selectedZoneFilter || item.zone === selectedZoneFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesZone;
  });

  const handleAddNewItem = () => {
    setDrawerMode('add');
    setEditingItem(null);
    setIsDrawerOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setDrawerMode('edit');
    setEditingItem(item);
    setIsDrawerOpen(true);
  };

  const handleArchiveItem = (item: InventoryItem) => {
    editItem({
      ...item,
      status: 'Obsolete'
    });
  };

  const isAllSelected = filteredItems.length > 0 && selectedSkus.length === filteredItems.length;

  const exportCsv = () => {
    const headers = ['SKU', 'Item Name', 'Description', 'Category', 'Stock Qty', 'UoM', 'Status', 'Zone'];
    const rows = filteredItems.map(i => [
      i.sku, i.name, i.description, i.category, i.stockQty, i.uom, i.status, i.zone
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `master_inventory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6 bg-slate-50 relative">
      
      {/* Zone Filter Indicator */}
      {selectedZoneFilter && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200/80 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-emerald-800 font-bold">
          <span>Active Zone Filter: <strong>{selectedZoneFilter}</strong></span>
          <button 
            onClick={() => setSelectedZoneFilter(null)}
            className="text-emerald-700 hover:text-red-700 font-extrabold"
          >
            Clear Filter &times;
          </button>
        </div>
      )}

      {/* Filter and Top Actions Header (Screenshot Match) */}
      <div className="flex items-end justify-between gap-4 mb-6 select-none">
        
        {/* Left Side: Add Button */}
        <button
          onClick={handleAddNewItem}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2D6A24] hover:bg-[#23531B] text-white rounded-md text-xs font-bold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add New Inventory Item
        </button>

        {/* Right Side: Category and Status Labels + Select Dropdowns */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2D6A24] focus:border-[#2D6A24] cursor-pointer min-w-[120px]"
            >
              <option value="All">All Categories</option>
              {categories.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2D6A24] focus:border-[#2D6A24] cursor-pointer min-w-[120px]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Obsolete">Obsolete</option>
            </select>
          </div>
        </div>

      </div>

      {/* Bulk Action Panel */}
      {selectedSkus.length > 0 && (
        <div className="mb-4 bg-emerald-950 text-white rounded-lg px-5 py-3 flex items-center justify-between text-xs shadow-md">
          <span className="font-bold">{selectedSkus.length} items selected</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => bulkStatusChange('Active')}
              className="px-3 py-1 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded text-[10px] uppercase tracking-wider"
            >
              Set Active
            </button>
            <button
              onClick={() => bulkStatusChange('Obsolete')}
              className="px-3 py-1 bg-amber-800 hover:bg-amber-700 text-white font-bold rounded text-[10px] uppercase tracking-wider"
            >
              Set Obsolete
            </button>
            <button
              onClick={bulkDelete}
              className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white font-bold rounded text-[10px] uppercase tracking-wider"
            >
              Delete
            </button>
            <button
              onClick={clearSelection}
              className="text-emerald-400 hover:text-emerald-300 font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Grid Container */}
      <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        
        {/* Table Title Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center select-none bg-white">
          <h3 className="font-extrabold text-sm text-slate-800">Master Inventory Tracking</h3>
          <button 
            onClick={exportCsv}
            className="flex items-center gap-1 text-[10px] font-bold text-[#2D6A24] hover:text-[#23531B] transition-colors"
          >
            Export CSV <Download className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
              <p className="font-bold text-sm">No inventory items found</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={() => toggleSelectAll(filteredItems.map(i => i.sku))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                    />
                  </th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Stock Qty</th>
                  <th className="p-4">UoM</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {filteredItems.map((item) => {
                  const isSelected = selectedSkus.includes(item.sku);
                  const isLowStock = item.status === 'Active' && item.stockQty <= item.minQty;
                  
                  return (
                    <tr
                      key={`${item.sku}-${item.zone}`}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isSelected ? 'bg-emerald-50/20' : ''
                      } ${isLowStock ? 'bg-red-50/10' : ''}`}
                    >
                      {/* Checkbox Select */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectSku(item.sku)}
                          className="rounded border-slate-300 text-[#2D6A24] focus:ring-[#2D6A24] cursor-pointer w-4 h-4"
                        />
                      </td>

                      {/* SKU */}
                      <td className="p-4 font-bold text-slate-800">{item.sku}</td>

                      {/* Name */}
                      <td className="p-4 font-semibold text-slate-700">{item.name}</td>

                      {/* Description */}
                      <td className="p-4 text-slate-400 font-normal">{item.description}</td>

                      {/* Category */}
                      <td className="p-4 text-slate-500 font-medium">{item.category}</td>

                      {/* Stock Qty */}
                      <td className="p-4 text-right font-bold tabular-nums">
                        <div className="flex items-center justify-end gap-1">
                          {isLowStock && (
                            <span title="Below safety minimum threshold">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500 fill-red-100" />
                            </span>
                          )}
                          <span className={item.stockQty === 0 ? 'text-red-500' : 'text-slate-800'}>
                            {item.stockQty}
                          </span>
                        </div>
                      </td>

                      {/* UoM */}
                      <td className="p-4 text-slate-400 font-medium">{item.uom}</td>

                      {/* Status badge matching the rounded pill and color format */}
                      <td className="p-4 text-center">
                        {item.status === 'Active' ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#e6f4ea] text-[#137333]">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#f1f3f4] text-[#3c4043]">
                            Obsolete
                          </span>
                        )}
                      </td>

                      {/* Text Actions links (Edit | Archive) or (Edit | Delete) */}
                      <td className="p-4 text-center font-bold text-[11px] select-none">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-[#2D6A24] hover:text-[#1e4618] hover:underline"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300 font-normal">|</span>
                          {item.status === 'Active' ? (
                            <button
                              onClick={() => handleArchiveItem(item)}
                              className="text-amber-700 hover:text-amber-900 hover:underline"
                            >
                              Archive
                            </button>
                          ) : (
                            <button
                              onClick={() => deleteItem(item.sku, item.zone)}
                              className="text-red-600 hover:text-red-800 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Total counts footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between text-[11px] text-slate-500 font-bold select-none">
          <span>Showing {filteredItems.length} of {items.length} items</span>
          <div className="flex gap-3">
            <span>Active: {items.filter(i => i.status === 'Active').length}</span>
            <span>Obsolete: {items.filter(i => i.status === 'Obsolete').length}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
