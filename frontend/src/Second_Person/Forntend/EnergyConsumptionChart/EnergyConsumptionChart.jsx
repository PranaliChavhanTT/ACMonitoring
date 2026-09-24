import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

function EnergyConsumptionChart({ data = [] }) {
  const chartData =
    data.length > 0
      ? data.map((item, index) => ({
          name: item.timestamp?.slice(11, 16) || item.date || `P${index + 1}`,
          currentMonth: Number( item.energy_consumption 
            ?? item.energy 
            ?? item.kwh 
            ?? 0 ),
          previousMonth: Number( item.previous_energy 
            ?? item.previous_month_energy 
            ?? 0 ),
        }))
      : [
          { name: "1 Sep", currentMonth: 28, previousMonth: 24 },
          { name: "3 Sep", currentMonth: 35, previousMonth: 28 },
          { name: "5 Sep", currentMonth: 42, previousMonth: 31 },
          { name: "7 Sep", currentMonth: 55, previousMonth: 36 },
          { name: "9 Sep", currentMonth: 61, previousMonth: 42 },
          { name: "11 Sep", currentMonth: 67, previousMonth: 44 },
          { name: "13 Sep", currentMonth: 74, previousMonth: 48 },
          { name: "15 Sep", currentMonth: 68, previousMonth: 46 },
        ];

  return (
    <div className="chart-box">
      <div className="chart-header">
        <h3>▥ Energy Consumption Trend</h3>

        {/* <select className="chart-select">
          <option>Daily</option>
          <option>Weekly</option>
          <option>Monthly</option>
        </select> */}
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
          />

          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
          />

          <YAxis
            tick={{ fontSize: 11 }}
            label={{
              value: "Energy (kWh)",
              angle: -90,
              position: "insideLeft",
              fontSize: 11,
            }}
          />

          <Tooltip />

          <Legend />

          <Line
            type="monotone"
            dataKey="currentMonth"
            name="This Month"
            stroke="#3182BD"
            strokeWidth={3}
            dot={{ r: 3 }}
          />

          <Line
            type="monotone"
            dataKey="previousMonth"
            name="Previous Month"
            stroke="#94a3b8"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EnergyConsumptionChart;