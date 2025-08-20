import { Button } from '@/components/ui/button';

interface RecruiterTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function RecruiterTabNavigation({ activeTab, onTabChange }: RecruiterTabNavigationProps) {
  const tabs = [
    { id: 'updates', label: 'Updates' },
    { id: 'requirements', label: 'Requirements' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'performance', label: 'Performance' },
  ];

  return (
    <div className="px-6 mt-6">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-secondary-blue text-secondary-blue'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}