import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

function RiskDistributionChart({ data }) {
  const colors = [
    "#22c55e",
    "#eab308",
    "#f97316",
    "#ef4444",
  ];

  return (
    <div className="dashboard-chart-card">
      <div className="section-heading">
        <div>
          <h2>Risk Distribution</h2>

          <p>
            Transactions by risk level
          </p>
        </div>
      </div>

      <div className="dashboard-chart">
        <ResponsiveContainer
          width="100%"
          height={280}
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={colors[index]}
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RiskDistributionChart;