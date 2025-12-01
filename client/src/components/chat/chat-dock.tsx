import { X, MessageCircle, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatDockProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
}

export function ChatDock({ open, onClose, userName = "Support Team" }: ChatDockProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-white" />
            <h2 className="text-lg font-bold text-white">Chat</h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            data-testid="button-close-chat"
            title="Close Chat"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <MessageCircle className="h-16 w-16 text-purple-500" />
              <Construction className="h-6 w-6 text-amber-500 absolute -bottom-1 -right-1" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3" data-testid="text-chat-coming-soon-title">
            Chat Feature Coming Soon
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6" data-testid="text-chat-coming-soon-message">
            This feature will be available in the upcoming version. We are currently in the development stage.
          </p>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Stay tuned for updates! The chat functionality will include direct messaging and support features.
            </p>
          </div>
          
          <Button onClick={onClose} variant="outline" className="w-full" data-testid="button-close-chat-modal">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
