import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-gray-800/80">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
          {title}
        </h1>
        
        {showSearch && (
          <div className="relative group min-w-[320px]">
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

      <div className="flex items-center gap-4">
        {actions}
      </div>
    </div>
  );
}
