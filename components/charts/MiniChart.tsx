'use client';

import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import { AreaChart } from './AreaChart';

interface MiniChartProps {
  type: 'line' | 'bar' | 'area';
  data: Array<{ name: string; [key: string]: string | number }>;
  dataKey: string;
  color?: string;
  height?: number;
}

export function MiniChart({
  type,
  data,
  dataKey,
  color = '#3B82F6',
  height = 60,
}: MiniChartProps) {
  const chartProps = {
    data,
    height,
    showLegend: false,
    showGrid: false,
  };

  switch (type) {
    case 'line':
      return (
        <LineChart
          {...chartProps}
          lines={[{ dataKey, name: '', color, strokeWidth: 2 }]}
        />
      );
    case 'bar':
      return (
        <BarChart
          {...chartProps}
          bars={[{ dataKey, name: '', color }]}
        />
      );
    case 'area':
      return (
        <AreaChart
          {...chartProps}
          areas={[{ dataKey, name: '', color, fillOpacity: 0.3 }]}
        />
      );
    default:
      return null;
  }
}

