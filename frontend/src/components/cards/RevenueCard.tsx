import { CircleDollarSign } from "lucide-react";
import { formatMoney } from "../../utils/format";

interface RevenueCardProps {
  revenue: number;
  fulfilledCount: number;
}

function RevenueCard({ revenue, fulfilledCount }: RevenueCardProps) {
  const formattedRevenue = formatMoney(revenue);

  return (
    <article className="stat-card" style={{ "--stat-tone": "#0f766e" } as React.CSSProperties}>
      <div className="stat-head">
        <p className="stat-label">Total Revenue</p>
        <span className="stat-icon">
          <CircleDollarSign aria-hidden="true" size={20} strokeWidth={2.2} />
        </span>
      </div>
      <p className="stat-value">{formattedRevenue}</p>
      <p className="stat-detail">
        <span className="trend">{fulfilledCount}</span> orders completed
      </p>
    </article>
  );
}

export default RevenueCard;
