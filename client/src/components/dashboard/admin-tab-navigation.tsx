interface AdminTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AdminTabNavigation({ activeTab, onTabChange }: AdminTabNavigationProps) {
  const tabs = [
    { id: 'team', label: 'Team' },
    { id: 'requirements', label: 'Requirements' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'metrics', label: 'Metrics' },
    { id: 'master-data', label: 'Master data' },
    { id: 'performance', label: 'Performance' },
    { id: 'user-management', label: 'User Management' }
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 px-6">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`${
              activeTab === tab.id
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}