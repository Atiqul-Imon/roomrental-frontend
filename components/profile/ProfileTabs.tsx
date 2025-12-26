'use client';

import { useState, ReactNode } from 'react';
import { Home, Star, Activity, User, List, BarChart3, Heart, Search } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  content: ReactNode;
}

interface ProfileTabsProps {
  role: string;
  userId: string;
  isOwnProfile: boolean;
  tabs: Tab[];
}

export function ProfileTabs({ role, userId, isOwnProfile, tabs }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'overview');

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className="bg-white rounded-xl shadow-medium border border-grey-200">
      {/* Tab Navigation */}
      <div className="border-b border-grey-200">
        <div className="flex overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-colors whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'border-primary-500 text-primary-600 bg-primary-50'
                    : 'border-transparent text-grey-600 hover:text-grey-900 hover:bg-grey-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTabContent || <div className="text-center text-grey-500 py-8">No content available</div>}
      </div>
    </div>
  );
}

