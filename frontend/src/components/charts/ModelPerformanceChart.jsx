import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function ModelPerformanceChart({ performance }) {
  const data = [
    {
      metric: "Precision",
      value: performance.precision,
    },
    {
      metric: "Recall",
      value: performance.recall,
    },
    {
      metric: "F1 Score",
      value: performance.f1Score,
    },
    {
      metric: "ROC-AUC",
      value: performance.rocAuc,
    },
  ];

  return (
    <div className="model-chart-card">
      <div className="section-heading">
        <div>
          <h2>Performance Metrics</h2>
          <p>Current production model performance</p>
        </div>
      </div>

      <div className="model-chart">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="metric" />

            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              formatter={(value) => [
                `${value}%`,
                "Score",
              ]}
            />

            <Bar
              dataKey="value"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ModelPerformanceChart;