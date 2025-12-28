'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  LayoutDashboard, 
  Users, 
  Building2, 
  MessageSquare, 
  BarChart3,
  Shield,
  Settings,
  X,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      action: () => router.push('/admin/dashboard'),
      category: 'Navigation',
      keywords: ['dashboard', 'home', 'main'],
    },
    {
      id: 'admins',
      label: 'Admin Management',
      icon: <Shield className="w-5 h-5" />,
      action: () => router.push('/admin/admins'),
      category: 'Management',
      keywords: ['admin', 'admins', 'users', 'staff'],
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <Users className="w-5 h-5" />,
      action: () => router.push('/admin/users'),
      category: 'Management',
      keywords: ['users', 'user', 'members'],
    },
    {
      id: 'listings',
      label: 'Listing Management',
      icon: <Building2 className="w-5 h-5" />,
      action: () => router.push('/admin/listings'),
      category: 'Management',
      keywords: ['listings', 'listing', 'properties', 'rooms'],
    },
    {
      id: 'reviews',
      label: 'Review Management',
      icon: <MessageSquare className="w-5 h-5" />,
      action: () => router.push('/admin/reviews'),
      category: 'Management',
      keywords: ['reviews', 'review', 'feedback'],
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: <BarChart3 className="w-5 h-5" />,
      action: () => router.push('/admin/analytics'),
      category: 'Analytics',
      keywords: ['analytics', 'reports', 'stats', 'statistics'],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      action: () => router.push('/admin/settings'),
      category: 'Settings',
      keywords: ['settings', 'config', 'preferences'],
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.category.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some((kw) => kw.toLowerCase().includes(searchLower))
    );
  });

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  const handleCommandClick = (command: Command) => {
    command.action();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showCloseButton={false}
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No commands found
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">
                    {category}
                  </h3>
                  <div className="space-y-1">
                    {cmds.map((cmd, index) => {
                      const globalIndex = filteredCommands.indexOf(cmd);
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <button
                          key={cmd.id}
                          onClick={() => handleCommandClick(cmd)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                              : 'hover:bg-blue-50 text-gray-700'
                          }`}
                        >
                          <div className={isSelected ? 'text-white' : 'text-gray-500'}>{cmd.icon}</div>
                          <span className="flex-1 text-left">{cmd.label}</span>
                          {isSelected && (
                            <kbd className="px-2 py-1 text-xs bg-white/20 rounded border border-white/30 text-white">
                              Enter
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 text-gray-700">
                ↑↓
              </kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 text-gray-700">
                Enter
              </kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 text-gray-700">
                Esc
              </kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

