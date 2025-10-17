import { useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  time: string;
  isOwn: boolean;
}

interface ChatDockProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
}

export function ChatDock({ open, onClose, userName = "Support Team" }: ChatDockProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Support Team',
      message: 'Hello! How can we help you today?',
      time: '10:00 AM',
      isOwn: false
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      message: newMessage,
      time: timeString,
      isOwn: true
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    setTimeout(() => {
      const responseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: userName,
        message: 'Thank you for your message. Our team will get back to you shortly.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isOwn: false
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 1000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[600px] m-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chat with {userName}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            data-testid="button-close-chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.isOwn 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
              }`}>
                {!message.isOwn && (
                  <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
                    {message.sender}
                  </div>
                )}
                <div className="text-sm">{message.message}</div>
                <div className={`text-xs mt-1 ${
                  message.isOwn 
                    ? 'text-purple-200' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {message.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1"
              data-testid="input-chat-message"
            />
            <Button 
              onClick={handleSendMessage}
              className="bg-purple-600 hover:bg-purple-700"
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
