import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, Search, Clock, User, Mail, X, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface Conversation {
  id: string;
  userId: string | null;
  userEmail: string;
  userName: string;
  subject: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  lastMessageAt: string;
  createdAt: string;
  messageCount?: number;
  lastMessage?: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderType: 'user' | 'support';
  senderName: string;
  message: string;
  createdAt: string;
}

export default function SupportDashboard() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: conversations = [], isLoading: conversationsLoading, error: conversationsError } = useQuery<Conversation[]>({
    queryKey: ['/api/support/conversations'],
    refetchInterval: 5000,
    retry: false,
  });

  useEffect(() => {
    if (conversationsError) {
      const errorResponse = conversationsError as any;
      if (errorResponse?.message?.includes('403') || errorResponse?.message?.includes('Access denied')) {
        toast({
          title: "Access Denied",
          description: "Support team authentication required. Please login first.",
          variant: "destructive",
        });
        navigate("/support-login");
      }
    }
  }, [conversationsError, navigate, toast]);

  const { data: conversationData, isLoading: messagesLoading } = useQuery<{
    conversation: Conversation;
    messages: Message[];
  } | null>({
    queryKey: ['/api/support/conversations', selectedConversation, 'messages'],
    enabled: !!selectedConversation,
    refetchInterval: 3000,
  });

  const replyMutation = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: string; message: string }) => {
      const response = await apiRequest('POST', `/api/support/conversations/${conversationId}/reply`, {
        message,
        senderName: 'Support Team'
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support/conversations', selectedConversation, 'messages'] });
      setReplyMessage('');
      toast({
        title: "Reply Sent",
        description: "Your reply has been sent to the user.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ conversationId, status }: { conversationId: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/support/conversations/${conversationId}/status`, {
        status
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/conversations'] });
      toast({
        title: "Status Updated",
        description: "Conversation status has been updated.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    }
  });

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendReply = () => {
    if (!replyMessage.trim() || !selectedConversation) return;
    replyMutation.mutate({ conversationId: selectedConversation, message: replyMessage });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Circle className="h-3 w-3" />;
      case 'in_progress': return <AlertCircle className="h-3 w-3" />;
      case 'resolved': return <CheckCircle2 className="h-3 w-3" />;
      case 'closed': return <X className="h-3 w-3" />;
      default: return <Circle className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-purple-600" />
            Support Team Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage and respond to user support queries
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-160px)]">
          <Card className="md:col-span-1 flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Conversations</span>
                <Badge variant="secondary" data-testid="text-conversation-count">
                  {conversations.length}
                </Badge>
              </CardTitle>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-conversations"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {conversationsLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading conversations...</div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No conversations found</div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedConversation === conv.id
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-950'
                            : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'
                        }`}
                        data-testid={`conversation-${conv.id}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-purple-500 text-white text-xs">
                                {conv.userName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                {conv.userName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {conv.userEmail}
                              </p>
                            </div>
                          </div>
                          <Badge className={`text-xs ${getStatusColor(conv.status)}`}>
                            {getStatusIcon(conv.status)}
                            <span className="ml-1">{conv.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {conv.lastMessage || conv.subject || 'No messages yet'}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(conv.lastMessageAt).toLocaleString()}
                          </span>
                          {conv.messageCount && (
                            <Badge variant="secondary" className="text-xs">
                              {conv.messageCount} msgs
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 flex flex-col">
            {selectedConversation && conversationData ? (
              <>
                <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-purple-500 text-white">
                          {conversationData.conversation.userName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {conversationData.conversation.userName}
                        </CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {conversationData.conversation.userEmail}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={conversationData.conversation.status}
                        onChange={(e) => updateStatusMutation.mutate({
                          conversationId: selectedConversation,
                          status: e.target.value
                        })}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        data-testid="select-conversation-status"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {conversationData.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${msg.senderType === 'support' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className={msg.senderType === 'support' ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'}>
                              {msg.senderName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex flex-col max-w-[70%] ${msg.senderType === 'support' ? 'items-end' : 'items-start'}`}>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              {msg.senderName}
                            </span>
                            <div className={`px-4 py-2 rounded-lg ${
                              msg.senderType === 'support'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {msg.message}
                              </p>
                              <p className={`text-xs mt-1 ${
                                msg.senderType === 'support' ? 'text-green-200' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {new Date(msg.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your reply..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                        className="flex-1"
                        data-testid="input-reply-message"
                      />
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyMessage.trim() || replyMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid="button-send-reply"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold">Select a conversation</p>
                  <p className="text-sm">Choose a conversation from the list to view and reply</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
