import { Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  detail?: string;
  tone?: string;
  trend?: "stable" | "risk" | string;
  Icon?: LucideIcon;
}

function StatsCard({
  title,
  value,
  detail,
  tone = "#b45309",
  trend = "stable",
  Icon = Activity,
}: StatsCardProps) {
  return (
    <article className="stat-card" style={{ "--stat-tone": tone } as React.CSSProperties}>
      <div className="stat-head">
        <p className="stat-label">{title}</p>
        <span className="stat-icon">
          <Icon aria-hidden="true" size={20} strokeWidth={2.2} />
        </span>
      </div>
      <p className="stat-value">{value}</p>
      <p className="stat-detail">
        <span className={trend === "risk" ? "trend warning" : "trend"}>{detail || "Updated today"}</span>
      </p>
    </article>
  );
}

export default StatsCard;
