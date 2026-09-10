import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function FeatureDriftChart({ data }) {
  return (
    <div className="model-chart-card">
      <div className="section-heading">
        <div>
          <h2>Feature Drift</h2>
          <p>Distribution changes by feature</p>
        </div>
      </div>

      <div className="model-chart">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              left: 20,
              right: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              type="number"
              domain={[0, "auto"]}
              tickFormatter={(value) => `${value}%`}
            />

            <YAxis
              type="category"
              dataKey="feature"
              width={150}
            />

            <Tooltip
              formatter={(value) => [
                `${value}%`,
                "Drift",
              ]}
            />

            <Bar
              dataKey="drift"
              radius={[0, 5, 5, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default FeatureDriftChart;