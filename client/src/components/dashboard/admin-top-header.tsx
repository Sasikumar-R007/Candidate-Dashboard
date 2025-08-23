import { useState } from "react";
import { ChevronDown, User, Settings, LogOut, HelpCircle } from "lucide-react";
import { Link } from "wouter";

interface AdminTopHeaderProps {
  userName: string;
  companyName: string;
}

export default function AdminTopHeader({ userName = "Sasi Kumar", companyName = "Gumlat Marketing Private Limited" }: AdminTopHeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 ml-16 relative z-30">
      {/* Left - Company Name */}
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {companyName}
        </h1>
      </div>

      {/* Right - Help and User Dropdown */}
      <div className="flex items-center gap-4">
        {/* Help Button */}
        <button className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <HelpCircle size={16} />
          <span className="text-sm">Help</span>
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            onBlur={() => setTimeout(() => setShowUserDropdown(false), 150)}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            data-testid="button-user-dropdown"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <span className="text-sm font-medium">{userName}</span>
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown Menu */}
          {showUserDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 z-50">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                <User size={16} />
                <span>Profile</span>
              </button>
              
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                <Settings size={16} />
                <span>Settings</span>
              </button>
              
              <hr className="my-2 border-gray-200 dark:border-gray-600" />
              
              <Link href="/" data-testid="link-logout">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150">
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}