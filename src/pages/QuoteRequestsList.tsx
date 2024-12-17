import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  PlusCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// Mock data for quote requests
const mockQuoteRequests = [
  {
    id: 'QR-001',
    projectName: 'E-commerce Platform',
    serviceType: 'Web Development',
    status: 'In Progress',
    submittedDate: '2024-01-15',
    budget: '₦2,500,000'
  },
  {
    id: 'QR-002',
    projectName: 'Mobile Banking App',
    serviceType: 'App Development',
    status: 'Pending',
    submittedDate: '2024-02-03',
    budget: '₦5,000,000'
  },
  {
    id: 'QR-003',
    projectName: 'Corporate Website Redesign',
    serviceType: 'Web Development',
    status: 'Completed',
    submittedDate: '2024-01-10',
    budget: '₦1,200,000'
  }
];

export default function QuoteRequestsListPage() {
  return (
    <QuoteRequestsList />
  );
}

function QuoteRequestsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = mockQuoteRequests.filter(request => 
    (filterStatus ? request.status === filterStatus : true) &&
    (request.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     request.serviceType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-4 md:p-6 bg-background"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Quote Requests</h1>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate('/dashboard/services/quote/new')}
        >
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search quotes..." 
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilterStatus(null)}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('Pending')}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('In Progress')}>
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('Completed')}>
              Completed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No quote requests found
          </div>
        ) : (
          filteredRequests.map((request) => (
            <Card 
              key={request.id} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/dashboard/quotes/${request.id}`)}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{request.projectName}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {request.serviceType}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(request.status)} text-xs`}
                    >
                      {request.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Submitted: {request.submittedDate}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-primary">{request.budget}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">Cancel</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
