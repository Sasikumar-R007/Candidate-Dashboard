import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

interface ChatModalProps {
  roomId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onMessageSent: () => void;
  employeeId?: string;
}

export function ChatModal({ roomId, isOpen, onClose, onMessageSent, employeeId }: ChatModalProps) {
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages for this room
  const { data: messagesData, isLoading: isLoadingMessages, refetch: refetchMessages } = useQuery<{ messages: any[] }>({
    queryKey: [`/api/chat/rooms/${roomId}/messages`],
    enabled: !!roomId && isOpen,
    refetchInterval: 3000, // Refresh every 3 seconds for real-time updates
  });

  const messages = messagesData?.messages || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !roomId) return;

    try {
      const response = await apiRequest('POST', `/api/chat/rooms/${roomId}/messages`, {
        content: messageContent.trim(),
        messageType: 'text'
      });

      if (response.ok) {
        setMessageContent('');
        await refetchMessages();
        onMessageSent();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!roomId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">Messages</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[400px] max-h-[500px]">
          {isLoadingMessages ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((message: any) => {
              const isOwn = message.senderId === employeeId;
              const isDelivered = !!message.deliveredAt;
              const isRead = !!message.readAt;
              
              return (
                <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <p className="text-sm font-medium">{message.senderName}</p>
                    <p className="text-sm mt-1">{message.content}</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <p className="text-xs opacity-75">
                        {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </p>
                      {isOwn && (
                        <div className="flex items-center gap-0.5">
                          {/* Two overlapping circles for delivery/read status */}
                          <div className="relative flex items-center">
                            <div className={`w-3 h-3 rounded-full ${isDelivered ? 'bg-green-500' : 'bg-blue-400'} ${isRead ? 'opacity-100' : 'opacity-60'}`}></div>
                            <div className={`w-3 h-3 rounded-full -ml-1.5 ${isRead ? 'bg-green-500' : isDelivered ? 'bg-blue-400' : 'bg-blue-300'} ${isRead ? 'opacity-100' : 'opacity-60'}`}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            rows={2}
            className="flex-1 resize-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageContent.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
