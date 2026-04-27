// @ts-nocheck
import { useState } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, BarChart2, TrendingUp } from 'lucide-react';

/**
 * SalesTable
 *
 * Props:
 *   products: Array<Product>   (includes salesChannel, profitMargin, potentialRevenue)
 *   loading: boolean
 *   error: string | null
 */
export default function SalesTable({ products = [], loading, error }) {
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState(null); // null | 'asc' | 'desc'

  // ── Filter
  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  // ── Sort by potentialRevenue
  const sorted = [...filtered].sort((a, b) => {
    if (!sortDir) return 0;
    return sortDir === 'asc'
      ? a.potentialRevenue - b.potentialRevenue
      : b.potentialRevenue - a.potentialRevenue;
  });

  const toggleSort = () =>
    setSortDir((prev) =>
      prev === null ? 'asc' : prev === 'asc' ? 'desc' : null
    );

  const SortIcon =
    sortDir === 'asc' ? ArrowUp :
    sortDir === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <>
      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrapper">
          <Search className="search-icon" size={15} />
          <input
            id="sales-search"
            className="search-input"
            type="text"
            placeholder="Search by product title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          id="sort-revenue-btn"
          className={`sort-btn ${sortDir ? 'active' : ''}`}
          onClick={toggleSort}
        >
          <SortIcon size={14} />
          {sortDir === 'asc' ? 'Revenue: Low → High' :
           sortDir === 'desc' ? 'Revenue: High → Low' : 'Revenue: Default'}
        </button>
      </div>

      {/* Table card */}
      <div className="table-container">
        <div className="table-header-bar">
          <span>Sales Data</span>
          <span className="table-count">{sorted.length} items</span>
        </div>

        <div className="table-scroll">
          {loading ? (
            <SkeletonRows />
          ) : error ? (
            <ErrorState message={error} />
          ) : sorted.length === 0 ? (
            <EmptyState />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Sales Channel</th>
                  <th className="align-right">Profit Margin</th>
                  <th className="align-right">Potential Revenue</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, idx) => (
                  <tr key={p.id ?? idx}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{idx + 1}</td>
                    <td><span className="product-title">{p.title}</span></td>
                    <td><ChannelBadge channel={p.salesChannel} /></td>
                    <td className="align-right">
                      <MarginBadge margin={p.profitMargin} />
                    </td>
                    <td className="align-right">
                      <span className="price-value">
                        ${Number(p.potentialRevenue).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Sales channel badge ───────────────────────────────────────── */
function ChannelBadge({ channel }) {
  return (
    <span className="badge channel">
      <TrendingUp size={11} />
      {channel || 'Unknown'}
    </span>
  );
}

/* ── Profit margin badge ───────────────────────────────────────── */
function MarginBadge({ margin }) {
  const pct = Number(margin) || 0;
  const cls =
    pct >= 30 ? 'margin-high' :
    pct >= 15 ? 'margin-medium' :
    pct >= 0  ? 'margin-low' : 'margin-loss';
  const label = `${pct.toFixed(1)}%`;

  return (
    <span className={`badge ${cls}`}>{label}</span>
  );
}

/* ── Skeleton ──────────────────────────────────────────────────── */
function SkeletonRows() {
  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="skeleton skeleton-row" style={{ width: '100%' }} />
      ))}
    </div>
  );
}

/* ── Empty state ───────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="empty-state">
      <BarChart2 size={40} />
      <h3>No sales data found</h3>
      <p>Try adjusting your search terms.</p>
    </div>
  );
}

/* ── Error state ───────────────────────────────────────────────── */
function ErrorState({ message }) {
  return (
    <div className="error-state">
      <h3>Failed to load data</h3>
      <p>{message}</p>
    </div>
  );
}
