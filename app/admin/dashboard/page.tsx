'use client';

export const dynamic = 'force-dynamic';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Users, Building2, MessageSquare, TrendingUp, DollarSign, Activity, LayoutDashboard } from 'lucide-react';
import { MiniChart } from '@/components/charts/MiniChart';

interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  totalReviews: number;
  activeListings: number;
  pendingListings: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  newListingsThisMonth: number;
  userTrendData: Array<{ name: string; value: number }>;
  listingTrendData: Array<{ name: string; value: number }>;
  reviewTrendData: Array<{ name: string; value: number }>;
  revenueTrendData: Array<{ name: string; value: number }>;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      const backendData = response.data.data;
      
      // Get active and pending listings count in parallel
      const [activeListingsResponse, pendingListingsResponse] = await Promise.all([
        api.get('/admin/listings', { params: { status: 'available', limit: 1 } }),
        api.get('/admin/listings', { params: { status: 'pending', limit: 1 } }),
      ]);
      
      const activeCount = activeListingsResponse.data.data.pagination?.total || 0;
      const pendingCount = pendingListingsResponse.data.data.pagination?.total || 0;
      
      // For now, use mock trend data (can be enhanced later with time-series data)
      return {
        totalUsers: backendData.stats?.users || 0,
        totalListings: backendData.stats?.listings || 0,
        totalReviews: backendData.stats?.reviews || 0,
        activeListings: activeCount,
        pendingListings: pendingCount,
        totalRevenue: 0, // Not tracked in backend yet
        newUsersThisMonth: 0, // Not tracked in backend yet
        newListingsThisMonth: 0, // Not tracked in backend yet
        userTrendData: [
          { name: 'W1', value: 100 },
          { name: 'W2', value: 120 },
          { name: 'W3', value: 110 },
          { name: 'W4', value: 130 },
        ],
        listingTrendData: [
          { name: 'W1', value: 50 },
          { name: 'W2', value: 65 },
          { name: 'W3', value: 60 },
          { name: 'W4', value: 70 },
        ],
        reviewTrendData: [
          { name: 'W1', value: 20 },
          { name: 'W2', value: 25 },
          { name: 'W3', value: 22 },
          { name: 'W4', value: 28 },
        ],
        revenueTrendData: [
          { name: 'W1', value: 25000 },
          { name: 'W2', value: 30000 },
          { name: 'W3', value: 28000 },
          { name: 'W4', value: 32000 },
        ],
      };
    },
  });

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      chartColor: '#3B82F6',
      change: `+${stats?.newUsersThisMonth || 0} this month`,
      trendData: stats?.userTrendData || [],
    },
    {
      title: 'Total Listings',
      value: stats?.totalListings || 0,
      icon: Building2,
      color: 'bg-green-500',
      chartColor: '#10B981',
      change: `+${stats?.newListingsThisMonth || 0} this month`,
      trendData: stats?.listingTrendData || [],
    },
    {
      title: 'Active Listings',
      value: stats?.activeListings || 0,
      icon: Activity,
      color: 'bg-purple-500',
      chartColor: '#8B5CF6',
      change: `${stats?.pendingListings || 0} pending`,
      trendData: stats?.listingTrendData || [],
    },
    {
      title: 'Total Reviews',
      value: stats?.totalReviews || 0,
      icon: MessageSquare,
      color: 'bg-orange-500',
      chartColor: '#F59E0B',
      change: 'All time',
      trendData: stats?.reviewTrendData || [],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <LayoutDashboard className="w-6 h-6 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <p className="text-gray-600 ml-12">Welcome back! Here&apos;s what&apos;s happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-emerald-200 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-200`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value.toLocaleString()}</h3>
              <p className="text-base font-semibold text-gray-700 mb-2">{stat.title}</p>
              <p className="text-sm text-gray-500 mb-4">{stat.change}</p>
              {stat.trendData.length > 0 && (
                <div className="h-16 -mx-2">
                  <MiniChart
                    type="area"
                    data={stat.trendData}
                    dataKey="value"
                    color={stat.chartColor}
                    height={60}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-5">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all duration-200 cursor-pointer">
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-sky-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">New user registered</p>
                <p className="text-xs text-gray-500 mt-0.5">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all duration-200 cursor-pointer">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">New listing created</p>
                <p className="text-xs text-gray-500 mt-0.5">15 minutes ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-5">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg hover:bg-amber-100 border border-amber-200 transition-all duration-200">
              <span className="text-sm font-semibold text-gray-700">Pending Approvals</span>
              <span className="text-xl font-bold text-amber-600">{stats?.pendingListings || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-sky-50 rounded-lg hover:bg-sky-100 border border-sky-200 transition-all duration-200">
              <span className="text-sm font-semibold text-gray-700">Active Users Today</span>
              <span className="text-xl font-bold text-sky-600">0</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 border border-green-200 transition-all duration-200">
              <span className="text-sm font-semibold text-gray-700">System Health</span>
              <span className="text-xl font-bold text-green-600">100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

