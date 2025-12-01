import { MessageCircle, Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ChatPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <MessageCircle className="h-20 w-20 text-blue-500 dark:text-blue-400" />
              <Construction className="h-8 w-8 text-amber-500 absolute -bottom-1 -right-1" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3" data-testid="text-chat-coming-soon-title">
            Chat Feature Coming Soon
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4" data-testid="text-chat-coming-soon-message">
            This feature will be available in the upcoming version. We are currently in the development stage and working hard to bring you a seamless messaging experience.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-6">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Stay tuned for updates! The chat functionality will include direct messaging, group chats, and file sharing capabilities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
