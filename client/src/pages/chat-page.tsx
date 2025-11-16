import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: string;
  senderType: string;
  senderName: string;
  message: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  subject: string;
  status: string;
}

export default function ChatPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
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
        setConversation(data.conversation);
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConversation();
    const interval = setInterval(loadConversation, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage;
    setNewMessage('');
    setIsSending(true);

    try {
      await apiRequest('POST', '/api/support/send-message', {
        message: messageText
      });

      await loadConversation();

      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h3 className="font-semibold" data-testid="text-chat-title">Support Chat</h3>
              <p className="text-xs text-muted-foreground" data-testid="text-chat-subtitle">
                {conversation?.status === 'open' ? 'Active' : conversation?.status || 'New conversation'}
              </p>
            </div>
          </div>
          <Avatar className="w-10 h-10" data-testid="avatar-support">
            <AvatarFallback className="bg-primary text-primary-foreground">ST</AvatarFallback>
          </Avatar>
        </div>

        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-muted rounded-full p-6 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">ST</AvatarFallback>
                </Avatar>
              </div>
              <h3 className="text-lg font-semibold mb-2" data-testid="text-welcome-title">Welcome to Support Chat</h3>
              <p className="text-sm text-muted-foreground max-w-md" data-testid="text-welcome-message">
                Send us a message and our support team will get back to you shortly.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message) => {
                const isOwn = message.senderType === 'user';
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                    data-testid={`message-${message.id}`}
                  >
                    {!isOwn && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {message.senderName?.substring(0, 2).toUpperCase() || 'ST'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                      {!isOwn && (
                        <span className="text-xs font-semibold mb-1 px-1" data-testid={`text-sender-${message.id}`}>
                          {message.senderName}
                        </span>
                      )}
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words" data-testid={`text-message-content-${message.id}`}>
                          {message.message}
                        </p>
                        <span className={`text-xs mt-1 block ${
                          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`} data-testid={`text-message-time-${message.id}`}>
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                    {isOwn && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          You
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t bg-card">
          <div className="flex items-center gap-3 max-w-3xl mx-auto">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Type your message..."
              disabled={isSending}
              className="flex-1"
              data-testid="input-message"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              data-testid="button-send"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
