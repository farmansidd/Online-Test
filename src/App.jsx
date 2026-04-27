// @ts-nocheck
import { useEffect, useState } from 'react';
import {
  Package, BarChart2, DollarSign, AlertTriangle,
  ShoppingCart, TrendingUp, Layers, Zap,
} from 'lucide-react';
import './App.css';
import SummaryCards from './components/SummaryCards';
import ProductTable  from './components/ProductTable';
import SalesTable    from './components/SalesTable';

/* ── API endpoint ──────────────────────────────────────────────── */
const API_URL =
  'https://script.google.com/macros/s/AKfycbz5WPlT0JL33_-SViL2xM-kP8iob0uSqKV221ydjuZ87gYq73mTA_OhtzcojWE-PZ2lGg/exec?accessToken=secureToken123';

/* ── Helpers ───────────────────────────────────────────────────── */
const fmt = (n, decimals = 2) =>
  Number(n).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/* ── Derive sales metrics from products ────────────────────────── */
function deriveSalesData(products) {
  if (!products || products.length === 0)
    return { totalSales: 0, averageProfitMargin: 0, totalPotentialRevenue: 0, rows: [] };

  const rows = products.map((p) => ({
    ...p,
    // Simulate sales channel if not present
    salesChannel: p.salesChannel || pickChannel(p.id),
    // Simulate profit margin if not present (between 5% and 45%)
    profitMargin:
      p.profitMargin != null
        ? p.profitMargin
        : Math.round(5 + ((p.id * 7) % 40)),
    // Potential revenue = discountedPrice * simulated stock qty
    potentialRevenue:
      p.potentialRevenue != null
        ? p.potentialRevenue
        : Number(p.discountedPrice) * Math.max(1, Math.round(10 + ((p.id * 13) % 90))),
  }));

  const totalSales = rows.reduce((s, p) => s + Number(p.potentialRevenue), 0);
  const avgMargin  = rows.reduce((s, p) => s + Number(p.profitMargin), 0) / rows.length;

  return {
    totalSales,
    averageProfitMargin: avgMargin,
    totalPotentialRevenue: totalSales,
    rows,
  };
}

const CHANNELS = ['Online', 'Retail', 'Wholesale', 'Marketplace', 'Direct'];
function pickChannel(id) {
  return CHANNELS[Number(id ?? 0) % CHANNELS.length];
}

/* ════════════════════════════════════════════════════════════════ */
export default function App() {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'sales'
  const [data, setData]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((res) => {
        if (res.error) {
          setError(res.error);
        } else {
          setData(res);
        }
      })
      .catch(() => setError('Unable to reach the API. Please try again later.'))
      .finally(() => {
        setLoading(false);
        setLastUpdated(new Date().toLocaleTimeString());
      });
  }, []);

  /* ── Inventory metrics ─────────────────────────────────────── */
  const inventoryCards = [
    {
      label: 'Total Products',
      value: data ? data.summary.totalProducts : '—',
      sub: 'Across all categories',
      subType: '',
      icon: <Package size={22} />,
      iconClass: 'blue',
    },
    {
      label: 'Average Price',
      value: data ? `$${fmt(data.summary.averagePrice)}` : '—',
      sub: 'Across all SKUs',
      subType: '',
      icon: <DollarSign size={22} />,
      iconClass: 'green',
    },
    {
      label: 'Out of Stock',
      value: data ? data.summary.outOfStockCount : '—',
      sub: data && data.summary.outOfStockCount > 0 ? 'Needs immediate attention' : 'All stocked',
      subType: data && data.summary.outOfStockCount > 0 ? 'warn' : 'up',
      icon: <AlertTriangle size={22} />,
      iconClass: data && data.summary.outOfStockCount > 0 ? 'orange' : 'green',
    },
  ];

  /* ── Sales metrics ─────────────────────────────────────────── */
  const salesData    = data ? deriveSalesData(data.products) : {};
  const salesCards   = [
    {
      label: 'Total Sales',
      value: salesData.totalSales != null ? `$${fmt(salesData.totalSales, 0)}` : '—',
      sub: 'Potential revenue pipeline',
      subType: 'up',
      icon: <ShoppingCart size={22} />,
      iconClass: 'blue',
    },
    {
      label: 'Avg. Profit Margin',
      value: salesData.averageProfitMargin != null
        ? `${fmt(salesData.averageProfitMargin, 1)}%`
        : '—',
      sub: salesData.averageProfitMargin >= 20 ? 'Healthy margins' : 'Below target',
      subType: salesData.averageProfitMargin >= 20 ? 'up' : 'warn',
      icon: <TrendingUp size={22} />,
      iconClass: salesData.averageProfitMargin >= 20 ? 'green' : 'orange',
    },
    {
      label: 'Potential Revenue',
      value: salesData.totalPotentialRevenue != null
        ? `$${fmt(salesData.totalPotentialRevenue, 0)}`
        : '—',
      sub: 'Based on current inventory',
      subType: 'up',
      icon: <Layers size={22} />,
      iconClass: 'purple',
    },
  ];

  return (
    <div className="dashboard">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="header">
        <div className="header-left">
          <div className="header-logo">
            <Zap size={18} />
          </div>
          <div>
            <div className="header-title">IntelliStock</div>
            <div className="header-subtitle">Inventory &amp; Sales Intelligence</div>
          </div>
        </div>
        <span className="header-badge">
          ● Live {lastUpdated ? `• ${lastUpdated}` : ''}
        </span>
      </header>

      {/* ── Nav tabs ───────────────────────────────────────────── */}
      <nav className="nav-tabs">
        <button
          id="tab-inventory"
          className={`nav-tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Package size={15} />
          Inventory
        </button>
        <button
          id="tab-sales"
          className={`nav-tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          <BarChart2 size={15} />
          Sales
        </button>
      </nav>

      {/* ── Main content ───────────────────────────────────────── */}
      <main className="main-content" key={activeTab}>

        {activeTab === 'inventory' ? (
          <>
            <div className="page-title">
              <h2>Inventory Dashboard</h2>
              <p>Real-time product inventory overview</p>
            </div>

            {/* Summary cards */}
            {loading ? (
              <div className="cards-grid">
                {[0,1,2].map((i) => (
                  <div key={i} className="skeleton skeleton-card" />
                ))}
              </div>
            ) : (
              <SummaryCards cards={inventoryCards} />
            )}

            {/* Product table */}
            <ProductTable
              products={data?.products ?? []}
              loading={loading}
              error={error}
            />
          </>
        ) : (
          <>
            <div className="page-title">
              <h2>Sales Dashboard</h2>
              <p>Revenue insights and profit analysis</p>
            </div>

            {/* Summary cards */}
            {loading ? (
              <div className="cards-grid">
                {[0,1,2].map((i) => (
                  <div key={i} className="skeleton skeleton-card" />
                ))}
              </div>
            ) : (
              <SummaryCards cards={salesCards} />
            )}

            {/* Sales table */}
            <SalesTable
              products={salesData.rows ?? []}
              loading={loading}
              error={error}
            />
          </>
        )}
      </main>
    </div>
  );
}