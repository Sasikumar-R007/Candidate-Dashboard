import React from 'react';

interface SimpleClientHeaderProps {
  companyName?: string;
  userName?: string;
  userImage?: string;
}

export default function SimpleClientHeader({ 
  companyName = "Gumlet Marketing Private Limited",
  userName = "Sasi Kumar",
  userImage = "/api/placeholder/32/32"
}: SimpleClientHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Company Name */}
        <h1 className="text-lg font-semibold text-gray-900">{companyName}</h1>
        
        {/* Right side - Help and User Profile */}
        <div className="flex items-center gap-4">
          {/* Help */}
          <div className="flex items-center gap-1 text-gray-600">
            <i className="fas fa-question-circle"></i>
            <span className="text-sm">Help</span>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center gap-2">
            <img 
              src={userImage} 
              alt={userName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-gray-900">{userName}</span>
            <i className="fas fa-chevron-down text-xs text-gray-500"></i>
          </div>
        </div>
      </div>
    </div>
  );
}