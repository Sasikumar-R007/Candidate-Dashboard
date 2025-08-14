import { Link } from "wouter";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'job-board', label: 'Job Board', icon: 'fas fa-briefcase' },
    { id: 'report', label: 'Report', icon: 'fas fa-chart-bar' },
    { id: 'settings', label: 'Settings', icon: 'fas fa-cog' }
  ];

  return (
    <div className="w-64 bg-blue-900 dark:bg-gray-800 text-white flex-shrink-0 h-screen overflow-hidden fixed left-0 top-0 z-10">
      <div className="p-6 h-full flex flex-col">
        <h1 className="text-xl font-bold mb-8">Job Portal</h1>
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded transition-colors text-left ${
                activeTab === item.id 
                  ? 'bg-blue-700 dark:bg-gray-700 font-medium' 
                  : 'hover:bg-blue-700 dark:hover:bg-gray-700'
              }`}
              data-testid={`button-nav-${item.id}`}
            >
              <i className={`${item.icon} mr-3`}></i>
              {item.label}
            </button>
          ))}
          
          {/* Sign Out Link */}
          <Link href="/" data-testid="link-sign-out-admin">
            <button
              className="w-full flex items-center px-4 py-3 rounded-lg transition-colors text-left hover:bg-blue-700 dark:hover:bg-gray-700"
              data-testid="button-nav-sign-out"
            >
              <i className="fas fa-sign-out-alt mr-3"></i>
              Sign Out
            </button>
          </Link>
        </nav>
      </div>
    </div>
  );
}