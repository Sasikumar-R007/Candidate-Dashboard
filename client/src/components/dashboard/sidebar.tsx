import { Link } from "wouter";
import { User, Briefcase, Settings, LogOut, UserCircle } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: User },
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'job-board', label: 'Job Board', icon: Briefcase },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
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
                onClick={() => onTabChange(item.id)}
                className={`w-full h-12 flex items-center justify-center transition-all duration-200 relative group transform hover:scale-105 ${
                  activeTab === item.id 
                    ? 'bg-slate-800 text-cyan-400 shadow-lg' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white hover:shadow-md'
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
      
      {/* Sign Out Link */}
      <div className="pb-4">
        <div
          className="relative"
          onMouseEnter={() => setHoveredItem('sign-out')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link href="/" data-testid="link-sign-out-candidate">
            <button
              className="w-full h-12 flex items-center justify-center transition-all duration-200 relative group transform hover:scale-105 hover:bg-slate-800 text-slate-400 hover:text-white hover:shadow-md"
              data-testid="button-nav-sign-out"
            >
              <LogOut size={20} />
              
              {/* Tooltip */}
              {hoveredItem === 'sign-out' && (
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
