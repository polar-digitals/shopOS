'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Scissors, Pencil, X, LogOut } from 'lucide-react';
import { useShopData, type Sale } from '@/hooks/useShopData';
import { createClient } from '@/lib/supabaseClient';

export default function FrontDeskDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const {
    workers,
    services,
    sales,
    isLoading,
    addSale,
    updateSale,
    totalIncome,
    today,
  } = useShopData();

  const [showAddSale, setShowAddSale] = useState(false);
  const [newSaleServiceName, setNewSaleServiceName] = useState('');
  const [newSaleWorkerName, setNewSaleWorkerName] = useState('');
  const [newSaleDate, setNewSaleDate] = useState(today);

  // Editing state for sales
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [editSaleServiceName, setEditSaleServiceName] = useState('');
  const [editSaleWorkerName, setEditSaleWorkerName] = useState('');
  const [editSaleDate, setEditSaleDate] = useState('');

  // Update dropdown defaults once services/workers load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (services.length > 0 && !newSaleServiceName) {
        setNewSaleServiceName(services[0].name);
      }
      if (workers.length > 0 && !newSaleWorkerName) {
        setNewSaleWorkerName(workers[0].name);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [services, workers, newSaleServiceName, newSaleWorkerName]);

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const servicePrice = services.find(s => s.name === newSaleServiceName)?.price || 50;
    await addSale({
      service_name: newSaleServiceName,
      worker_name: newSaleWorkerName,
      worker_id: null,
      date: newSaleDate,
      price: servicePrice
    });
    setShowAddSale(false);
  };

  const handleStartEditSale = (sale: Sale) => {
    setEditingSaleId(sale.id);
    setEditSaleServiceName(sale.service_name);
    setEditSaleWorkerName(sale.worker_name);
    setEditSaleDate(sale.date);
  };

  const handleSaveSale = async (id: string) => {
    const servicePrice = services.find(s => s.name === editSaleServiceName)?.price || 50;
    await updateSale(id, {
      service_name: editSaleServiceName,
      worker_name: editSaleWorkerName,
      date: editSaleDate,
      price: servicePrice
    });
    setEditingSaleId(null);
  };

  // Helper to extract initials
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-black font-sans flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="text-xl font-black tracking-tight text-zinc-950">ShopOS</div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-zinc-400 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <p className="text-xs text-zinc-500 font-mono">Loading front desk...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased pt-0 px-4 pb-4 sm:pt-0 sm:px-12 sm:pb-12 md:pt-0 md:px-16 md:pb-16 flex flex-col">
      {/* Top Navbar */}
      <div className="relative z-50 max-w-7xl mx-auto w-full flex flex-row items-center justify-between pt-4 pb-4 mb-4 sm:pt-6 sm:pb-6 sm:mb-8 border-b border-zinc-100">
        <div className="flex items-center justify-start w-auto">
          <div className="text-lg sm:text-xl font-black tracking-tight text-zinc-950 flex items-center gap-2">
            ShopOS <span className="text-[10px] sm:text-xs font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">Front Desk</span>
          </div>
        </div>
        <div className="flex items-center justify-end w-auto">
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-zinc-500 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 border-b border-zinc-100 pb-3 sm:pb-5">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-black flex items-center gap-1.5 sm:gap-2">
                <Scissors className="w-4 h-4 sm:w-5 sm:h-5" />
                Catalog
              </h3>
              <p className="text-zinc-500 text-[10px] sm:text-xs mt-1">
                Record services done for our customers.
              </p>
            </div>
            <button 
              onClick={() => setShowAddSale(!showAddSale)}
              className="bg-black hover:bg-zinc-800 text-white font-bold text-[10px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4 rounded transition-colors cursor-pointer flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
            >
              {showAddSale ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showAddSale ? 'Close Form' : 'Log a Sale'}
            </button>
          </div>

          {/* Expandable Add Sale Form */}
          <AnimatePresence>
            {showAddSale && (
              <motion.form 
                id="add-sale-form"
                onSubmit={handleAddSale}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-zinc-50 p-4 sm:p-5 rounded-xl overflow-hidden flex flex-col gap-3 sm:gap-4 font-sans text-xs"
              >
                <div className="text-xs sm:text-sm font-bold border-b border-zinc-200 pb-2 mb-1">Add a New Service Record</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase text-[10px] font-bold text-zinc-600 mb-1">Which service was done?</label>
                    <select 
                      value={newSaleServiceName}
                      onChange={(e) => setNewSaleServiceName(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs outline-none focus:border-black text-black cursor-pointer"
                    >
                      {services.map(s => (
                        <option key={s.id} value={s.name}>{s.name} (Br {s.price})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block uppercase text-[10px] font-bold text-zinc-600 mb-1">Who did the job?</label>
                    <select 
                      value={newSaleWorkerName}
                      onChange={(e) => setNewSaleWorkerName(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs outline-none focus:border-black text-black cursor-pointer"
                    >
                      {workers.map(w => (
                        <option key={w.id} value={w.name}>{w.name} ({w.role})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block uppercase text-[10px] font-bold text-zinc-600 mb-1">When did they do it?</label>
                  <input 
                    type="date" 
                    value={newSaleDate} 
                    onChange={(e) => setNewSaleDate(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs outline-none focus:border-black text-black font-mono"
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end mt-1">
                  <button 
                    type="button" 
                    onClick={() => setShowAddSale(false)} 
                    className="bg-white border border-zinc-300 hover:bg-zinc-100 text-black py-1.5 px-3 rounded font-bold text-[10px] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-black hover:bg-zinc-800 text-white py-1.5 px-3 rounded font-bold text-[10px] transition-colors cursor-pointer"
                  >
                    Add Sale to Log
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Sales List Table */}
          <div className="overflow-x-auto bg-zinc-50/20 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-zinc-50/55 text-zinc-600">
                  <th className="py-2 px-2 sm:py-3 sm:px-4">Service Done</th>
                  <th className="py-2 px-2 sm:py-3 sm:px-4">Worker Assigned</th>
                  <th className="py-2 px-2 sm:py-3 sm:px-4 font-mono hidden sm:table-cell">Date</th>
                  <th className="py-2 px-2 sm:py-3 sm:px-4 text-right">Price</th>
                  <th className="py-2 px-2 sm:py-3 sm:px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-400 font-mono">
                      No sales recorded yet. Use the button to log a sale!
                    </td>
                  </tr>
                ) : (
                  sales.map((item) => {
                    const isEditing = editingSaleId === item.id;
                    
                    if (isEditing) {
                      return (
                        <tr key={item.id} className="bg-zinc-50">
                          <td className="py-2.5 px-2 sm:px-4" colSpan={5}>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <div className="flex-1">
                                <label className="text-[9px] uppercase font-bold text-zinc-400 mb-0.5 block">Service</label>
                                <select 
                                  value={editSaleServiceName}
                                  onChange={(e) => setEditSaleServiceName(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-black text-black"
                                >
                                  {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                </select>
                              </div>
                              <div className="flex-1">
                                <label className="text-[9px] uppercase font-bold text-zinc-400 mb-0.5 block">Worker</label>
                                <select 
                                  value={editSaleWorkerName}
                                  onChange={(e) => setEditSaleWorkerName(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-black text-black"
                                >
                                  {workers.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                                </select>
                              </div>
                              <div className="flex-1">
                                <label className="text-[9px] uppercase font-bold text-zinc-400 mb-0.5 block">Date</label>
                                <input 
                                  type="date" 
                                  value={editSaleDate} 
                                  onChange={(e) => setEditSaleDate(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-black text-black font-mono"
                                />
                              </div>
                              <div className="flex items-end justify-end gap-2 mt-2 sm:mt-0">
                                <button onClick={() => setEditingSaleId(null)} className="px-2.5 py-2 sm:py-1.5 bg-zinc-200 hover:bg-zinc-300 rounded text-[10px] text-black font-bold cursor-pointer">Cancel</button>
                                <button onClick={() => handleSaveSale(item.id)} className="px-2.5 py-2 sm:py-1.5 bg-black hover:bg-zinc-800 rounded text-[10px] text-white font-bold cursor-pointer">Save</button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={item.id} className="hover:bg-zinc-50 transition-colors text-black text-[10px] sm:text-xs">
                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 font-semibold">{item.service_name}</td>
                        <td className="py-2 px-2 sm:py-3.5 sm:px-4">
                          <span className="truncate max-w-[80px] sm:max-w-[none] block">{item.worker_name}</span>
                        </td>
                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-zinc-600 font-mono hidden sm:table-cell">{item.date}</td>
                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-right font-bold font-mono text-emerald-600">+Br {item.price}</td>
                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-center">
                          <button 
                            onClick={() => handleStartEditSale(item)}
                            className="text-zinc-400 hover:text-black transition-colors p-1 cursor-pointer"
                            title="Edit this sale"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-zinc-500 font-mono flex justify-between items-center border-t border-zinc-100 pt-4">
            <span>Showing {sales.length} logs in history</span>
            <span className="font-sans text-xs text-black">
              Total Revenue: <strong className="font-bold text-emerald-600">Br {totalIncome}</strong>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
