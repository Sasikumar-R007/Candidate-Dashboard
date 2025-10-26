import { useState } from 'react';
import { X, Search, MoreVertical, Phone, Video, Plus, Send, Smile, Paperclip, Pin, Check, CheckCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online: boolean;
  isPinned?: boolean;
}

interface Message {
  id: number;
  sender: string;
  content: string;
  time: string;
  isOwn: boolean;
  read?: boolean;
  type?: 'text' | 'image' | 'voice';
  media?: string[];
}

interface MediaItem {
  id: number;
  url: string;
  type: 'image' | 'doc';
}

export default function ChatPage() {
  const [activeConversation, setActiveConversation] = useState(2);
  const [showGroupDetails, setShowGroupDetails] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const conversations: Conversation[] = [
    {
      id: 1,
      name: 'Harry Maguire',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'You need to improve now',
      time: '09:12 AM',
      online: true,
      isPinned: true
    },
    {
      id: 2,
      name: 'United Family',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Rashford is typing...',
      time: '06:25 AM',
      unread: 3,
      online: true,
      isPinned: false
    },
    {
      id: 3,
      name: 'Ramsus Hejlund',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Boss, I need to talk today',
      time: '03:11 AM',
      unread: 2,
      online: false,
      isPinned: false
    },
    {
      id: 4,
      name: 'Andre Onana',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'I need more time bos',
      time: '11:34 AM',
      online: true,
      isPinned: false
    },
    {
      id: 5,
      name: 'Regulion',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Great performance lad',
      time: '09:12 AM',
      online: false,
      isPinned: false
    },
    {
      id: 6,
      name: 'Bruno Fernandes',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'Play the game Bruno !',
      time: '10:21 AM',
      online: true,
      isPinned: false
    },
    {
      id: 7,
      name: 'Masont Mount',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'How about your injury?',
      time: '10:11 AM',
      online: false,
      isPinned: false
    },
    {
      id: 8,
      name: 'Lisandro Martinez',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'I nee a great partner sir',
      time: '09:12 AM',
      unread: 1,
      online: true,
      isPinned: false
    }
  ];

  const messages: Message[] = [
    {
      id: 1,
      sender: 'Harry Maguire',
      content: 'Hey lads, tough game yesterday. Let\'s talk about what went wrong and how we can improve.',
      time: '08:34 AM',
      isOwn: false,
      read: true
    },
    {
      id: 2,
      sender: 'Bruno Fernandes',
      content: 'Agreed, Harry. We had some good moments, but we need to be more clinical in front of the goal.',
      time: '08:34 AM',
      isOwn: false,
      read: true
    },
    {
      id: 3,
      sender: 'You',
      content: 'We need to control the midfield and exploit their defensive weakness. Bruno and Paul, I\'m counting on you to be more creative. Marcus and Jadon, stretch their defense wide. Use your pace wisely and take on their full-backs.',
      time: '08:34 AM',
      isOwn: true,
      read: true,
      type: 'text',
      media: ['/api/placeholder/200/150', '/api/placeholder/200/150']
    }
  ];

  const mediaGallery: MediaItem[] = [
    { id: 1, url: '/api/placeholder/100/100', type: 'image' },
    { id: 2, url: '/api/placeholder/100/100', type: 'doc' },
    { id: 3, url: '/api/placeholder/100/100', type: 'image' },
    { id: 4, url: '/api/placeholder/100/100', type: 'image' },
    { id: 5, url: '/api/placeholder/100/100', type: 'image' },
    { id: 6, url: '/api/placeholder/100/100', type: 'image' },
    { id: 7, url: '/api/placeholder/100/100', type: 'image' },
    { id: 8, url: '/api/placeholder/100/100', type: 'doc' },
    { id: 9, url: '/api/placeholder/100/100', type: 'image' }
  ];

  const activeConv = conversations.find(c => c.id === activeConversation);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* User Profile Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12" data-testid="avatar-current-user">
                <AvatarImage src="/api/placeholder/48/48" />
                <AvatarFallback className="bg-red-500 text-white">ET</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900" data-testid="text-user-name">Erik Ten Hag</h3>
                <p className="text-xs text-gray-500" data-testid="text-user-role">Info account</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-gray-100">
              <TabsTrigger value="all" className="text-xs" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="personal" className="text-xs" data-testid="tab-personal">Personal</TabsTrigger>
              <TabsTrigger value="groups" className="text-xs" data-testid="tab-groups">Groups</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Pinned Messages */}
        <div className="px-4 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-600 uppercase" data-testid="text-pinned-header">Pinned Message</h4>
            <Pin className="h-3 w-3 text-gray-400" />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {conversations
            .filter(conv => conv.isPinned)
            .map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  activeConversation === conv.id ? 'bg-gray-100' : ''
                }`}
                data-testid={`conversation-item-${conv.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conv.avatar} />
                      <AvatarFallback>{conv.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 text-sm truncate" data-testid={`text-conversation-name-${conv.id}`}>
                        {conv.name}
                      </h4>
                      <span className="text-xs text-gray-500" data-testid={`text-conversation-time-${conv.id}`}>
                        {conv.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate" data-testid={`text-conversation-preview-${conv.id}`}>
                        {conv.lastMessage}
                      </p>
                      {conv.unread && (
                        <span className="ml-2 bg-green-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center" data-testid={`badge-unread-${conv.id}`}>
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

          <div className="px-4 py-2 bg-gray-50">
            <h4 className="text-xs font-semibold text-gray-600 uppercase" data-testid="text-messages-header">Messages</h4>
          </div>

          {conversations
            .filter(conv => !conv.isPinned)
            .map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  activeConversation === conv.id ? 'bg-gray-100' : ''
                }`}
                data-testid={`conversation-item-${conv.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conv.avatar} />
                      <AvatarFallback>{conv.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 text-sm truncate" data-testid={`text-conversation-name-${conv.id}`}>
                        {conv.name}
                      </h4>
                      <span className="text-xs text-gray-500" data-testid={`text-conversation-time-${conv.id}`}>
                        {conv.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate" data-testid={`text-conversation-preview-${conv.id}`}>
                        {conv.lastMessage}
                      </p>
                      {conv.unread && (
                        <span className="ml-2 bg-green-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center" data-testid={`badge-unread-${conv.id}`}>
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </ScrollArea>
      </div>

      {/* Center - Chat Messages */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10" data-testid="avatar-active-chat">
                <AvatarImage src={activeConv?.avatar} />
                <AvatarFallback className="bg-red-500 text-white">{activeConv?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900" data-testid="text-active-chat-name">
                  {activeConv?.name}
                </h3>
                <p className="text-xs text-green-600" data-testid="text-active-chat-status">
                  Rashford is typing...
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-video-call">
                <Video className="h-5 w-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-voice-call">
                <Phone className="h-5 w-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-more-options">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Date Divider */}
            <div className="flex justify-center my-4">
              <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full" data-testid="text-date-divider">
                Today
              </span>
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                data-testid={`message-${message.id}`}
              >
                {!message.isOwn && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src="/api/placeholder/32/32" />
                    <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`flex flex-col ${message.isOwn ? 'items-end' : 'items-start'} max-w-xl`}>
                  {!message.isOwn && (
                    <span className="text-xs font-semibold text-gray-700 mb-1 px-1" data-testid={`text-sender-${message.id}`}>
                      {message.sender}
                    </span>
                  )}
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      message.isOwn
                        ? 'bg-blue-500 text-white rounded-tr-none'
                        : 'bg-white border border-gray-200 text-gray-900 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed" data-testid={`text-message-content-${message.id}`}>
                      {message.content}
                    </p>
                    {message.media && message.media.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {message.media.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt="attachment"
                            className="rounded-lg w-full h-32 object-cover"
                            data-testid={`image-attachment-${message.id}-${idx}`}
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <span className={`text-xs ${message.isOwn ? 'text-blue-100' : 'text-gray-500'}`} data-testid={`text-message-time-${message.id}`}>
                        {message.time}
                      </span>
                      {message.isOwn && (
                        <CheckCheck className={`h-4 w-4 ${message.read ? 'text-blue-200' : 'text-blue-300'}`} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Voice Message */}
            <div className="flex gap-3" data-testid="voice-message">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src="/api/placeholder/32/32" />
                <AvatarFallback>BF</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start max-w-xl">
                <span className="text-xs font-semibold text-gray-700 mb-1 px-1">Bruno Fernandes</span>
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg rounded-tl-none min-w-[300px]">
                  <div className="flex items-center gap-3">
                    <Button size="icon" variant="ghost" className="rounded-full bg-blue-500 text-white hover:bg-blue-600 w-8 h-8" data-testid="button-play-voice">
                      <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-white border-b-4 border-b-transparent ml-0.5"></div>
                    </Button>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full ${i < 15 ? 'bg-blue-500 h-4' : 'bg-gray-300 h-2'}`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-gray-500">08:34 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-add-attachment">
              <Plus className="h-5 w-5 text-gray-600" />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a message..."
                className="pr-20 rounded-full border-gray-300 bg-gray-50"
                data-testid="input-message"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-attach">
                  <Paperclip className="h-4 w-4 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-emoji">
                  <Smile className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
            <Button className="rounded-full bg-blue-500 hover:bg-blue-600 px-6" data-testid="button-send">
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Group Details */}
      {showGroupDetails && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900" data-testid="text-group-details-header">Detail group</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowGroupDetails(false)}
              className="rounded-full"
              data-testid="button-close-details"
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            {/* Group Avatar and Name */}
            <div className="p-6 text-center border-b border-gray-200">
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <Avatar className="w-24 h-24" data-testid="avatar-group">
                    <AvatarImage src="/api/placeholder/96/96" />
                    <AvatarFallback className="bg-red-500 text-white text-2xl">UF</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-lg text-gray-900" data-testid="text-group-name">
                United Family
              </h3>
            </div>

            {/* Description */}
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2" data-testid="text-descriptions-header">Descriptions</h4>
              <p className="text-sm text-gray-600 leading-relaxed" data-testid="text-group-description">
                Hey lads, tough game yesterday. Let's talk about what went wrong and how we can improve. #FGGEMY!! ❤️
              </p>
            </div>

            {/* Link Group */}
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2" data-testid="text-link-group-header">Link group</h4>
              <a href="#" className="text-sm text-blue-500 hover:underline" data-testid="link-group-url">
                https://ws.1401hoam/
              </a>
            </div>

            {/* Members */}
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3" data-testid="text-member-header">Member</h4>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2].map((i) => (
                    <Avatar key={i} className="w-8 h-8 border-2 border-white">
                      <AvatarImage src={`/api/placeholder/32/32`} />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-sm text-gray-600" data-testid="text-member-count">+20</span>
              </div>
            </div>

            {/* Media */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900" data-testid="text-media-header">Media</h4>
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-close-media">
                  <X className="h-4 w-4 text-gray-600" />
                </Button>
              </div>

              {/* Media Tabs */}
              <Tabs defaultValue="media" className="w-full mb-4">
                <TabsList className="w-full grid grid-cols-3 bg-gray-100">
                  <TabsTrigger value="media" className="text-xs" data-testid="tab-media">Media</TabsTrigger>
                  <TabsTrigger value="link" className="text-xs" data-testid="tab-link">Link</TabsTrigger>
                  <TabsTrigger value="docs" className="text-xs" data-testid="tab-docs">Docs</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Media Grid */}
              <div className="grid grid-cols-3 gap-2">
                {mediaGallery.map((item) => (
                  <div
                    key={item.id}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                    data-testid={`media-item-${item.id}`}
                  >
                    <img
                      src={item.url}
                      alt="media"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
