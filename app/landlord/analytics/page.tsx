'use client';

export const dynamic = 'force-dynamic';

import { BarChart3 } from 'lucide-react';

export default function LandlordAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-grey-900 mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary-500" />
            Analytics
          </h1>
          <p className="text-grey-600">Track your listing performance and insights</p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-xl p-12 shadow-medium border border-grey-200 text-center">
        <BarChart3 className="w-16 h-16 text-grey-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-grey-900 mb-2">Analytics Coming Soon</h2>
        <p className="text-grey-600 max-w-md mx-auto">
          We're working on bringing you detailed analytics and insights for your listings. 
          This feature will include views, inquiries, and performance metrics.
        </p>
      </div>
    </div>
  );
}

