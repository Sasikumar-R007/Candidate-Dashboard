import { Link } from "wouter";
import { Users, FileText, GitBranch, BarChart3, Database, Trophy, FileBarChart, Settings, LogOut, ChevronRight } from "lucide-react";
import { useState } from "react";
// import scalingXLogo from "@/assets/images/scaling-x-logo.png";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    if (isExpanded) {
      setIsExpanded(false);
    }
  };

  return (
    <>
      {/* Main Sidebar */}
      <div className="w-16 bg-slate-900 text-white flex-shrink-0 h-screen overflow-hidden fixed left-0 top-0 z-50 flex flex-col">
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-center border-b border-slate-700">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-green-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">X</span>
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
                onClick={() => handleTabClick(item.id)}
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
                {hoveredItem === item.id && !isExpanded && (
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

      {/* Expand Button */}
      <div className="border-t border-slate-700 py-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          onMouseEnter={() => setHoveredItem('expand')}
          onMouseLeave={() => setHoveredItem(null)}
          className="w-full h-8 flex items-center justify-center transition-colors text-slate-400 hover:text-white hover:bg-slate-800 relative"
        >
          <ChevronRight size={16} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          
          {/* Tooltip */}
          {hoveredItem === 'expand' && !isExpanded && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded whitespace-nowrap z-50 shadow-lg border border-slate-600">
              Expand Menu
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45 border-l border-t border-slate-600"></div>
            </div>
          )}
        </button>
      </div>

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
              {hoveredItem === 'signout' && !isExpanded && (
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

    {/* Expanded Overlay */}
    {isExpanded && (
      <div className="fixed inset-0 z-40 flex">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50" 
          onClick={() => setIsExpanded(false)}
        ></div>
        
        {/* Expanded Menu */}
        <div className="relative w-64 bg-slate-900 text-white h-screen flex flex-col shadow-lg">
          {/* Logo Section */}
          <div className="h-16 flex items-center px-4 border-b border-slate-700">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-green-400 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">X</span>
            </div>
            <span className="text-lg font-semibold">ScalingX</span>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-4">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center px-4 py-3 transition-colors relative ${
                    activeTab === item.id 
                      ? 'bg-slate-800 text-cyan-400 border-r-2 border-cyan-400' 
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  data-testid={`button-nav-expanded-${item.id}`}
                >
                  <IconComponent size={20} className="mr-3" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sign Out Section */}
          <div className="border-t border-slate-700 py-4">
            <Link href="/" data-testid="link-sign-out-admin-expanded">
              <button
                className="w-full flex items-center px-4 py-3 transition-colors text-slate-400 hover:text-red-400 hover:bg-slate-800"
                data-testid="button-nav-sign-out-expanded"
              >
                <LogOut size={20} className="mr-3" />
                <span>Sign Out</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    )}
    </>
  );
}