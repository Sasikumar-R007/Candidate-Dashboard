import { Link } from "wouter";
import { Users, FileText, GitBranch, BarChart3, Database, Trophy, FileBarChart, Settings, LogOut } from "lucide-react";
import { useState } from "react";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuItems = [
    { id: 'team', label: 'Team', icon: Users },
    { id: 'requirements', label: 'Requirements', icon: FileText },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
    { id: 'master-data', label: 'Master Data', icon: Database },
    { id: 'performance', label: 'Performance', icon: Trophy },
    { id: 'report', label: 'Report', icon: FileBarChart },
    { id: 'user-management', label: 'User Management', icon: Settings }
  ];

  return (
    <div className="w-16 bg-slate-900 text-white flex-shrink-0 h-screen overflow-hidden fixed left-0 top-0 z-50 flex flex-col">
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-center border-b border-slate-700">
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">X</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full h-12 flex items-center justify-center transition-colors relative group ${
                  activeTab === item.id 
                    ? 'bg-slate-800 text-cyan-400' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
                data-testid={`button-nav-${item.id}`}
              >
                {/* Active indicator */}
                {activeTab === item.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400"></div>
                )}
                
                <IconComponent size={20} />
                
                {/* Tooltip */}
                {hoveredItem === item.id && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded whitespace-nowrap z-50 shadow-lg border border-slate-600">
                    {item.label}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45 border-l border-t border-slate-600"></div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Sign Out Section */}
      <div className="border-t border-slate-700 py-4">
        <div
          className="relative"
          onMouseEnter={() => setHoveredItem('signout')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link href="/" data-testid="link-sign-out-admin">
            <button
              className="w-full h-12 flex items-center justify-center transition-colors text-slate-400 hover:text-red-400 hover:bg-slate-800"
              data-testid="button-nav-sign-out"
            >
              <LogOut size={20} />
              
              {/* Tooltip */}
              {hoveredItem === 'signout' && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded whitespace-nowrap z-50 shadow-lg border border-slate-600">
                  Sign Out
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45 border-l border-t border-slate-600"></div>
                </div>
              )}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}