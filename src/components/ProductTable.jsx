// @ts-nocheck
import { useState } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Star, Package } from 'lucide-react';

/**
 * ProductTable
 *
 * Props:
 *   products: Array<Product>   (from API)
 *   loading: boolean
 *   error: string | null
 */
export default function ProductTable({ products = [], loading, error }) {
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState(null); // null | 'asc' | 'desc'

  // ── Filter
  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  // ── Sort
  const sorted = [...filtered].sort((a, b) => {
    if (!sortDir) return 0;
    return sortDir === 'asc' ? a.price - b.price : b.price - a.price;
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
            id="product-search"
            className="search-input"
            type="text"
            placeholder="Search by product title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          id="sort-price-btn"
          className={`sort-btn ${sortDir ? 'active' : ''}`}
          onClick={toggleSort}
        >
          <SortIcon size={14} />
          {sortDir === 'asc' ? 'Price: Low → High' :
           sortDir === 'desc' ? 'Price: High → Low' : 'Price: Default'}
        </button>
      </div>

      {/* Table card */}
      <div className="table-container">
        <div className="table-header-bar">
          <span>Products</span>
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
                  <th className="align-right">Price</th>
                  <th className="align-right">Discounted</th>
                  <th>Status</th>
                  <th className="align-right">Review</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, idx) => (
                  <tr key={p.id ?? idx}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{idx + 1}</td>
                    <td><span className="product-title">{p.title}</span></td>
                    <td className="align-right">
                      <span className="price-value">${Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </td>
                    <td className="align-right">
                      <span className="price-discounted">${Number(p.discountedPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                    <td className="align-right">
                      <ReviewScore score={p.reviewScore} />
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

/* ── Status badge ──────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const s = (status || '').toLowerCase().replace(/\s+/g, '-');
  const cls =
    s === 'in-stock'   ? 'in-stock'  :
    s === 'low-stock'  ? 'low-stock' : 'out-stock';
  const label =
    s === 'in-stock'   ? 'In Stock'  :
    s === 'low-stock'  ? 'Low Stock' : 'Out of Stock';

  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
}

/* ── Review score chip ─────────────────────────────────────────── */
function ReviewScore({ score }) {
  const n = Number(score) || 0;
  const cls = n >= 80 ? 'high' : n >= 50 ? 'mid' : 'low';
  return (
    <span className={`review-score ${cls}`}>
      <Star size={12} fill="currentColor" />
      {n.toFixed(1)}
    </span>
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
      <Package size={40} />
      <h3>No products found</h3>
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
