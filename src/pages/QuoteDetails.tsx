import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  MoreVertical, 
  CheckCircle, 
  Clock, 
  FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useNavigate, useParams } from 'react-router-dom';

const mockQuoteDetails = {
  id: 'QR-001',
  projectName: 'E-commerce Platform',
  serviceType: 'Web Development',
  status: 'In Progress',
  submittedDate: '2024-01-15',
  budget: '₦2,500,000',
  description: 'Develop a comprehensive e-commerce platform with advanced payment integration, robust user management, and a dynamic product catalog.',
  messages: [
    {
      id: 1,
      sender: 'Client',
      message: 'Looking for a modern e-commerce solution with seamless user experience.',
      timestamp: '2024-01-16T10:30:00Z',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: 2,
      sender: 'TekiPlanet Team',
      message: 'We recommend using React for frontend and Node.js for backend. Would you like to discuss the technical architecture?',
      timestamp: '2024-01-17T14:45:00Z',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    }
  ]
};

export default function QuoteDetails() {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(mockQuoteDetails.messages);
  const navigate = useNavigate();
  const { quoteId } = useParams<{ quoteId: string }>();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        sender: 'Client',
        message: newMessage,
        timestamp: new Date().toISOString(),
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-background"
    >
      <header className="sticky top-0 z-10 bg-background border-b p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/dashboard/quotes')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{mockQuoteDetails.projectName}</h1>
            <Badge 
              variant="outline" 
              className={`${getStatusColor(mockQuoteDetails.status)} text-xs`}
            >
              {mockQuoteDetails.status}
            </Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit Quote</DropdownMenuItem>
            <DropdownMenuItem>Close Quote</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex-grow overflow-y-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quote Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span>Service: {mockQuoteDetails.serviceType}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>Submitted: {mockQuoteDetails.submittedDate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
              <span>Budget: {mockQuoteDetails.budget}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{mockQuoteDetails.description}</p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Conversation</h2>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start space-x-3 ${
                  msg.sender === 'Client' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <img 
                  src={msg.avatar} 
                  alt={msg.sender} 
                  className="h-8 w-8 rounded-full object-cover" 
                />
                <div 
                  className={`p-3 rounded-lg max-w-[70%] ${
                    msg.sender === 'Client' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  <p>{msg.message}</p>
                  <small className="text-xs opacity-70 block mt-1">
                    {new Date(msg.timestamp).toLocaleString()}
                  </small>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-background border-t p-4 flex space-x-2">
        <Button variant="ghost" size="icon">
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input 
          placeholder="Type your message..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow"
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button 
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Send className="mr-2 h-4 w-4" /> Send
        </Button>
      </div>
    </motion.div>
  );
}
