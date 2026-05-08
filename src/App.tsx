/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Percent,
  ChevronLeft,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

// --- Types ---

type Account = 'Gill' | 'Bash';
type DeliveryStatus = 'Pending' | 'Delivered' | 'Refunded';

interface Order {
  id: string;
  account: Account;
  worker: string;
  customerName: string;
  productName: string;
  quantity: number;
  aeCost: number;
  ebayPrice: number;
  pl: number;
  date: string;
  deliveryStatus: DeliveryStatus;
}

// --- Constants ---

const WORKERS = ['Hamza', 'Abbas', 'Khurram', 'Wasif', 'Aleem', 'Ammad', 'Yaseen', 'Usman', 'Other'];
const ACCOUNTS: Account[] = ['Gill', 'Bash'];
const STATUSES: DeliveryStatus[] = ['Pending', 'Delivered', 'Refunded'];

const SAMPLE_DATA: Order[] = [
  { id: '1', account: 'Gill', worker: 'Hamza', customerName: 'John Doe', productName: 'Makita D-58833 Ratchet Screwdriver', quantity: 1, aeCost: 2.99, ebayPrice: 7.21, pl: 4.22, date: '2024-05-01', deliveryStatus: 'Delivered' },
  { id: '2', account: 'Bash', worker: 'Abbas', customerName: 'Sarah Smith', productName: '20Pcs Pokemon Cards GX Battle Carte', quantity: 2, aeCost: 5.67, ebayPrice: 10.17, pl: 4.50, date: '2024-05-02', deliveryStatus: 'Delivered' },
  { id: '3', account: 'Gill', worker: 'Khurram', customerName: 'Mike Johnson', productName: 'Giant Connect 4 Garden Game 117x110', quantity: 1, aeCost: 49.99, ebayPrice: 53.58, pl: 3.59, date: '2024-05-03', deliveryStatus: 'Pending' },
  { id: '4', account: 'Bash', worker: 'Wasif', customerName: 'Emma Wilson', productName: 'Makita D-58833 Ratchet Screwdriver', quantity: 1, aeCost: 6.70, ebayPrice: 7.17, pl: 0.47, date: '2024-05-04', deliveryStatus: 'Delivered' },
  { id: '5', account: 'Gill', worker: 'Aleem', customerName: 'Robert Brown', productName: 'Makita D-58833 Ratchet Screwdriver', quantity: 1, aeCost: 1.19, ebayPrice: 7.21, pl: 6.02, date: '2024-05-05', deliveryStatus: 'Delivered' },
  { id: '6', account: 'Bash', worker: 'Hamza', customerName: 'Lucy Taylor', productName: 'Flat Snap Ring Pliers 40mm Reverse', quantity: 1, aeCost: 8.34, ebayPrice: 10.06, pl: 1.72, date: '2024-05-06', deliveryStatus: 'Delivered' },
  { id: '7', account: 'Gill', worker: 'Ammad', customerName: 'David Lee', productName: 'Grinder Mini Sander Cordless 6pcs', quantity: 1, aeCost: 7.62, ebayPrice: 7.72, pl: 0.10, date: '2024-05-07', deliveryStatus: 'Delivered' },
  { id: '8', account: 'Bash', worker: 'Khurram', customerName: 'Alice White', productName: 'WWE Elite Action Figure Giulia NEW', quantity: 1, aeCost: 19.99, ebayPrice: 22.23, pl: 2.24, date: '2024-05-08', deliveryStatus: 'Pending' },
];

// --- Components ---

