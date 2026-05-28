import { useState, useEffect } from 'react';

export interface Worker {
  id: string;
  name: string;
  role: string;
  isAtWork: boolean;
}

export interface ShopService {
  id: string;
  name: string;
  price: number;
  durationMin: number;
}

export interface Sale {
  id: string;
  serviceName: string;
  workerName: string;
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

export function useShopData() {
  const [workers, setWorkers] = useState<Worker[]>([
    { id: 'worker-1', name: 'Sarah Jenkins', role: 'Hair Stylist', isAtWork: true },
    { id: 'worker-2', name: 'Michael Vance', role: 'Color Expert', isAtWork: true },
    { id: 'worker-3', name: 'Elena Rostova', role: 'Nail Artist', isAtWork: false }
  ]);

  const [services, setServices] = useState<ShopService[]>([
    { id: 'srv-1', name: 'Hair Cut & Style', price: 75, durationMin: 45 },
    { id: 'srv-2', name: 'Balayage & Coloring', price: 180, durationMin: 120 },
    { id: 'srv-3', name: 'Deep Moisture Treatment', price: 45, durationMin: 30 },
    { id: 'srv-4', name: 'Gel Manicure', price: 60, durationMin: 60 }
  ]);

  const [sales, setSales] = useState<Sale[]>([
    { id: 'sale-1', serviceName: 'Balayage & Coloring', workerName: 'Sarah Jenkins', date: '2026-05-27', price: 180 },
    { id: 'sale-2', serviceName: 'Hair Cut & Style', workerName: 'Michael Vance', date: '2026-05-27', price: 75 },
    { id: 'sale-3', serviceName: 'Gel Manicure', workerName: 'Elena Rostova', date: '2026-05-27', price: 60 }
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 'exp-1', item: 'Shampoo and Hair Dyes', amount: 410, date: '2026-05-25', category: 'Supplies' },
    { id: 'exp-2', item: 'Electricity and Power bill', amount: 320, date: '2026-05-24', category: 'Bills' },
    { id: 'exp-3', item: 'Towels and Chairs', amount: 285, date: '2026-05-20', category: 'Equipment' }
  ]);

  // Load state on start
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedWorkers = localStorage.getItem('shop_workers');
      const storedServices = localStorage.getItem('shop_services');
      const storedSales = localStorage.getItem('shop_sales');
      const storedExpenses = localStorage.getItem('shop_expenses');

      const timer = setTimeout(() => {
        if (storedWorkers) setWorkers(JSON.parse(storedWorkers));
        if (storedServices) setServices(JSON.parse(storedServices));
        if (storedSales) setSales(JSON.parse(storedSales));
        if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const saveToStorage = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const addSale = (sale: Sale) => {
    const updated = [sale, ...sales];
    setSales(updated);
    saveToStorage('shop_sales', updated);
  };

  const updateSale = (id: string, updatedSale: Partial<Sale>) => {
    const updated = sales.map(s => s.id === id ? { ...s, ...updatedSale } : s);
    setSales(updated);
    saveToStorage('shop_sales', updated);
  };

  const deleteSale = (id: string) => {
    const updated = sales.filter(s => s.id !== id);
    setSales(updated);
    saveToStorage('shop_sales', updated);
  };

  const addExpense = (expense: Expense) => {
    const updated = [expense, ...expenses];
    setExpenses(updated);
    saveToStorage('shop_expenses', updated);
  };

  const deleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    saveToStorage('shop_expenses', updated);
  };

  const addWorker = (worker: Worker) => {
    const updated = [...workers, worker];
    setWorkers(updated);
    saveToStorage('shop_workers', updated);
  };

  const updateWorker = (id: string, updatedWorker: Partial<Worker>) => {
    const updated = workers.map(w => w.id === id ? { ...w, ...updatedWorker } : w);
    setWorkers(updated);
    saveToStorage('shop_workers', updated);
  };

  const deleteWorker = (id: string) => {
    const updated = workers.filter(w => w.id !== id);
    setWorkers(updated);
    saveToStorage('shop_workers', updated);
  };

  const addService = (service: ShopService) => {
    const updated = [...services, service];
    setServices(updated);
    saveToStorage('shop_services', updated);
  };

  const updateService = (id: string, updatedService: Partial<ShopService>) => {
    const updated = services.map(s => s.id === id ? { ...s, ...updatedService } : s);
    setServices(updated);
    saveToStorage('shop_services', updated);
  };

  const deleteService = (id: string) => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    saveToStorage('shop_services', updated);
  };

  return {
    workers,
    services,
    sales,
    expenses,
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
    deleteService
  };
}
