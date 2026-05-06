import React from 'react';

interface NudgeIconProps {
  className?: string;
  pulsing?: boolean;
  color?: string;
}

export const NudgeIcon: React.FC<NudgeIconProps> = ({ 
  className = "w-6 h-6", 
  pulsing = false,
  color = "text-blue-500" 
}) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes nudge-pulse-fast {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.9); }
        }
        .animate-nudge-fast {
          animation: nudge-pulse-fast 0.6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}} />
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${pulsing ? 'animate-nudge-fast' : ''}`}
      >
        {/* Speed lines on the left - reduced for cleaner look */}
        <line x1="10" y1="48" x2="25" y2="48" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="15" y1="58" x2="30" y2="58" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
        
        {/* Speech Bubble - Sharp corners like the image */}
        <path
          d="M40 30H80C82.2091 30 84 31.7909 84 34V66C84 68.2091 82.2091 70 80 70H50L40 80V70C37.7909 70 36 68.2091 36 66V34C36 31.7909 37.7909 30 40 30Z"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        
        {/* The Lightning Bolt (Lighting Icon) - Center and prominent */}
        <path
          d="M65 38L52 54H62L49 70"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={color}
        />
        
        {/* Clock overlap top-right - Smaller like the image */}
        <circle cx="82" cy="30" r="14" fill="white" stroke="currentColor" strokeWidth="3" />
        <path
          d="M82 23V30L87 34"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
