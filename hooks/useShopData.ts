import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabaseClient';

export interface Worker {
  id: string;
  name: string;
  role: string;
  is_at_work: boolean;
}

export interface ShopService {
  id: string;
  name: string;
  price: number;
  duration_min: number;
}

export interface Sale {
  id: string;
  service_name: string;
  worker_name: string;
  worker_id: string | null;
  date: string;
  price: number;
}

export interface Expense {
  id: string;
  item: string;
  amount: number;
  date: string;
  category: string;
}

export interface StaffPerformance {
  workerId: string;
  workerName: string;
  todayCustomers: number;
  todayRevenue: number;
}

const supabase = createClient();

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function useShopData() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [services, setServices] = useState<ShopService[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch all data from Supabase ──
  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [workersRes, servicesRes, salesRes, expensesRes] = await Promise.all([
        supabase.from('workers').select('*').order('created_at', { ascending: true }),
        supabase.from('services').select('*').order('created_at', { ascending: true }),
        supabase.from('sales').select('*').order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').order('created_at', { ascending: false }),
      ]);

      if (workersRes.data) setWorkers(workersRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (salesRes.data) setSales(salesRes.data);
      if (expensesRes.data) setExpenses(expensesRes.data);
    } catch (err) {
      console.error('Error fetching shop data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── SALES CRUD ──
  const addSale = async (sale: Omit<Sale, 'id'>) => {
    // Resolve worker_id from worker name
    const worker = workers.find(w => w.name === sale.worker_name);
    const { data, error } = await supabase
      .from('sales')
      .insert({
        service_name: sale.service_name,
        worker_name: sale.worker_name,
        worker_id: worker?.id || null,
        date: sale.date,
        price: sale.price,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding sale:', error);
      return;
    }
    if (data) setSales(prev => [data, ...prev]);
  };

  const updateSale = async (id: string, updates: Partial<Sale>) => {
    const payload: Record<string, unknown> = {};
    if (updates.service_name !== undefined) payload.service_name = updates.service_name;
    if (updates.worker_name !== undefined) {
      payload.worker_name = updates.worker_name;
      const worker = workers.find(w => w.name === updates.worker_name);
      payload.worker_id = worker?.id || null;
    }
    if (updates.date !== undefined) payload.date = updates.date;
    if (updates.price !== undefined) payload.price = updates.price;

    const { data, error } = await supabase
      .from('sales')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating sale:', error);
      return;
    }
    if (data) setSales(prev => prev.map(s => s.id === id ? data : s));
  };

  const deleteSale = async (id: string) => {
    const { error } = await supabase.from('sales').delete().eq('id', id);
    if (error) {
      console.error('Error deleting sale:', error);
      return;
    }
    setSales(prev => prev.filter(s => s.id !== id));
  };

  // ── EXPENSES CRUD ──
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        item: expense.item,
        amount: expense.amount,
        date: expense.date,
        category: expense.category,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      return;
    }
    if (data) setExpenses(prev => [data, ...prev]);
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      console.error('Error deleting expense:', error);
      return;
    }
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // ── WORKERS CRUD ──
  const addWorker = async (worker: Omit<Worker, 'id'>) => {
    const { data, error } = await supabase
      .from('workers')
      .insert({
        name: worker.name,
        role: worker.role,
        is_at_work: worker.is_at_work,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding worker:', error);
      return;
    }
    if (data) setWorkers(prev => [...prev, data]);
  };

  const updateWorker = async (id: string, updates: Partial<Worker>) => {
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.is_at_work !== undefined) payload.is_at_work = updates.is_at_work;

    const { data, error } = await supabase
      .from('workers')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating worker:', error);
      return;
    }
    if (data) setWorkers(prev => prev.map(w => w.id === id ? data : w));
  };

  const deleteWorker = async (id: string) => {
    const { error } = await supabase.from('workers').delete().eq('id', id);
    if (error) {
      console.error('Error deleting worker:', error);
      return;
    }
    setWorkers(prev => prev.filter(w => w.id !== id));
  };

  // ── SERVICES CRUD ──
  const addService = async (service: Omit<ShopService, 'id'>) => {
    const { data, error } = await supabase
      .from('services')
      .insert({
        name: service.name,
        price: service.price,
        duration_min: service.duration_min,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding service:', error);
      return;
    }
    if (data) setServices(prev => [...prev, data]);
  };

  const updateService = async (id: string, updates: Partial<ShopService>) => {
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.duration_min !== undefined) payload.duration_min = updates.duration_min;

    const { data, error } = await supabase
      .from('services')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating service:', error);
      return;
    }
    if (data) setServices(prev => prev.map(s => s.id === id ? data : s));
  };

  const deleteService = async (id: string) => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) {
      console.error('Error deleting service:', error);
      return;
    }
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // ── COMPUTED VALUES (Financial Sync) ──
  const today = getTodayStr();

  const totalIncome = sales.reduce((sum, s) => sum + Number(s.price), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalProfit = totalIncome - totalExpenses;

  // Daily visits = actual count of sales logged today
  const dailyCustomerCount = sales.filter(s => s.date === today).length;

  // Staff performance: per-worker daily customers & revenue
  const staffPerformance: StaffPerformance[] = workers.map(worker => {
    const workerSalesToday = sales.filter(
      s => s.worker_name === worker.name && s.date === today
    );
    return {
      workerId: worker.id,
      workerName: worker.name,
      todayCustomers: workerSalesToday.length,
      todayRevenue: workerSalesToday.reduce((sum, s) => sum + Number(s.price), 0),
    };
  });

  return {
    // Data
    workers,
    services,
    sales,
    expenses,
    isLoading,

    // CRUD
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

    // Computed
    totalIncome,
    totalExpenses,
    totalProfit,
    dailyCustomerCount,
    staffPerformance,
    today,

    // Refresh
    refetch: fetchAll,
  };
}
