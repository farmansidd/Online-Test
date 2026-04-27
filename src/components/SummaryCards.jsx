// @ts-nocheck
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * SummaryCards
 *
 * Props:
 *   cards: Array<{
 *     label: string,
 *     value: string | number,
 *     sub?: string,
 *     subType?: 'up' | 'down' | 'warn' | '',
 *     icon: ReactNode,
 *     iconClass: string  (e.g. 'blue', 'green', 'orange', 'red')
 *   }>
 */
export default function SummaryCards({ cards }) {
  return (
    <div className="cards-grid">
      {cards.map((card, i) => (
        <SummaryCard key={i} {...card} />
      ))}
    </div>
  );
}

function SummaryCard({ label, value, sub, subType = '', icon, iconClass }) {
  const SubIcon =
    subType === 'up' ? TrendingUp :
    subType === 'down' ? TrendingDown : Minus;

  return (
    <div className="summary-card">
      <div className="card-info">
        <span className="card-label">{label}</span>
        <span className="card-value">{value}</span>
        {sub && (
          <span className={`card-sub ${subType}`}>
            <SubIcon size={12} />
            {sub}
          </span>
        )}
      </div>
      <div className={`card-icon ${iconClass}`}>
        {icon}
      </div>
    </div>
  );
}