const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }: { title: string; value: string; icon: any; colorClass: string; subtitle?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between"
    id={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
  >
    <div className="flex justify-between items-start mb-2 text-slate-500 font-medium text-sm">
      <span>{title}</span>
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon size={18} />
      </div>
    </div>
    <div>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  </motion.div>
);

export default function App() {
  // --- States ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccount, setFilterAccount] = useState<Account | 'All'>('All');
  const [filterWorker, setFilterWorker] = useState<string | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<DeliveryStatus | 'All'>('All');

  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem('ebay_dropshipping_orders');
    if (saved) {
      setOrders(JSON.parse(saved));
    } else {
      setOrders(SAMPLE_DATA);
    }
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('ebay_dropshipping_orders', JSON.stringify(orders));
    }
  }, [orders]);

  // --- Calculations ---
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, curr) => acc + (curr.deliveryStatus === 'Refunded' ? 0 : curr.ebayPrice), 0);
    const totalCost = orders.reduce((acc, curr) => acc + (curr.deliveryStatus === 'Refunded' ? 0 : curr.aeCost), 0);
    const totalProfit = totalRevenue - totalCost;
    const netMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    const gillProfit = orders
      .filter(o => o.account === 'Gill' && o.deliveryStatus !== 'Refunded')
      .reduce((acc, curr) => acc + curr.pl, 0);
    const bashProfit = orders
      .filter(o => o.account === 'Bash' && o.deliveryStatus !== 'Refunded')
      .reduce((acc, curr) => acc + curr.pl, 0);

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      netMargin,
      totalOrders: orders.length,
      gillProfit,
      bashProfit
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAccount = filterAccount === 'All' || order.account === filterAccount;
      const matchesWorker = filterWorker === 'All' || order.worker === filterWorker;
      const matchesStatus = filterStatus === 'All' || order.deliveryStatus === filterStatus;
      
      return matchesSearch && matchesAccount && matchesWorker && matchesStatus;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, searchTerm, filterAccount, filterWorker, filterStatus]);

  // --- Handlers ---
  const handleSaveOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const aeCost = parseFloat(formData.get('aeCost') as string);
    const ebayPrice = parseFloat(formData.get('ebayPrice') as string);
    
    const newOrder: Order = {
      id: editingOrder ? editingOrder.id : Math.random().toString(36).substr(2, 9),
      account: formData.get('account') as Account,
      worker: formData.get('worker') as string,
      customerName: formData.get('customerName') as string,
      productName: formData.get('productName') as string,
      quantity: parseInt(formData.get('quantity') as string),
      aeCost,
      ebayPrice,
      pl: ebayPrice - aeCost,
      date: formData.get('date') as string,
      deliveryStatus: formData.get('deliveryStatus') as DeliveryStatus,
    };

    if (editingOrder) {
      setOrders(orders.map(o => o.id === editingOrder.id ? newOrder : o));
    } else {
      setOrders([newOrder, ...orders]);
    }
    
    setIsFormOpen(false);
    setEditingOrder(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  const exportCSV = () => {
    const headers = ['Account', 'Placed By', 'Customer', 'Product', 'Qty', 'Cost (£)', 'Price (£)', 'P/L (£)', 'Date', 'Status'];
    const rows = filteredOrders.map(o => [
      o.account,
      o.worker,
      o.customerName,
      o.productName,
      o.quantity,
      o.aeCost.toFixed(2),
      o.ebayPrice.toFixed(2),
      o.pl.toFixed(2),
      o.date,
      o.deliveryStatus
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ebay_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const importedOrders: Order[] = data.map((row: any) => {
          const account = (row.Account || row.account || 'Gill') as Account;
          const worker = row['Placed By'] || row.Worker || row.worker || 'Other';
          const customerName = row.Customer || row['Customer Name'] || row.customerName || 'Unknown';
          const productName = row.Product || row['Product Name'] || row.productName || 'Imported Product';
          const quantity = parseInt(row.Quantity || row.Qty || row.qty || '1');
          const aeCost = parseFloat(row.Cost || row['AE/Amazon Cost (£)'] || row.aeCost || '0');
          const ebayPrice = parseFloat(row.Price || row['eBay Price (£)'] || row.ebayPrice || '0');
          const deliveryStatus = (row.Status || row['Delivery Status'] || row.deliveryStatus || 'Pending') as DeliveryStatus;
          
          let dateStr = new Date().toISOString().split('T')[0];
          if (row.Date || row['Order Date'] || row.date) {
            const d = new Date(row.Date || row['Order Date'] || row.date);
            if (!isNaN(d.getTime())) {
              dateStr = d.toISOString().split('T')[0];
            }
          }

          return {
            id: Math.random().toString(36).substr(2, 9),
            account,
            worker,
            customerName,
            productName,
            quantity,
            aeCost,
            ebayPrice,
            pl: ebayPrice - aeCost,
            date: dateStr,
            deliveryStatus: STATUSES.includes(deliveryStatus) ? deliveryStatus : 'Pending',
          };
        });

        if (importedOrders.length > 0) {
          setOrders(prev => [...importedOrders, ...prev]);
          alert(`Successfully imported ${importedOrders.length} orders!`);
        } else {
          alert('No valid orders found in the file.');
        }
      } catch (error) {
        console.error('Error importing Excel:', error);
        alert('Failed to parse Excel file. Please ensure it follows the correct format.');
      }
      // Reset input
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-[#0f172a] text-white py-6 px-6 shadow-lg mb-8" id="main-header">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-inner">
              <ShoppingCart size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">eBay Dropshipping Hub</h1>
              <p className="text-slate-400 text-sm">Gill & Bash Performance Tracker</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingOrder(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-md"
            id="btn-add-order"
          >
            <Plus size={20} />
            Add New Order
          </motion.button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          <StatCard 
            title="Total Revenue" 
            value={`£${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={TrendingUp}
            colorClass="bg-emerald-100 text-emerald-600"
          />
          <StatCard 
            title="Total Cost" 
            value={`£${stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={TrendingDown}
            colorClass="bg-rose-100 text-rose-600"
          />
          <StatCard 
            title="Total Profit" 
            value={`£${stats.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            colorClass="bg-blue-100 text-blue-600"
            subtitle={`${stats.totalProfit >= 0 ? '+' : ''}${stats.totalProfit.toFixed(2)} GBP`}
          />
          <StatCard 
            title="Net Margin" 
            value={`${stats.netMargin.toFixed(1)}%`}
            icon={Percent}
            colorClass="bg-amber-100 text-amber-600"
          />
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders.toString()}
            icon={ShoppingCart}
            colorClass="bg-indigo-100 text-indigo-600"
          />
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <p className="text-xs text-slate-500 font-medium uppercase mb-3 text-center border-b pb-2 border-slate-50">Accounts Split</p>
            <div className="flex justify-between items-center px-2">
              <div className="text-center">
                <span className="text-xs text-slate-400 block mb-1">Gill</span>
                <span className={`font-bold text-sm ${stats.gillProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  £{stats.gillProfit.toFixed(2)}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-100"></div>
              <div className="text-center">
                <span className="text-xs text-slate-400 block mb-1">Bash</span>
                <span className={`font-bold text-sm ${stats.bashProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  £{stats.bashProfit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Controls Bar */}
          <div className="p-6 border-bottom border-slate-100 flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between bg-slate-50/50">
            <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search products or customers..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-slate-500" />
                <select 
                  className="text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none bg-white"
                  value={filterAccount}
                  onChange={(e) => setFilterAccount(e.target.value as Account | 'All')}
                >
                  <option value="All">All Accounts</option>
                  {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <select 
                  className="text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none bg-white"
                  value={filterWorker}
                  onChange={(e) => setFilterWorker(e.target.value)}
                >
                  <option value="All">All Workers</option>
                  {WORKERS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
                <select 
                  className="text-sm py-2 px-3 border border-slate-200 rounded-lg focus:outline-none bg-white"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as DeliveryStatus | 'All')}
                >
                  <option value="All">All Statuses</option>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer underline text-blue-600 hover:text-blue-800 font-medium text-sm transition-all">
                <Upload size={16} />
                <span>Import Excel</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleImportExcel}
                />
              </label>

              <button 
                onClick={exportCSV}
                className="flex items-center gap-2 underline text-blue-600 hover:text-blue-800 font-medium text-sm transition-all"
                id="btn-export"
              >
                <Download size={16} />
                Export to CSV
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="orders-table">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Account</th>
                  <th className="px-6 py-4">Worker</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Qty</th>
                  <th className="px-6 py-4">Cost</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">P/L</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {filteredOrders.map((order) => {
                    const rowColor = order.deliveryStatus === 'Refunded' 
                      ? 'bg-slate-50/50' 
                      : (order.pl > 0 ? 'hover:bg-emerald-50/20' : (order.pl < 0 ? 'hover:bg-rose-50/20' : ''));
                    
                    return (
                      <motion.tr 
                        key={order.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`transition-colors text-sm ${rowColor}`}
                      >
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${order.account === 'Gill' ? 'bg-indigo-100 text-indigo-700' : 'bg-violet-100 text-violet-700'}`}>
                            {order.account}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">{order.worker}</td>
                        <td className="px-6 py-4 text-slate-500">{order.customerName}</td>
                        <td className="px-6 py-4 max-w-[200px] truncate" title={order.productName}>{order.productName}</td>
                        <td className="px-6 py-4">{order.quantity}</td>
                        <td className="px-6 py-4 text-slate-500 font-mono">£{order.aeCost.toFixed(2)}</td>
                        <td className="px-6 py-4 font-semibold font-mono text-slate-900">£{order.ebayPrice.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`font-bold font-mono ${order.pl > 0 ? 'text-emerald-600' : (order.pl < 0 ? 'text-rose-600' : 'text-slate-400')}`}>
                            {order.pl > 0 ? '+' : ''}£{order.pl.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {order.deliveryStatus === 'Delivered' && <CheckCircle2 size={14} className="text-emerald-500" />}
                            {order.deliveryStatus === 'Pending' && <Clock size={14} className="text-amber-500" />}
                            {order.deliveryStatus === 'Refunded' && <XCircle size={14} className="text-slate-400" />}
                            <span className={`text-[11px] font-medium ${order.deliveryStatus === 'Delivered' ? 'text-emerald-600' : (order.deliveryStatus === 'Pending' ? 'text-amber-600' : 'text-slate-500')}`}>
                              {order.deliveryStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => {
                                setEditingOrder(order);
                                setIsFormOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(order.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="py-20 text-center text-slate-400">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg">No orders found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-slate-400 text-xs">
        <p>&copy; 2024 eBay Dropshipping Hub • Internal Worker Tool</p>
      </footer>

      {/* Order Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsFormOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden"
              id="order-form-modal"
            >
              <div className="bg-[#0f172a] p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">{editingOrder ? 'Edit Order' : 'Add New Order'}</h2>
                <button onClick={() => setIsFormOpen(false)} className="opacity-70 hover:opacity-100 p-1">
                  <XCircle size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSaveOrder} className="p-8 grid grid-cols-2 gap-6">
                <div className="col-span-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Account</label>
                  <select 
                    name="account" 
                    defaultValue={editingOrder?.account || 'Gill'} 
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  >
                    {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Placed By</label>
                  <select 
                    name="worker" 
                    defaultValue={editingOrder?.worker || WORKERS[0]} 
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  >
                    {WORKERS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Product Name</label>
                  <input 
                    type="text" 
                    name="productName" 
                    defaultValue={editingOrder?.productName} 
                    required 
                    placeholder="Enter product title..."
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Customer Name</label>
                  <input 
                    type="text" 
                    name="customerName" 
                    defaultValue={editingOrder?.customerName} 
                    required 
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Quantity</label>
                  <input 
                    type="number" 
                    name="quantity" 
                    defaultValue={editingOrder?.quantity || 1} 
                    min="1" 
                    required 
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                  />
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">AE/Amazon Cost (£)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">£</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      name="aeCost" 
                      defaultValue={editingOrder?.aeCost} 
                      required 
                      className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-rose-600"
                    />
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">eBay Price (£)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">£</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      name="ebayPrice" 
                      defaultValue={editingOrder?.ebayPrice} 
                      required 
                      className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-emerald-600 font-bold"
                    />
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Order Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    defaultValue={editingOrder?.date || new Date().toISOString().split('T')[0]} 
                    required 
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Status</label>
                  <select 
                    name="deliveryStatus" 
                    defaultValue={editingOrder?.deliveryStatus || 'Pending'} 
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                
                <div className="col-span-2 pt-4 flex gap-3">
                  <button 
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
                  >
                    {editingOrder ? 'Update Order' : 'Complete Add Order'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsFormOpen(false)}
                    className="px-6 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
