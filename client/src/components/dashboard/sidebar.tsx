interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'my-profile', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'job-board', label: 'Job Board', icon: 'fas fa-briefcase' },
    { id: 'settings', label: 'Settings', icon: 'fas fa-cog' },
    { id: 'sign-out', label: 'Sign Out', icon: 'fas fa-sign-out-alt' }
  ];

  return (
    <div className="w-64 bg-blue-900 dark:bg-gray-800 text-white flex-shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold mb-8">Job Portal</h1>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors text-left ${
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
        </nav>
      </div>
    </div>
  );
}
