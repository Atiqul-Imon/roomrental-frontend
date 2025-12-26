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
    <div className="bg-white rounded-xl shadow-medium border border-grey-200 overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-grey-200">
        <div className="flex overflow-x-auto scrollbar-hide -mb-px snap-x snap-mandatory">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap border-b-2 snap-start flex-shrink-0 ${
                  isActive
                    ? 'border-primary-500 text-primary-600 bg-primary-50'
                    : 'border-transparent text-grey-600 hover:text-grey-900 hover:bg-grey-50'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden min-[375px]:inline">{tab.label}</span>
                <span className="min-[375px]:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {activeTabContent || <div className="text-center text-grey-500 py-8">No content available</div>}
      </div>
    </div>
  );
}

