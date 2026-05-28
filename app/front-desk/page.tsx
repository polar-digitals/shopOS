'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Scissors, Pencil, X } from 'lucide-react';
import { useShopData } from '@/hooks/useShopData';

export default function FrontDeskDashboard() {
  const router = useRouter();

  const {
    workers,
    services,
    sales,
    addSale,
    updateSale,
  } = useShopData();

  const [showAddSale, setShowAddSale] = useState(false);
  const [newSaleServiceName, setNewSaleServiceName] = useState('');
  const [newSaleWorkerName, setNewSaleWorkerName] = useState('');
  const [newSaleDate, setNewSaleDate] = useState('2026-05-27');

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

  const handleLogout = () => {
    document.cookie = 'shop_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/login');
  };

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    const servicePrice = services.find(s => s.name === newSaleServiceName)?.price || 50;
    addSale({
      id: `sale-${Date.now()}`,
      serviceName: newSaleServiceName,
      workerName: newSaleWorkerName,
      date: newSaleDate,
      price: servicePrice
    });
    setShowAddSale(false);
  };

  const handleStartEditSale = (sale: any) => {
    setEditingSaleId(sale.id);
    setEditSaleServiceName(sale.serviceName);
    setEditSaleWorkerName(sale.workerName);
    setEditSaleDate(sale.date);
  };

  const handleSaveSale = (id: string) => {
    const servicePrice = services.find(s => s.name === editSaleServiceName)?.price || 50;
    updateSale(id, {
      serviceName: editSaleServiceName,
      workerName: editSaleWorkerName,
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

  const totalEarned = sales.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased pt-0 px-6 pb-6 sm:pt-0 sm:px-12 sm:pb-12 md:pt-0 md:px-16 md:pb-16 flex flex-col">
      {/* Top Navbar */}
      <div className="relative z-50 max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 pb-6 mb-8 border-b border-zinc-100">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="text-xl font-black tracking-tight text-zinc-950 flex items-center gap-2">
            ShopOS <span className="text-xs font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">Front Desk</span>
          </div>
        </div>
        <nav className="flex bg-transparent items-center gap-1 border-0 mt-4 sm:mt-0">
          <button
            onClick={handleLogout}
            className="relative px-4 py-2 text-xs border border-zinc-200 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 z-10 outline-none text-zinc-600 hover:text-black hover:bg-zinc-50 font-medium"
          >
            Logout
          </button>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 pb-5">
            <div>
              <h3 className="text-2xl font-black text-black flex items-center gap-2">
                <Scissors className="w-5 h-5" />
                Catalog
              </h3>
              <p className="text-zinc-500 text-xs mt-1">
                Record services done for our customers.
              </p>
            </div>
            <button 
              onClick={() => setShowAddSale(!showAddSale)}
              className="bg-black hover:bg-zinc-800 text-white font-bold text-xs py-2 px-4 rounded transition-colors cursor-pointer flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
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
                className="bg-zinc-50 p-5 rounded-xl overflow-hidden flex flex-col gap-4 font-sans text-xs"
              >
                <div className="text-sm font-bold border-b border-zinc-200 pb-2 mb-1">Add a New Service Record</div>
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
                <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase tracking-wider bg-zinc-50/55 text-zinc-600">
                  <th className="py-3 px-4">Service Done</th>
                  <th className="py-3 px-4">Worker Assigned</th>
                  <th className="py-3 px-4 font-mono">Date</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-center">Actions</th>
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
                          <td className="py-2 px-4">
                            <select 
                              value={editSaleServiceName}
                              onChange={(e) => setEditSaleServiceName(e.target.value)}
                              className="w-full bg-white border border-zinc-200 rounded px-2 py-1.5 text-xs outline-none focus:border-black text-black"
                            >
                              {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </select>
                          </td>
                          <td className="py-2 px-4">
                            <select 
                              value={editSaleWorkerName}
                              onChange={(e) => setEditSaleWorkerName(e.target.value)}
                              className="w-full bg-white border border-zinc-200 rounded px-2 py-1.5 text-xs outline-none focus:border-black text-black"
                            >
                              {workers.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                            </select>
                          </td>
                          <td className="py-2 px-4">
                            <input 
                              type="date" 
                              value={editSaleDate} 
                              onChange={(e) => setEditSaleDate(e.target.value)}
                              className="w-full bg-white border border-zinc-200 rounded px-2 py-1.5 text-xs outline-none focus:border-black text-black font-mono"
                            />
                          </td>
                          <td className="py-2 px-4 text-right text-zinc-400 italic">Auto-calculated</td>
                          <td className="py-2 px-4 text-center">
                            <div className="flex gap-1 justify-center">
                              <button onClick={() => setEditingSaleId(null)} className="px-2 py-1 bg-zinc-200 hover:bg-zinc-300 rounded text-black font-bold">Cancel</button>
                              <button onClick={() => handleSaveSale(item.id)} className="px-2 py-1 bg-black hover:bg-zinc-800 rounded text-white font-bold">Save</button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={item.id} className="hover:bg-zinc-50 transition-colors text-black">
                        <td className="py-3.5 px-4 font-semibold">{item.serviceName}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-[9px] font-bold text-black font-mono">
                              {getInitials(item.workerName)}
                            </span>
                            {item.workerName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 font-mono">{item.date}</td>
                        <td className="py-3.5 px-4 text-right font-bold font-mono text-emerald-600">+Br {item.price}</td>
                        <td className="py-3.5 px-4 text-center">
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
              Total Revenue: <strong className="font-bold text-emerald-600">Br {totalEarned}</strong>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
