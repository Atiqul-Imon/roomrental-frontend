'use client';

export const dynamic = 'force-dynamic';

import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { api } from '@/lib/api';
import { Users, Building2, MessageSquare, TrendingUp, DollarSign, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { AreaChart } from '@/components/charts/AreaChart';
import { ChartCard } from '@/components/charts/ChartCard';
import { exportChartAsPNG } from '@/lib/chartExport';

interface AnalyticsData {
  totalUsers: number;
  totalListings: number;
  totalReviews: number;
  activeListings: number;
  pendingListings: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  newListingsThisMonth: number;
  userGrowth: number;
  listingGrowth: number;
  recentUsers: Array<{ name: string; email: string; createdAt: string }>;
  topLocations: Array<{ city: string; state: string; count: number }>;
  userGrowthData: Array<{ name: string; users: number }>;
  listingGrowthData: Array<{ name: string; listings: number }>;
  listingStatusData: Array<{ name: string; value: number }>;
  revenueData: Array<{ name: string; revenue: number }>;
}

export default function AnalyticsPage() {
  const userGrowthChartRef = useRef<HTMLDivElement>(null);
  const listingChartRef = useRef<HTMLDivElement>(null);
  const statusChartRef = useRef<HTMLDivElement>(null);
  const revenueChartRef = useRef<HTMLDivElement>(null);

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      // Placeholder - will be implemented when backend analytics endpoint is ready
      // For now, return mock data with chart data
      return {
        totalUsers: 1250,
        totalListings: 342,
        totalReviews: 89,
        activeListings: 298,
        pendingListings: 44,
        totalRevenue: 125000,
        newUsersThisMonth: 45,
        newListingsThisMonth: 12,
        userGrowth: 12.5,
        listingGrowth: 8.3,
        recentUsers: [],
        topLocations: [
          { city: 'New York', state: 'NY', count: 45 },
          { city: 'Los Angeles', state: 'CA', count: 32 },
          { city: 'Chicago', state: 'IL', count: 28 },
        ],
        userGrowthData: [
          { name: 'Jan', users: 100 },
          { name: 'Feb', users: 120 },
          { name: 'Mar', users: 140 },
          { name: 'Apr', users: 160 },
          { name: 'May', users: 180 },
          { name: 'Jun', users: 200 },
        ],
        listingGrowthData: [
          { name: 'Jan', listings: 50 },
          { name: 'Feb', listings: 65 },
          { name: 'Mar', listings: 80 },
          { name: 'Apr', listings: 95 },
          { name: 'May', listings: 110 },
          { name: 'Jun', listings: 125 },
        ],
        listingStatusData: [
          { name: 'Active', value: 298 },
          { name: 'Pending', value: 44 },
          { name: 'Rented', value: 120 },
        ],
        revenueData: [
          { name: 'Jan', revenue: 15000 },
          { name: 'Feb', revenue: 18000 },
          { name: 'Mar', revenue: 22000 },
          { name: 'Apr', revenue: 25000 },
          { name: 'May', revenue: 28000 },
          { name: 'Jun', revenue: 32000 },
        ],
      };
    },
  });

  const statCards = [
    {
      title: 'Total Users',
      value: analytics?.totalUsers || 0,
      icon: Users,
      color: 'bg-emerald-500',
      change: analytics?.userGrowth || 0,
      changeLabel: 'vs last month',
    },
    {
      title: 'Total Listings',
      value: analytics?.totalListings || 0,
      icon: Building2,
      color: 'bg-green-500',
      change: analytics?.listingGrowth || 0,
      changeLabel: 'vs last month',
    },
    {
      title: 'Active Listings',
      value: analytics?.activeListings || 0,
      icon: Activity,
      color: 'bg-purple-500',
      change: analytics?.pendingListings || 0,
      changeLabel: 'pending approval',
    },
    {
      title: 'Total Reviews',
      value: analytics?.totalReviews || 0,
      icon: MessageSquare,
      color: 'bg-orange-500',
      change: 0,
      changeLabel: 'all time',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
        <p className="text-gray-600">Platform insights and performance metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-dark-large hover:border-primary-500/30 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-20`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                {stat.change !== 0 && (
                  <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span className="text-sm font-semibold">{Math.abs(stat.change)}%</span>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value.toLocaleString()}</h3>
              <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
              <p className="text-xs text-gray-500">{stat.changeLabel}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <ChartCard
          title="User Growth"
          description="Monthly user registration trends"
          onExport={() => {
            if (userGrowthChartRef.current) {
              exportChartAsPNG(userGrowthChartRef.current, 'user-growth');
            }
          }}
        >
          <div ref={userGrowthChartRef}>
            {analytics?.userGrowthData && (
              <LineChart
                data={analytics.userGrowthData}
                lines={[
                  { dataKey: 'users', name: 'Users', color: '#3B82F6' },
                ]}
                height={300}
              />
            )}
          </div>
        </ChartCard>

        {/* Listing Growth Chart */}
        <ChartCard
          title="Listing Growth"
          description="Monthly listing creation trends"
          onExport={() => {
            if (listingChartRef.current) {
              exportChartAsPNG(listingChartRef.current, 'listing-growth');
            }
          }}
        >
          <div ref={listingChartRef}>
            {analytics?.listingGrowthData && (
              <AreaChart
                data={analytics.listingGrowthData}
                areas={[
                  { dataKey: 'listings', name: 'Listings', color: '#10B981' },
                ]}
                height={300}
              />
            )}
          </div>
        </ChartCard>

        {/* Listing Status Distribution */}
        <ChartCard
          title="Listing Status Distribution"
          description="Breakdown of listing statuses"
          onExport={() => {
            if (statusChartRef.current) {
              exportChartAsPNG(statusChartRef.current, 'listing-status');
            }
          }}
        >
          <div ref={statusChartRef}>
            {analytics?.listingStatusData && (
              <PieChart
                data={analytics.listingStatusData}
                height={300}
                colors={['#10B981', '#F59E0B', '#3B82F6']}
              />
            )}
          </div>
        </ChartCard>

        {/* Revenue Chart */}
        <ChartCard
          title="Revenue Trends"
          description="Monthly revenue growth"
          onExport={() => {
            if (revenueChartRef.current) {
              exportChartAsPNG(revenueChartRef.current, 'revenue-trends');
            }
          }}
        >
          <div ref={revenueChartRef}>
            {analytics?.revenueData && (
              <BarChart
                data={analytics.revenueData}
                bars={[
                  { dataKey: 'revenue', name: 'Revenue', color: '#EC4899' },
                ]}
                height={300}
              />
            )}
          </div>
        </ChartCard>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Users</h2>
          <div className="space-y-3">
            {analytics?.recentUsers && analytics.recentUsers.length > 0 ? (
              analytics.recentUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No recent users</p>
            )}
          </div>
        </div>

        {/* Top Locations */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Locations</h2>
          <div className="space-y-3">
            {analytics?.topLocations && analytics.topLocations.length > 0 ? (
              analytics.topLocations.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">
                      {location.city}, {location.state}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">{location.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No location data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

