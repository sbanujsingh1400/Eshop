// In apps/seller-ui/app/components/charts/RevenueBarChart.tsx
'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// Define the type for the data prop
type ChartDataPoint = {
  name: string;
  revenue?: number;
};

interface RevenueBarChartProps {
  data: ChartDataPoint[];
}

// Custom Tooltip to match your dark UI
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-lg">
        <p className="text-sm font-medium text-slate-300">{label}</p>
        <p className="text-base font-semibold text-white">
          {`Revenue: ${new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
          }).format(payload[0].value)}`}
        </p>
      </div>
    )
  }
  return null
}

const RevenueBarChart: React.FC<RevenueBarChartProps> = ({ data }) => {
  return (
    // Set height to match your placeholder's h-80
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%" >
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 10, // Add some padding for the edge
            left: -20, // Adjust to align Y-axis labels
            bottom: 5,
          }}
          
        
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#334155" // slate-700
          />
          <XAxis
            dataKey="name"
            stroke="#94a3b8" // slate-400
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8" // slate-400
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value / 1000}k`} // Format as thousands
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.5 }} />
          <Bar
            dataKey="revenue"
            fill="#3b82f6" // A nice blue-500
            radius={[4, 4, 0, 0]} // Rounded tops for the bars
            maxBarSize={30}
           
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RevenueBarChart