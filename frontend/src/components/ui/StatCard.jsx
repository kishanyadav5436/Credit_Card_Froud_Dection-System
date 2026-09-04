import { ArrowDownRight, ArrowUpRight } from "lucide-react";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendLabel,
}) {
  const positive = trend >= 0;

  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-icon">
          <Icon size={20} />
        </div>

        {trend !== undefined && (
          <div className={`stat-trend ${positive ? "positive" : "negative"}`}>
            {positive ? (
              <ArrowUpRight size={15} />
            ) : (
              <ArrowDownRight size={15} />
            )}

            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-title">{title}</div>

      {description && (
        <div className="stat-description">
          {description}
          {trendLabel && ` ${trendLabel}`}
        </div>
      )}
    </div>
  );
}

export default StatCard;