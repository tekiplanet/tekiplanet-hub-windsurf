import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MoreVertical, 
  CheckCircle, 
  Clock, 
  FileText,
  MessageCircle,
  Info,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useNavigate, useParams } from 'react-router-dom';

const mockQuoteDetails = {
  id: 'QR-001',
  projectName: 'E-commerce Platform Development',
  serviceType: 'Web Development',
  status: 'In Progress',
  submittedDate: '2024-01-15',
  budget: '₦2,500,000',
  description: 'Comprehensive e-commerce platform with modern features including responsive design, payment gateway integration, admin dashboard, and product management system.',
  messages: [
    {
      id: 1,
      sender: 'Client',
      message: 'Hi there, I\'m interested in developing an e-commerce platform. Can we discuss the project scope?',
      timestamp: '2024-01-16T10:30:00Z',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: 2,
      sender: 'TekiPlanet Team',
      message: 'Hello! Certainly. We specialize in creating robust e-commerce solutions. What specific features are you looking for?',
      timestamp: '2024-01-16T10:35:00Z',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      id: 3,
      sender: 'Client',
      message: 'I need a platform that supports multiple payment gateways, has a responsive design, and includes an admin dashboard.',
      timestamp: '2024-01-16T10:40:00Z',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: 4,
      sender: 'TekiPlanet Team',
      message: 'Great requirements! We recommend using Stripe and Paystack for payment integration. Our standard package includes responsive design and a comprehensive admin panel.',
      timestamp: '2024-01-16T10:45:00Z',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      id: 5,
      sender: 'Client',
      message: 'Can you provide an estimated timeline and budget for this project?',
      timestamp: '2024-01-16T10:50:00Z',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: 6,
      sender: 'TekiPlanet Team',
      message: 'Based on the features you\'ve described, we estimate a 12-week development cycle. The preliminary budget is around ₦2,500,000. Would you like to schedule a detailed consultation?',
      timestamp: '2024-01-16T10:55:00Z',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      id: 7,
      sender: 'Client',
      message: 'That sounds reasonable. What technologies do you plan to use for the backend?',
      timestamp: '2024-01-16T11:00:00Z',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: 8,
      sender: 'TekiPlanet Team',
      message: 'We typically use Node.js with Express for the backend, paired with React for the frontend. We can also integrate with cloud services like AWS for scalability.',
      timestamp: '2024-01-16T11:05:00Z',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      id: 9,
      sender: 'Client',
      message: 'Sounds good. Can we set up a video call to discuss the details further?',
      timestamp: '2024-01-16T11:10:00Z',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: 10,
      sender: 'TekiPlanet Team',
      message: 'Absolutely! I\'ll send a calendar invite for a 30-minute consultation next week. Looking forward to bringing your e-commerce vision to life!',
      timestamp: '2024-01-16T11:15:00Z',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      id: 11,
      sender: 'Client',
      message: 'Great! I\'m particularly interested in understanding how we can customize the product catalog and manage inventory.',
      timestamp: '2024-01-16T11:20:00Z',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: 12,
      sender: 'TekiPlanet Team',
      message: 'Our platform includes a robust inventory management system with real-time tracking, automated low-stock alerts, and easy product variation management.',
      timestamp: '2024-01-16T11:25:00Z',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      id: 13,
      sender: 'Client',
      message: 'Do you support integration with existing ERP systems?',
      timestamp: '2024-01-16T11:30:00Z',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: 14,
      sender: 'TekiPlanet Team',
      message: 'Yes, we provide custom API integrations with major ERP systems like SAP, Oracle, and Microsoft Dynamics. We\'ll ensure seamless data synchronization.',
      timestamp: '2024-01-16T11:35:00Z',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    }
  ]
};

export default function QuoteDetails() {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(mockQuoteDetails.messages);
  const [activeTab, setActiveTab] = useState('details');
  const navigate = useNavigate();
  const { quoteId } = useParams<{ quoteId: string }>();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const messagesContainerRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        sender: 'You',
        message: newMessage,
        timestamp: new Date().toISOString(),
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full"
    >
      <header className="sticky top-0 z-10 bg-background border-b p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-bold">{mockQuoteDetails.projectName}</h1>
            <Badge 
              variant="outline" 
              className={`${getStatusColor(mockQuoteDetails.status)} text-xs mt-1`}
            >
              {mockQuoteDetails.status}
            </Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit Quote</DropdownMenuItem>
            <DropdownMenuItem>Download PDF</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">Cancel Quote</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="flex-grow overflow-hidden"
      >
        <TabsList className="sticky top-0 z-10 bg-muted/50 border-b grid grid-cols-3 gap-1 px-1 py-1 h-auto rounded-none">
          <TabsTrigger 
            value="details" 
            className="text-xs px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-colors"
          >
            <Info className="h-4 w-4 mr-1" /> Details
          </TabsTrigger>
          <TabsTrigger 
            value="description" 
            className="text-xs px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-colors"
          >
            <FileText className="h-4 w-4 mr-1" /> Description
          </TabsTrigger>
          <TabsTrigger 
            value="conversation" 
            className="text-xs px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-colors"
          >
            <MessageCircle className="h-4 w-4 mr-1" /> Conversation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="p-4 space-y-4">
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
        </TabsContent>

        <TabsContent value="description" className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{mockQuoteDetails.description}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent 
          value="conversation" 
          className="flex flex-col h-[calc(100vh-200px)] overflow-hidden"
        >
          <div 
            ref={messagesContainerRef}
            className="flex-grow overflow-y-auto space-y-4 p-4 pb-20 custom-scrollbar"
          >
            {messages.map((msg, index) => (
              <div 
                key={msg.id} 
                className={`flex items-start space-x-2 ${
                  msg.sender === 'Client' || msg.sender === 'TekiPlanet Team' 
                    ? 'flex-row' 
                    : 'flex-row-reverse space-x-reverse'
                }`}
              >
                {(msg.sender === 'Client' || msg.sender === 'TekiPlanet Team') && (
                  <img 
                    src={msg.avatar} 
                    alt={msg.sender} 
                    className="h-8 w-8 rounded-full object-cover shrink-0" 
                  />
                )}
                <div 
                  className={`
                    max-w-[80%] p-3 rounded-2xl 
                    ${msg.sender === 'You' 
                      ? 'bg-primary text-primary-foreground rounded-br-none' 
                      : 'bg-muted text-foreground rounded-bl-none'}
                    shadow-sm
                  `}
                >
                  <p className="text-sm">{msg.message}</p>
                  <span className="text-xs opacity-60 block mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          <div className="sticky bottom-0 bg-background border-t p-4 flex space-x-2">
            <Input 
              placeholder="Type a message..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="icon"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
