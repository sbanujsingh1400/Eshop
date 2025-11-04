// In apps/seller-ui/app/components/charts/OrderStatusDonutChart.tsx
'use client'

import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { orderStatus as OrderStatusEnum } from '@prisma/client'

// Define the type for the data prop
type ChartDataPoint = {
  name: string; // This will be the OrderStatusEnum
  value?: number;
};

// --- THIS IS THE CRITICAL PART ---
// This interface accepts a 'data' prop
interface OrderStatusDonutChartProps {
  data: ChartDataPoint[];
}
// ---------------------------------

// Colors to match your OrderStatusBadge component
const STATUS_COLORS: Record<string, string> = {
  [OrderStatusEnum.Processing]: '#3b82f6', // blue-500
  [OrderStatusEnum.Paid]: '#eab308', // yellow-500
  [OrderStatusEnum.Shipped]: '#06b6d4', // cyan-500
  [OrderStatusEnum.Delivered]: '#22c55e', // green-500
  [OrderStatusEnum.Ordered]: '#6b7280', // gray-500
  [OrderStatusEnum.Packed]: '#6366f1', // indigo-500
  [OrderStatusEnum.OutForDelivery]: '#f97316', // orange-500
};

// Custom Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-lg">
        <p
          className="text-sm font-semibold"
          style={{ color: payload[0].payload.fill }}
        >
          {payload[0].name}
        </p>
        <p className="text-base font-medium text-white">
          {`Orders: ${payload[0].value}`}
        </p>
      </div>
    )
  }
  return null
}

const OrderStatusDonutChart: React.FC<OrderStatusDonutChartProps> = ({
  data, // This component correctly destructures 'data'
}) => {
  return (
    // Set height to match your placeholder's h-80
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{
              fontSize: '14px',
              color: '#cbd5e1', // slate-300
              paddingLeft: '20px',
            }}
            formatter={(value) => <span className="text-slate-300">{value}</span>}
          />
          <Pie
            data={data} // ...and uses it here
            dataKey="value"
            nameKey="name"
            cx="40%" // Adjust center to make space for legend
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            cornerRadius={5}
            fill="#8884d8" // Default fill, will be overridden by Cells
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.name] || '#8884d8'}
                stroke={STATUS_COLORS[entry.name]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default OrderStatusDonutChart