'use client';

import React, { useState, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Plus, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Scissors, 
  CreditCard,
  Check,
  UserCheck,
  Home,
  Pencil,
  Menu,
  X,
  BarChart3
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useShopData } from '@/hooks/useShopData';
import { createClient } from '@/lib/supabaseClient';

export default function ShopOSDashboard() {
  const router = useRouter();
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'overview' | 'catalog' | 'expenses' | 'staff' | 'services'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Use shared state hook
  const {
    workers,
    services,
    sales,
    expenses,
    isLoading,
    addSale,
    updateSale,
    deleteSale,
    addExpense,
    deleteExpense,
    addWorker,
    updateWorker,
    deleteWorker,
    addService,
    updateService,
    deleteService,
    totalIncome,
    totalExpenses: totalSpent,
    totalProfit,
    dailyCustomerCount,
    staffPerformance,
    today,
  } = useShopData();

  // Form states to add new items (collapsible panels/simple toggles)
  const [showAddSale, setShowAddSale] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showAddService, setShowAddService] = useState(false);

  // Form input values
  const [newSaleServiceName, setNewSaleServiceName] = useState('');
  const [newSaleWorkerName, setNewSaleWorkerName] = useState('');
  const [newSaleDate, setNewSaleDate] = useState(today);

  const [newExpenseItem, setNewExpenseItem] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('Supplies');
  const [newExpenseDate, setNewExpenseDate] = useState(today);

  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState('');
  const [newWorkerIsAtWork, setNewWorkerIsAtWork] = useState(true);

  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('');

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

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Add Sale
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

  // Add Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseItem.trim() || !newExpenseAmount) return;
    await addExpense({
      item: newExpenseItem,
      amount: parseFloat(newExpenseAmount) || 0,
      date: newExpenseDate,
      category: newExpenseCategory
    });
    setNewExpenseItem('');
    setNewExpenseAmount('');
    setShowAddExpense(false);
  };

  // Add Worker
  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim() || !newWorkerRole.trim()) return;
    await addWorker({
      name: newWorkerName,
      role: newWorkerRole,
      is_at_work: newWorkerIsAtWork
    });
    setNewWorkerName('');
    setNewWorkerRole('');
    setShowAddWorker(false);
  };

  // Add Service
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServicePrice || !newServiceDuration) return;
    await addService({
      name: newServiceName,
      price: parseFloat(newServicePrice) || 0,
      duration_min: parseInt(newServiceDuration) || 0
    });
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDuration('');
    setShowAddService(false);
  };

  // Delete helpers
  const handleDeleteSale = (id: string) => {
    deleteSale(id);
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
  };

  const handleDeleteWorker = (id: string) => {
    deleteWorker(id);
  };

  const handleDeleteService = (id: string) => {
    deleteService(id);
  };

  const toggleWorkerStatus = (id: string) => {
    const worker = workers.find(w => w.id === id);
    if (worker) {
      updateWorker(id, { is_at_work: !worker.is_at_work });
    }
  };

  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [editWorkerName, setEditWorkerName] = useState('');
  const [editWorkerRole, setEditWorkerRole] = useState('');

  const handleStartEditWorker = (worker: Worker) => {
    setEditingWorkerId(worker.id);
    setEditWorkerName(worker.name);
    setEditWorkerRole(worker.role);
  };

  const handleSaveWorker = (id: string) => {
    if (!editWorkerName.trim() || !editWorkerRole.trim()) return;
    updateWorker(id, { name: editWorkerName, role: editWorkerRole });
    setEditingWorkerId(null);
  };

  // Service editing states
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editServiceName, setEditServiceName] = useState('');
  const [editServicePrice, setEditServicePrice] = useState('');
  const [editServiceDuration, setEditServiceDuration] = useState('');

  const handleStartEditService = (service: ShopService) => {
    setEditingServiceId(service.id);
    setEditServiceName(service.name);
    setEditServicePrice(service.price.toString());
    setEditServiceDuration(service.duration_min.toString());
  };

  const handleSaveService = (id: string) => {
    if (!editServiceName.trim() || !editServicePrice || !editServiceDuration) return;
    updateService(id, {
      name: editServiceName,
      price: parseFloat(editServicePrice) || 0,
      duration_min: parseInt(editServiceDuration) || 0
    });
    setEditingServiceId(null);
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

  // Worker/Service type aliases for local use
  type Worker = { id: string; name: string; role: string; is_at_work: boolean };
  type ShopService = { id: string; name: string; price: number; duration_min: number };

  // Tabs structure definition
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'catalog', label: 'Catalog', icon: <Check className="w-3.5 h-3.5" /> },
    { id: 'expenses', label: 'Expenses', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'staff', label: 'Staff', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'services', label: 'Services', icon: <Scissors className="w-3.5 h-3.5" /> },
  ];

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
          <p className="text-xs text-zinc-500 font-mono">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased pt-0 px-6 pb-6 sm:pt-0 sm:px-12 sm:pb-12 md:pt-0 md:px-16 md:pb-16 flex flex-col">
      
      {/* Top Transparent Navbar with ShopOS brand built-in */}
      <div className="relative z-50 max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 pb-6 mb-8 border-b border-zinc-100">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="text-xl font-black tracking-tight text-zinc-950">
            ShopOS
          </div>
          {/* Hamburger Menu Icon for Mobile Only */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex sm:hidden items-center justify-center w-11 h-11 border border-zinc-200 rounded-full text-zinc-650 hover:text-black hover:bg-zinc-50 transition-all outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Desktop Navbar (hidden on mobile, flex on tablet/desktop) */}
        <nav className="hidden sm:flex bg-transparent items-center gap-1 border-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                id={`tab-btn-${tab.id}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-4 py-2 text-xs border-0 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 z-10 outline-none ${
                  isActive 
                    ? 'text-zinc-950 font-black' 
                    : 'text-zinc-500 hover:text-zinc-950 font-medium'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="ml-2 relative px-4 py-2 text-xs border border-zinc-200 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 z-10 outline-none text-zinc-600 hover:text-black hover:bg-zinc-50 font-medium"
          >
            Logout
          </button>
        </nav>

        {/* Mobile Dropdown Navbar Menu (only below sm) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full sm:hidden flex flex-col gap-1 mt-4 pt-4 border-t border-zinc-100 overflow-hidden"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    id={`mobile-tab-btn-${tab.id}`}
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-5 py-3 text-sm flex items-center gap-3 transition-all duration-200 cursor-pointer outline-none rounded-xl ${
                      isActive 
                        ? 'text-zinc-950 font-black' 
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950 font-medium'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full px-5 py-3 text-sm flex items-center gap-3 transition-all duration-200 cursor-pointer outline-none rounded-xl text-zinc-500 hover:bg-zinc-50 hover:text-red-600 font-medium mt-2 border-t border-zinc-100"
              >
                <span>Logout</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Container with Page View Transitions */}
      <div className="max-w-7xl mx-auto w-full flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full"
          >
            {/* -------------------- OVERVIEW TAB -------------------- */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-12">
                {/* 2. Top Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Monthly Revenue KPI */}
                  <div className="p-6 rounded-2xl bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-100 transition-all duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-black text-zinc-800 uppercase tracking-widest">Monthly Revenue</span>
                      <div className="p-1.5 rounded bg-emerald-50 text-emerald-700">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-2 font-mono">Br {totalIncome.toLocaleString()}</h2>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">
                      Income earned from services sales this month.
                    </p>
                  </div>

                  {/* Monthly Expense KPI */}
                  <div className="p-6 rounded-2xl bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-100 transition-all duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-black text-zinc-800 uppercase tracking-widest">Monthly Expense</span>
                      <div className="p-1.5 rounded bg-red-50 text-red-700">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-2 font-mono">Br {totalSpent.toLocaleString()}</h2>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">
                      Spent on shop supplies, utilities and overhead.
                    </p>
                  </div>

                  {/* Profit Kept KPI */}
                  <div className="p-6 rounded-2xl bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-100 transition-all duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-black text-zinc-800 uppercase tracking-widest">True Profit</span>
                      <div className={`p-1.5 rounded ${totalProfit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <h2 className={`text-3xl font-black tracking-tight mb-2 font-mono ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      Br {totalProfit >= 0 ? '' : '-'}{Math.abs(totalProfit).toLocaleString()}
                    </h2>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">
                      Take-home margin after subtracting expenses.
                    </p>
                  </div>

                  {/* Daily Visits KPI */}
                  <div className="p-6 rounded-2xl bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-100 transition-all duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-black text-zinc-800 uppercase tracking-widest">Daily Visits</span>
                      <div className="p-1.5 rounded bg-zinc-100 text-zinc-800">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-2 font-mono">
                      {dailyCustomerCount}
                    </h2>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">
                      Customers served by your staff today.
                    </p>
                  </div>

                </div>

                {/* Dashboard Split Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Recent Service Records */}
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                      <h3 className="font-bold text-sm tracking-tight uppercase text-zinc-500">Recent Service Records</h3>
                      <button 
                        onClick={() => setActiveTab('catalog')} 
                        className="text-xs font-bold text-black hover:underline cursor-pointer"
                      >
                        View Catalog →
                      </button>
                    </div>
                    <div className="overflow-x-auto bg-zinc-50/40 rounded-xl border border-zinc-100">
                      <table className="w-full text-left text-xs border-collapse">
                        <tbody className="divide-y divide-zinc-100">
                          {sales.slice(0, 5).map((item) => (
                            <tr key={item.id} className="text-zinc-800 hover:bg-zinc-50 transition-colors">
                              <td className="py-3 px-4 font-semibold text-black">{item.service_name}</td>
                              <td className="py-3 px-4 text-zinc-500">{item.worker_name}</td>
                              <td className="py-3 px-4 text-right font-bold text-emerald-600">+Br {item.price}</td>
                            </tr>
                          ))}
                          {sales.length === 0 && (
                            <tr>
                              <td className="py-6 text-center text-zinc-400 font-mono text-xs">No records available.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent Shop Expenses */}
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                      <h3 className="font-bold text-sm tracking-tight uppercase text-zinc-500">Recent Shop Expenses</h3>
                      <button 
                        onClick={() => setActiveTab('expenses')} 
                        className="text-xs font-bold text-black hover:underline cursor-pointer"
                      >
                        View Expenses →
                      </button>
                    </div>
                    <div className="overflow-x-auto bg-zinc-50/40 rounded-xl border border-zinc-100">
                      <table className="w-full text-left text-xs border-collapse">
                        <tbody className="divide-y divide-zinc-100">
                          {expenses.slice(0, 5).map((item) => (
                            <tr key={item.id} className="text-zinc-800 hover:bg-zinc-50 transition-colors">
                              <td className="py-3 px-4 font-semibold text-black">{item.item}</td>
                              <td className="py-3 px-4">
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-zinc-100 text-zinc-650 rounded">
                                  {item.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-red-500">-Br {item.amount}</td>
                            </tr>
                          ))}
                          {expenses.length === 0 && (
                            <tr>
                              <td className="py-6 text-center text-zinc-400 font-mono text-xs">No overhead logged.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* -------------------- CATALOG TAB -------------------- */}
            {activeTab === 'catalog' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 pb-5">
                  <div>
                    <h3 className="text-2xl font-black text-black flex items-center gap-2">
                      <Scissors className="w-5 h-5" />
                      Catalog
                    </h3>
                    <p className="text-zinc-500 text-xs mt-1">
                      This is a record of all services done for our customers.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowAddSale(!showAddSale)}
                    className="bg-black hover:bg-zinc-800 text-white font-bold text-xs py-2 px-4 rounded transition-colors cursor-pointer flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
                  >
                    <Plus className="w-4 h-4" />
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
                        <th className="py-3 px-4 text-center">Remove</th>
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
                        sales.map((item) => (
                          <tr key={item.id} className="hover:bg-zinc-50 transition-colors text-black">
                            <td className="py-3.5 px-4 font-semibold">{item.service_name}</td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full border border-zinc-200 bg-white flex items-center justify-center text-[9px] font-bold text-black font-mono">
                                  {getInitials(item.worker_name)}
                                </span>
                                {item.worker_name}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-zinc-600 font-mono">{item.date}</td>
                            <td className="py-3.5 px-4 text-right font-bold font-mono text-emerald-600">+Br {item.price}</td>
                            <td className="py-3.5 px-4 text-center">
                              <button 
                                onClick={() => handleDeleteSale(item.id)}
                                className="text-zinc-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                                title="Delete this sale"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
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
              </div>
            )}

            {/* -------------------- EXPENSES TAB -------------------- */}
            {activeTab === 'expenses' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 pb-5">
                  <div>
                    <h3 className="text-2xl font-black text-black flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Expenses
                    </h3>
                    <p className="text-zinc-500 text-xs mt-1">
                      A simple list of things you bought or paid for this month.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowAddExpense(!showAddExpense)}
                    className="bg-black hover:bg-zinc-800 text-white font-bold text-xs py-2 px-4 rounded transition-colors cursor-pointer flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    {showAddExpense ? 'Close Form' : 'Write an Expense'}
                  </button>
                </div>

                {/* Expandable Add Expense Form */}
                <AnimatePresence>
                  {showAddExpense && (
                    <motion.form 
                      id="add-expense-form"
                      onSubmit={handleAddExpense}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-zinc-50 p-5 rounded-xl overflow-hidden flex flex-col gap-4 font-sans text-xs"
                    >
                      <div className="text-sm font-bold border-b border-zinc-200 pb-2 mb-1">Write Down an Expense</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-zinc-600 mb-1">What did you buy?</label>
                          <input 
                            type="text" 
                            value={newExpenseItem} 
                            onChange={(e) => setNewExpenseItem(e.target.value)}
                            placeholder="e.g. Shampoo tubs, Electricity bill"
                            className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs outline-none focus:border-black text-black"
                            required
                          />
                        </div>
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-zinc-600 mb-1">How much did it cost? (Birr)</label>
                          <input 
                            type="number" 
                            value={newExpenseAmount} 
                            onChange={(e) => setNewExpenseAmount(e.target.value)}
                            placeholder="e.g. 120"
                            className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs outline-none focus:border-black text-black font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-zinc-600 mb-1">Category</label>
                          <select 
                            value={newExpenseCategory}
                            onChange={(e) => setNewExpenseCategory(e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs outline-none focus:border-black text-black cursor-pointer"
                          >
                            <option value="Supplies">Supplies</option>
                            <option value="Bills">Bills</option>
                            <option value="Equipment">Equipment</option>
                            <option value="Rent">Rent</option>
                          </select>
                        </div>
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-zinc-600 mb-1">Purchase Date</label>
                          <input 
                            type="date" 
                            value={newExpenseDate} 
                            onChange={(e) => setNewExpenseDate(e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs outline-none focus:border-black text-black font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end mt-1">
                        <button 
                          type="button" 
                          onClick={() => setShowAddExpense(false)} 
                          className="bg-white border border-zinc-300 hover:bg-zinc-100 text-black py-1.5 px-3 rounded font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="bg-black hover:bg-zinc-800 text-white py-1.5 px-3 rounded font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Add Expense to Log
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Expense List Table */}
                <div className="overflow-x-auto bg-zinc-50/20 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase tracking-wider bg-zinc-50/55 text-zinc-600">
                        <th className="py-3 px-4">What was bought</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4 font-mono">Date</th>
                        <th className="py-3 px-4 text-right">Cost</th>
                        <th className="py-3 px-4 text-center">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {expenses.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-zinc-400 font-mono">
                            No expenses logged yet. Use the button to log expenses!
                          </td>
                        </tr>
                      ) : (
                        expenses.map((exp) => (
                          <tr key={exp.id} className="hover:bg-zinc-50 transition-colors text-black">
                            <td className="py-3.5 px-4 font-semibold">{exp.item}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-0.5 bg-zinc-100 border border-zinc-200 rounded text-[9px] font-mono">
                                {exp.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-zinc-600 font-mono">{exp.date}</td>
                            <td className="py-3.5 px-4 text-right font-bold font-mono text-red-600">-Br {exp.amount}</td>
                            <td className="py-3.5 px-4 text-center">
                              <button 
                                onClick={() => handleDeleteExpense(exp.id)}
                                className="text-zinc-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                                title="Delete this expense"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="text-[11px] text-zinc-500 font-mono flex justify-between items-center border-t border-zinc-100 pt-4">
                  <span>Showing {expenses.length} shop costs</span>
                  <span className="font-sans text-xs text-black">
                    Total Expenses: <strong className="font-bold text-red-600">-Br {totalSpent}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* -------------------- STAFF TAB (formerly Team) -------------------- */}
            {activeTab === 'staff' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 pb-5">
                  <div>
                    <h3 className="text-2xl font-black text-black flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Staff
                    </h3>
                    <p className="text-zinc-500 text-xs mt-1">
                      Track who is working and their daily performance.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowAddWorker(!showAddWorker)}
                    className="bg-black hover:bg-zinc-800 text-white font-bold text-[10px] py-1.5 px-3 rounded transition-colors cursor-pointer self-stretch sm:self-auto text-center"
                  >
                    {showAddWorker ? 'Cancel' : 'Add Staff Member'}
                  </button>
                </div>

                {/* Expandable Add Worker Form */}
                <AnimatePresence>
                  {showAddWorker && (
                    <motion.form 
                      id="add-worker-form"
                      onSubmit={handleAddWorker}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-zinc-50 p-5 rounded-xl overflow-hidden flex flex-col gap-4 font-sans text-xs"
                    >
                      <div className="text-xs font-bold border-b border-zinc-200 pb-2 mb-1">Add a New Staff Member</div>
                      <div>
                        <label className="block uppercase text-[10px] font-bold text-zinc-600 mb-1">Staff Name</label>
                        <input 
                          type="text" 
                          value={newWorkerName} 
                          onChange={(e) => setNewWorkerName(e.target.value)}
                          placeholder="e.g. Sarah Jenkins"
                          className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs outline-none focus:border-black text-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block uppercase text-[10px] font-bold text-zinc-600 mb-1">Role / Job Title</label>
                        <input 
                          type="text" 
                          value={newWorkerRole} 
                          onChange={(e) => setNewWorkerRole(e.target.value)}
                          placeholder="e.g. Hair Stylist, Nail Specialist"
                          className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs outline-none focus:border-black text-black"
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="isAtWorkCheckbox" 
                          checked={newWorkerIsAtWork} 
                          onChange={(e) => setNewWorkerIsAtWork(e.target.checked)}
                          className="cursor-pointer"
                        />
                        <label htmlFor="isAtWorkCheckbox" className="text-xs text-zinc-700 cursor-pointer select-none">
                          Are they working right now?
                        </label>
                      </div>

                      <div className="flex gap-2 justify-end mt-1">
                        <button 
                          type="button" 
                          onClick={() => setShowAddWorker(false)} 
                          className="bg-white border border-zinc-300 text-black py-1.5 px-3 rounded font-bold text-[10px] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="bg-black text-white py-1.5 px-3 rounded font-bold text-[10px] cursor-pointer"
                        >
                          Add Staff Member
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Staff Table — one row per staff member with performance */}
                <div className="overflow-x-auto bg-zinc-50/20 rounded-xl border border-zinc-100">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase tracking-wider bg-zinc-50/55 text-zinc-600">
                        <th className="py-3 px-4">Staff Member</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            Today&apos;s Customers
                          </span>
                        </th>
                        <th className="py-3 px-4 text-right">Today&apos;s Revenue</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {workers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-zinc-400 font-mono">
                            No staff members yet. Add your first team member!
                          </td>
                        </tr>
                      ) : (
                        workers.map((worker) => {
                          const isEditing = editingWorkerId === worker.id;
                          const perf = staffPerformance.find(p => p.workerId === worker.id);

                          if (isEditing) {
                            return (
                              <tr key={worker.id} className="bg-zinc-50">
                                <td className="py-2.5 px-4" colSpan={2}>
                                  <div className="flex flex-col gap-2">
                                    <div>
                                      <label className="text-[9px] uppercase font-bold text-zinc-400 mb-0.5 block">Full Name</label>
                                      <input 
                                        type="text"
                                        value={editWorkerName}
                                        onChange={(e) => setEditWorkerName(e.target.value)}
                                        className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-black text-black font-semibold"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[9px] uppercase font-bold text-zinc-400 mb-0.5 block">Role / Job Title</label>
                                      <input 
                                        type="text"
                                        value={editWorkerRole}
                                        onChange={(e) => setEditWorkerRole(e.target.value)}
                                        className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-black text-black font-semibold"
                                        required
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td colSpan={2}></td>
                                <td colSpan={2} className="py-2.5 px-4 text-right">
                                  <div className="flex gap-2 justify-end">
                                    <button 
                                      type="button" 
                                      onClick={() => setEditingWorkerId(null)}
                                      className="px-2.5 py-1 border border-zinc-300 hover:bg-zinc-100 rounded text-[9px] font-bold text-zinc-700 cursor-pointer transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={() => handleSaveWorker(worker.id)}
                                      className="px-2.5 py-1 bg-black hover:bg-zinc-800 text-white rounded text-[9px] font-bold cursor-pointer transition-colors"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={worker.id} className="hover:bg-zinc-50 transition-colors text-black">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <div className="w-8 h-8 rounded-full border border-zinc-200 bg-white flex items-center justify-center font-black text-[10px] text-black font-mono">
                                      {getInitials(worker.name)}
                                    </div>
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white rounded-full ${
                                      worker.is_at_work ? 'bg-emerald-500' : 'bg-zinc-400'
                                    }`} />
                                  </div>
                                  <span className="font-bold text-sm">{worker.name}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">{worker.role}</td>
                              <td className="py-3.5 px-4 text-center">
                                <button 
                                  onClick={() => toggleWorkerStatus(worker.id)}
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer ${
                                    worker.is_at_work 
                                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                      : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200'
                                  }`}
                                  title="Click to toggle work status"
                                >
                                  {worker.is_at_work ? 'At Work' : 'Away'}
                                </button>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 font-black text-sm text-black font-mono">
                                  {perf?.todayCustomers ?? 0}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold font-mono text-emerald-600">
                                {(perf?.todayRevenue ?? 0) > 0 ? `+Br ${perf?.todayRevenue}` : 'Br 0'}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button 
                                    onClick={() => handleStartEditWorker(worker)}
                                    className="text-zinc-400 hover:text-black transition-colors p-1 cursor-pointer"
                                    title="Edit this staff member"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteWorker(worker.id)}
                                    className="text-zinc-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                                    title="Delete this staff member"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Staff summary footer */}
                <div className="text-[11px] text-zinc-500 font-mono flex justify-between items-center border-t border-zinc-100 pt-4">
                  <span>{workers.length} staff member{workers.length !== 1 ? 's' : ''} · {workers.filter(w => w.is_at_work).length} at work</span>
                  <span className="font-sans text-xs text-black">
                    Today&apos;s Total: <strong className="font-bold text-emerald-600">{dailyCustomerCount} customer{dailyCustomerCount !== 1 ? 's' : ''}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* -------------------- SERVICES TAB -------------------- */}
            {activeTab === 'services' && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-5">
                  <div>
                    <h3 className="text-2xl font-black text-black flex items-center gap-2">
                      <Scissors className="w-5 h-5 animate-pulse" />
                      Services
                    </h3>
                    <p className="text-zinc-500 text-xs mt-1">
                      These are the choices and prices you offer to your clients.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowAddService(!showAddService)}
                    className="bg-black hover:bg-zinc-800 text-white font-bold text-[10px] py-1.5 px-3 rounded transition-colors cursor-pointer animate-pulse"
                  >
                    {showAddService ? 'Cancel' : 'Add Service'}
                  </button>
                </div>

                {/* Expandable Add Service Form */}
                <AnimatePresence>
                  {showAddService && (
                    <motion.form 
                      id="add-service-form"
                      onSubmit={handleAddService}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-zinc-50 p-5 rounded-xl overflow-hidden flex flex-col gap-4 font-sans text-xs"
                    >
                      <div className="text-xs font-bold border-b border-zinc-200 pb-2 mb-1">Add a New Service Offering</div>
                      <div>
                        <label className="block uppercase text-[10px] font-bold text-zinc-600 mb-1">Service Name</label>
                        <input 
                          type="text" 
                          value={newServiceName} 
                          onChange={(e) => setNewServiceName(e.target.value)}
                          placeholder="e.g. Beard Trim & Shave"
                          className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs outline-none focus:border-black text-black"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-zinc-600 mb-1">Price (Birr)</label>
                          <input 
                            type="number" 
                            value={newServicePrice} 
                            onChange={(e) => setNewServicePrice(e.target.value)}
                            placeholder="e.g. 55"
                            className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs outline-none focus:border-black text-black font-mono"
                            required
                          />
                        </div>
                        <div>
                          <label className="block uppercase text-[10px] font-bold text-zinc-600 mb-1">Duration (minutes)</label>
                          <input 
                            type="number" 
                            value={newServiceDuration} 
                            onChange={(e) => setNewServiceDuration(e.target.value)}
                            placeholder="e.g. 30"
                            className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs outline-none focus:border-black text-black font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end mt-1">
                        <button 
                          type="button" 
                          onClick={() => setShowAddService(false)} 
                          className="bg-white border border-zinc-300 text-black py-1.5 px-3 rounded font-bold text-[10px] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="bg-black text-white py-1.5 px-3 rounded font-bold text-[10px] cursor-pointer"
                        >
                          Add Service
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* List of Services with No Borders */}
                <div className="overflow-hidden bg-zinc-50/25 rounded-xl border border-zinc-100">
                  <div className="divide-y divide-zinc-100 bg-white text-xs text-black">
                    {services.map((srv) => {
                      const isEditing = editingServiceId === srv.id;
                      if (isEditing) {
                        return (
                          <div key={srv.id} className="p-4 bg-zinc-50/50 flex flex-col gap-3">
                            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Edit Service Option</div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="text-[9px] uppercase font-bold text-zinc-400 mb-0.5 block">Service Name</label>
                                <input 
                                  type="text"
                                  value={editServiceName}
                                  onChange={(e) => setEditServiceName(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-black text-black font-semibold"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-[9px] uppercase font-bold text-zinc-400 mb-0.5 block">Price (Birr)</label>
                                <input 
                                  type="number"
                                  value={editServicePrice}
                                  onChange={(e) => setEditServicePrice(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-black text-black font-semibold font-mono"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-[9px] uppercase font-bold text-zinc-400 mb-0.5 block">Duration (mins)</label>
                                <input 
                                  type="number"
                                  value={editServiceDuration}
                                  onChange={(e) => setEditServiceDuration(e.target.value)}
                                  className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-black text-black font-semibold font-mono"
                                  required
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-1">
                              <button 
                                type="button" 
                                onClick={() => setEditingServiceId(null)}
                                className="px-2.5 py-1 border border-zinc-300 hover:bg-zinc-100 rounded text-[9px] font-bold text-zinc-700 cursor-pointer transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleSaveService(srv.id)}
                                className="px-2.5 py-1 bg-black hover:bg-zinc-800 text-white rounded text-[9px] font-bold cursor-pointer transition-colors"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={srv.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors">
                          <div>
                            <div className="font-bold text-sm text-black">{srv.name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-1">{srv.duration_min} minutes duration</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-base text-emerald-600 mr-2">Br {srv.price}</span>
                            <button 
                              onClick={() => handleStartEditService(srv)}
                              className="text-zinc-400 hover:text-black transition-colors p-1 cursor-pointer"
                              title="Edit this service option"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteService(srv.id)}
                              className="text-zinc-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                              title="Delete this service offering"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
