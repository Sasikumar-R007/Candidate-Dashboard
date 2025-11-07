import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, Paperclip, Smile, MoreVertical, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  time: string;
  isOwn: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatDockProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
}

export function ChatDock({ open, onClose, userName = "Support Team" }: ChatDockProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const autoResponseShownRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    try {
      const response = await fetch('/api/support/my-conversation');
      const data = await response.json();

      if (data.conversation) {
        setConversationId(data.conversation.id);
        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          sender: msg.senderType === 'user' ? 'You' : msg.senderName,
          message: msg.message,
          time: new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          isOwn: msg.senderType === 'user',
          status: 'read' as const
        }));
        
        const hasRealSupportReply = formattedMessages.some((msg: ChatMessage) => 
          !msg.isOwn && msg.message !== 'Hello! How can we help you today?'
        );
        
        if (hasRealSupportReply && autoResponseShownRef.current) {
          autoResponseShownRef.current = false;
        }
        
        if (autoResponseShownRef.current && !hasRealSupportReply) {
          const autoResponse: ChatMessage = {
            id: 'auto-response',
            sender: 'Support Team',
            message: 'Thank you for your message. Our team will get back to you shortly.',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isOwn: false,
            status: 'read'
          };
          setMessages([...formattedMessages, autoResponse]);
        } else {
          setMessages(formattedMessages);
        }
      } else {
        setMessages([
          {
            id: '1',
            sender: 'Support Team',
            message: 'Hello! How can we help you today?',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isOwn: false,
            status: 'read'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadConversation();
      const interval = setInterval(loadConversation, 5000);
      return () => clearInterval(interval);
    }
  }, [open]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const messageText = newMessage;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      message: messageText,
      time: timeString,
      isOwn: true,
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsSending(true);

    setIsTyping(true);

    try {
      const response = await apiRequest('POST', '/api/support/send-message', {
        message: messageText
      });

      const data = await response.json();
      
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      await loadConversation();

      setTimeout(async () => {
        setIsTyping(false);
        
        try {
          const freshResponse = await fetch('/api/support/my-conversation');
          const freshData = await freshResponse.json();
          
          if (freshData.conversation && freshData.messages) {
            const hasRealSupportReply = freshData.messages.some((msg: any) => 
              msg.senderType === 'support' || 
              (msg.senderType !== 'user' && msg.message !== 'Hello! How can we help you today?')
            );
            
            if (hasRealSupportReply) {
              autoResponseShownRef.current = false;
              return;
            }
          }
        } catch (error) {
          console.error('Error checking for support reply:', error);
        }
        
        setMessages(prev => {
          const hasAutoResponse = prev.some(msg => msg.id === 'auto-response');
          
          if (hasAutoResponse) {
            return prev;
          }
          
          autoResponseShownRef.current = true;
          
          const autoResponseTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          const autoResponse: ChatMessage = {
            id: 'auto-response',
            sender: 'Support Team',
            message: 'Thank you for your message. Our team will get back to you shortly.',
            time: autoResponseTime,
            isOwn: false,
            status: 'read'
          };
          
          return [...prev, autoResponse];
        });
      }, 1500);

      toast({
        title: "Message Sent",
        description: "Your message has been sent to our support team.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      
      setIsTyping(false);
      setMessages(prev => prev.slice(0, -1));

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[700px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-white/50">
              <AvatarImage src="/placeholder-avatar.png" />
              <AvatarFallback className="bg-purple-500 text-white font-semibold">
                {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold text-white">{userName}</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-purple-100">Active now</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="More Options"
            >
              <MoreVertical className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-2"
              data-testid="button-close-chat"
              title="Close Chat"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <div className="p-6 space-y-6">
            {/* Date Divider */}
            <div className="flex items-center justify-center">
              <div className="bg-gray-200 dark:bg-gray-800 px-4 py-1.5 rounded-full">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Today</span>
              </div>
            </div>

            {messages.map((message, index) => (
              <div 
                key={message.id} 
                className={`flex gap-3 ${message.isOwn ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {!message.isOwn && (
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarImage src="/placeholder-avatar.png" />
                    <AvatarFallback className="bg-purple-500 text-white text-xs">
                      {message.sender.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`flex flex-col max-w-[70%] ${message.isOwn ? 'items-end' : 'items-start'}`}>
                  {!message.isOwn && (
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 px-1">
                      {message.sender}
                    </span>
                  )}
                  
                  <div className={`relative group ${
                    message.isOwn 
                      ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30' 
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-md'
                  } px-4 py-3 rounded-2xl ${
                    message.isOwn ? 'rounded-tr-sm' : 'rounded-tl-sm'
                  }`}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.message}
                    </div>
                    
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className={`text-xs ${
                        message.isOwn 
                          ? 'text-purple-200' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {message.time}
                      </div>
                      {message.isOwn && message.status && (
                        <div className="ml-1">
                          {message.status === 'sent' && (
                            <svg className="w-3.5 h-3.5 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                            </svg>
                          )}
                          {message.status === 'delivered' && (
                            <svg className="w-3.5 h-3.5 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                              <path d="M18.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0"/>
                            </svg>
                          )}
                          {message.status === 'read' && (
                            <svg className="w-3.5 h-3.5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                              <path d="M18.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0"/>
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {message.isOwn && (
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs">
                      You
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-purple-500 text-white text-xs">
                    {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-tl-sm shadow-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Enhanced Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-end gap-3">
            {/* Quick Actions */}
            <div className="flex gap-2 mb-2">
              <button
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group"
                title="Attach File"
              >
                <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
              </button>
              <button
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group"
                title="Add Image"
              >
                <ImageIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
              </button>
            </div>

            {/* Message Input */}
            <div className="flex-1 relative">
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Type your message..."
                className="pr-12 h-12 rounded-2xl border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-purple-500"
                data-testid="input-chat-message"
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Add Emoji"
              >
                <Smile className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Send Button */}
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="h-12 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-2xl shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              data-testid="button-send-message"
            >
              <Send className="h-5 w-5 mr-2" />
              <span className="font-semibold">Send</span>
            </Button>
          </div>
          
          {/* Helper Text */}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            Press Enter to send, Shift + Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}
