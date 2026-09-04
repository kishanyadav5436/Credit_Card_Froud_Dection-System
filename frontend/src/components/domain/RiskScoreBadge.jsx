function RiskScoreBadge({ score }) {
  let className = "low";

  if (score >= 80) {
    className = "critical";
  } else if (score >= 60) {
    className = "high";
  } else if (score >= 30) {
    className = "medium";
  }

  return (
    <span className={`risk-badge ${className}`}>
      {score}
    </span>
  );
}

export default RiskScoreBadge;