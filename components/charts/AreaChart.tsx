'use client';

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AreaChartData {
  name: string;
  [key: string]: string | number;
}

interface AreaChartProps {
  data: AreaChartData[];
  areas: Array<{
    dataKey: string;
    name: string;
    color?: string;
    fillOpacity?: number;
  }>;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
}

export function AreaChart({
  data,
  areas,
  height = 300,
  showLegend = true,
  showGrid = true,
}: AreaChartProps) {
  const defaultColors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#EC4899', // pink
    '#F59E0B', // amber
    '#8B5CF6', // purple
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
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
        {areas.map((area, index) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            name={area.name}
            stroke={area.color || defaultColors[index % defaultColors.length]}
            fill={area.color || defaultColors[index % defaultColors.length]}
            fillOpacity={area.fillOpacity || 0.6}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}

