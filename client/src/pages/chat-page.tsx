import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Plus, Users, Search, Pin } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group';
  isPinned: boolean;
  lastMessageAt?: string;
  participants: ChatParticipant[];
}

interface ChatParticipant {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  messageType: 'text' | 'image' | 'pdf' | 'doc' | 'link' | 'file';
  content: string;
  createdAt: string;
  attachments?: ChatAttachment[];
}

interface ChatAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connected - authentication handled via session');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'authenticated') {
        console.log('WebSocket authenticated:', data.employeeName);
      } else if (data.type === 'new_message' && selectedRoom && data.roomId === selectedRoom.id) {
        setMessages(prev => [...prev, data.message]);
      }
    };

    setWs(websocket);
    return () => websocket.close();
  }, [user, selectedRoom]);

  useEffect(() => {
    loadRooms();
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  const loadRooms = async () => {
    try {
      const response = await apiRequest('GET', '/api/chat/rooms');
      const data = await response.json();
      setRooms(data.rooms || []);
      const teamChat = data.rooms?.find((r: ChatRoom) => r.isPinned && r.name === 'Team Chat');
      if (teamChat) setSelectedRoom(teamChat);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await apiRequest('GET', '/api/chat/employees');
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const response = await apiRequest('GET', `/api/chat/rooms/${roomId}/messages`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    const messageContent = newMessage;
    setNewMessage('');

    try {
      const response = await apiRequest('POST', `/api/chat/rooms/${selectedRoom.id}/messages`, {
        content: messageContent,
        messageType: 'text'
      });
      const data = await response.json();

      // Add message to local state immediately (server will broadcast to others)
      setMessages(prev => [...prev, data.message]);
      loadRooms();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedRoom) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      const messageResponse = await apiRequest('POST', `/api/chat/rooms/${selectedRoom.id}/messages/attachment`, data);
      const messageData = await messageResponse.json();

      // Add message to local state immediately (server will broadcast to others)
      setMessages(prev => [...prev, messageData.message]);
      loadRooms();
      toast({ title: "Success", description: "File uploaded" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload file", variant: "destructive" });
    }
  };

  const handleCreateChat = async (type: 'direct' | 'group') => {
    if (selectedEmployees.length === 0) {
      toast({ title: "Error", description: "Select at least one person", variant: "destructive" });
      return;
    }

    const otherPerson = employees.find(e => e.id === selectedEmployees[0]);
    const chatName = type === 'direct' ? (otherPerson?.name || 'Direct Chat') : 
      `Group - ${selectedEmployees.map(id => employees.find(e => e.id === id)?.name).join(', ')}`;

    try {
      const response = await apiRequest('POST', '/api/chat/rooms', {
        name: chatName,
        type,
        participantIds: selectedEmployees
      });

      const data = await response.json();
      toast({ title: "Success", description: "Chat created" });
      setIsNewChatOpen(false);
      setSelectedEmployees([]);
      loadRooms();
      setSelectedRoom(data.room);
    } catch (error) {
      toast({ title: "Error", description: "Failed to create chat", variant: "destructive" });
    }
  };

  const getOtherParticipantName = (room: ChatRoom) => {
    if (room.type === 'group') return room.name;
    const otherParticipant = room.participants.find(p => p.participantId !== user?.data.id);
    return otherParticipant?.participantName || room.name;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderMessage = (message: ChatMessage) => {
    const isOwnMessage = message.senderId === user?.data.id;

    return (
      <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-end gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
          {!isOwnMessage && (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-500 text-white text-xs">
                {getInitials(message.senderName)}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            {!isOwnMessage && <div className="text-xs text-gray-600 mb-1 px-2">{message.senderName}</div>}
            <div className={`rounded-lg px-4 py-2 ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
              {message.messageType === 'text' ? (
                <p className="text-sm break-words">{message.content}</p>
              ) : (
                <div>
                  {message.messageType === 'image' && message.attachments?.[0] && (
                    <a href={message.attachments[0].fileUrl} target="_blank" rel="noopener noreferrer">
                      <img src={message.attachments[0].fileUrl} alt={message.attachments[0].fileName} className="max-w-[300px] max-h-[300px] rounded-lg mb-2" />
                    </a>
                  )}
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    <a href={message.attachments?.[0]?.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                      {message.content}
                    </a>
                  </div>
                </div>
              )}
              <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                {formatTime(message.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><div className="text-lg">Loading chat...</div></div>;
  }

  const filteredRooms = rooms.filter(room => getOtherParticipantName(room).toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Chats</h2>
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost"><Plus className="h-5 w-5" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Chat</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {employees.filter(emp => emp.id !== user?.data.id).map(employee => (
                        <div key={employee.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                          <Checkbox
                            id={employee.id}
                            checked={selectedEmployees.includes(employee.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedEmployees([...selectedEmployees, employee.id]);
                              } else {
                                setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                              }
                            }}
                          />
                          <Label htmlFor={employee.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-500 text-white text-xs">
                                  {getInitials(employee.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{employee.name}</div>
                                <div className="text-xs text-gray-500">{employee.role}</div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Button onClick={() => handleCreateChat('direct')} disabled={selectedEmployees.length !== 1} className="flex-1">
                      Direct Chat
                    </Button>
                    <Button onClick={() => handleCreateChat('group')} disabled={selectedEmployees.length === 0} className="flex-1" variant="outline">
                      <Users className="h-4 w-4 mr-2" />Group
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search chats..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredRooms.map(room => (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${selectedRoom?.id === room.id ? 'bg-blue-50' : ''}`}
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-500 text-white">
                    {room.type === 'group' ? <Users className="h-6 w-6" /> : getInitials(getOtherParticipantName(room))}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm truncate flex items-center gap-1">
                      {room.isPinned && <Pin className="h-3 w-3 text-blue-500" />}
                      {getOtherParticipantName(room)}
                    </h3>
                    {room.lastMessageAt && <span className="text-xs text-gray-500">{formatDate(room.lastMessageAt)}</span>}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {room.type === 'group' ? `${room.participants.length} participants` : 'Direct message'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-500 text-white">
                    {selectedRoom.type === 'group' ? <Users className="h-5 w-5" /> : getInitials(getOtherParticipantName(selectedRoom))}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold flex items-center gap-1">
                    {selectedRoom.isPinned && <Pin className="h-4 w-4 text-blue-500" />}
                    {getOtherParticipantName(selectedRoom)}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedRoom.type === 'group' ? `${selectedRoom.participants.length} participants` : 'Online'}
                  </p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {messages.map(message => renderMessage(message))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={handleFileUpload} />
                <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
