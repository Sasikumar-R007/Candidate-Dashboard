import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DashboardHeaderProps {
  title: string;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
}

export default function DashboardHeader({ 
  title, 
  showSearch = false, 
  searchQuery = '', 
  onSearchChange,
  actions 
}: DashboardHeaderProps) {
  return (
    <div className="sticky top-0 z-30 shrink-0 overflow-visible bg-white/95 dark:bg-gray-800/95 border-b border-gray-200 dark:border-gray-700 px-3 py-2 lg:px-6 lg:py-2.5 flex flex-row items-center justify-between gap-2 backdrop-blur-md shadow-sm">
      <div className="flex min-w-0 flex-1 items-center gap-2 lg:gap-4">
        <h1 className="truncate text-base font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent lg:text-xl">
          {title}
        </h1>
        
        {showSearch && (
          <div className="relative group hidden min-w-[320px] md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white transition-all rounded-full"
            />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 lg:gap-2.5">
        {actions}
      </div>
    </div>
  );
}
