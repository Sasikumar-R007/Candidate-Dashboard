import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size]
      )}></div>
    </div>
  );
}

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Loading({ text = "Loading...", size = 'md', className }: LoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-6', className)}>
      <LoadingSpinner size={size} className="mb-3" />
      <p className="text-gray-600 dark:text-gray-400 text-sm">{text}</p>
    </div>
  );
}