import React from 'react';
import { PieChart, Pie, Sector, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const emojiData = {
  "drowsy": "😴",
  "awake": "🙂"
}
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomLegend = ({ payload }) => {
  return (
    <div className="graph-legend-container">
      {payload.map(({ value, color }) => {
        if (value == "awaken") {
          value = "awake";
        }
        return (
          <span className="graph-legend-element-container" key={`legend-${value}`}>
            <span className="graph-legend-indicator" style={{ backgroundColor: color }} key={`indicator-${value}`} />
            <p className="graph-legend-text">{value} {emojiData[value]} </p>
          </span>
        );
      })}
    </div>
  );
}

export default function DrowsinessPieChart(stats) {
  const drowsinessData = [];
  Object.keys(stats.drowsiness).forEach(x => {
    const dataPoint = {
      name: x,
      value: stats.drowsiness[x]
    }
    drowsinessData.push(dataPoint);
  });

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={drowsinessData}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={renderCustomizedLabel}
        outerRadius={100}
        innerRadius={70}
        fill="#8884d8"
        dataKey="value"
      >
        {drowsinessData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend content={CustomLegend} />
    </PieChart>
  );
}
