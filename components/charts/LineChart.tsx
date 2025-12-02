'use client';

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface LineChartData {
  name: string;
  [key: string]: string | number;
}

interface LineChartProps {
  data: LineChartData[];
  lines: Array<{
    dataKey: string;
    name: string;
    color?: string;
    strokeWidth?: number;
  }>;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
}

export function LineChart({
  data,
  lines,
  height = 300,
  showLegend = true,
  showGrid = true,
}: LineChartProps) {
  const defaultColors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#EC4899', // pink
    '#F59E0B', // amber
    '#8B5CF6', // purple
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#334155"
            opacity={0.3}
          />
        )}
        <XAxis
          dataKey="name"
          stroke="#94A3B8"
          tick={{ fill: '#94A3B8', fontSize: 12 }}
          axisLine={{ stroke: '#334155' }}
        />
        <YAxis
          stroke="#94A3B8"
          tick={{ fill: '#94A3B8', fontSize: 12 }}
          axisLine={{ stroke: '#334155' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#F8FAFC',
          }}
          labelStyle={{ color: '#CBD5E1' }}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ color: '#CBD5E1', fontSize: '12px' }}
            iconType="line"
          />
        )}
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.color || defaultColors[index % defaultColors.length]}
            strokeWidth={line.strokeWidth || 2}
            dot={{ fill: line.color || defaultColors[index % defaultColors.length], r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

