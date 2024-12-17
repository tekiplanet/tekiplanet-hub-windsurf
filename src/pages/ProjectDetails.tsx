import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MoreVertical, 
  FileText, 
  Server, 
  CheckCircle, 
  Clock, 
  Users, 
  FileUp, 
  CreditCard,
  Download,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const mockProjectDetails = {
  id: 'PRJ-001',
  name: 'Banking App Redesign',
  client: 'FinTech Solutions',
  status: 'In Progress',
  startDate: '2024-01-15',
  endDate: '2024-03-30',
  progress: 65,
  budget: '₦7,500,000',
  description: 'Comprehensive redesign of the mobile banking application to enhance user experience, improve security, and modernize the interface.',
  stages: [
    { name: 'Requirements Gathering', status: 'Completed', date: '2024-01-20' },
    { name: 'UI/UX Design', status: 'In Progress', date: '2024-02-05' },
    { name: 'Frontend Development', status: 'Pending', date: '2024-02-20' },
    { name: 'Backend Development', status: 'Pending', date: '2024-03-01' },
    { name: 'Testing', status: 'Pending', date: '2024-03-15' }
  ],
  team: [
    { name: 'John Doe', role: 'Project Manager', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { name: 'Jane Smith', role: 'Lead Designer', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { name: 'Mike Johnson', role: 'Senior Developer', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' }
  ],
  files: [
    { name: 'Project_Proposal.pdf', size: '2.3 MB', uploadDate: '2024-01-15' },
    { name: 'UI_Design_v1.sketch', size: '15.7 MB', uploadDate: '2024-02-05' }
  ],
  invoices: [
    { 
      id: 'INV-001', 
      amount: '₦3,500,000', 
      status: 'Paid', 
      date: '2024-01-30', 
      description: 'Initial Project Milestone Payment' 
    }
  ]
};

const mockInvoices = [
  {
    id: 'INV-001',
    projectName: 'E-commerce Platform Development',
    amount: '₦2,500,000',
    date: '2024-01-15',
    status: 'Paid',
    downloadLink: '/invoices/INV-001.pdf'
  },
  {
    id: 'INV-002',
    projectName: 'Mobile App Design',
    amount: '₦1,200,000',
    date: '2024-02-20',
    status: 'Pending',
    downloadLink: '/invoices/INV-002.pdf'
  }
];

export default function ProjectDetailsPage() {
  return (
    // <Dashboard>
      <ProjectDetails />
    // </Dashboard>
  );
}

function ProjectDetails() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePayInvoice = (invoice: typeof mockInvoices[0]) => {
    // Simulate payment process
    alert(`Proceeding to pay invoice ${invoice.id}`);
    // TODO: Implement actual payment logic
  };

  const downloadInvoice = (downloadLink: string) => {
    // In a real app, this would trigger a file download
    window.open(downloadLink, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-background"
    >
      <header className="sticky top-0 z-10 bg-background border-b p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-bold">{mockProjectDetails.name}</h1>
            <Badge 
              variant="outline" 
              className={`${getStatusColor(mockProjectDetails.status)} text-xs`}
            >
              {mockProjectDetails.status}
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
            <DropdownMenuItem>Edit Project</DropdownMenuItem>
            <DropdownMenuItem>Close Project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="flex-grow overflow-y-auto"
      >
        <TabsList className="sticky top-0 z-10 bg-muted/50 border-b grid grid-cols-5 gap-1 px-1 py-1 h-auto rounded-none">
          <TabsTrigger 
            value="overview" 
            className="text-xs px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-colors"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="stages" 
            className="text-xs px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-colors"
          >
            Stages
          </TabsTrigger>
          <TabsTrigger 
            value="team" 
            className="text-xs px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-colors"
          >
            Team
          </TabsTrigger>
          <TabsTrigger 
            value="files" 
            className="text-xs px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-colors"
          >
            Files
          </TabsTrigger>
          <TabsTrigger 
            value="invoices" 
            className="text-xs px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-colors"
          >
            Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="p-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Server className="h-5 w-5 text-muted-foreground" />
                <span>Client: {mockProjectDetails.client}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>Duration: {mockProjectDetails.startDate} - {mockProjectDetails.endDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
                <span>Budget: {mockProjectDetails.budget}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className={`h-2.5 rounded-full ${
                    mockProjectDetails.status === 'Completed' 
                      ? 'bg-green-500' 
                      : mockProjectDetails.status === 'In Progress' 
                      ? 'bg-yellow-500' 
                      : 'bg-blue-500'
                  }`} 
                  style={{ width: `${mockProjectDetails.progress}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{mockProjectDetails.description}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages" className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Project Stages</h2>
          {mockProjectDetails.stages.map((stage, index) => (
            <motion.div 
              key={stage.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex-grow">
                <h3 className="font-medium">{stage.name}</h3>
                <span className="text-sm text-muted-foreground">{stage.date}</span>
              </div>
              <Badge 
                variant="outline" 
                className={`${getStatusColor(stage.status)} text-xs`}
              >
                {stage.status}
              </Badge>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="team" className="p-4 space-y-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Users className="mr-2 h-5 w-5" /> Project Team
          </h2>
          {mockProjectDetails.team.map((member) => (
            <div 
              key={member.name} 
              className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg"
            >
              <img 
                src={member.avatar} 
                alt={member.name} 
                className="h-10 w-10 rounded-full object-cover" 
              />
              <div className="flex-grow">
                <h3 className="font-medium">{member.name}</h3>
                <span className="text-sm text-muted-foreground">{member.role}</span>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="files" className="p-4 space-y-4">
          <h2 className="text-lg font-semibold flex items-center">
            <FileUp className="mr-2 h-5 w-5" /> Project Files
          </h2>
          {mockProjectDetails.files.map((file) => (
            <div 
              key={file.name} 
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">{file.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    {file.size} • Uploaded {file.uploadDate}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm">Download</Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="invoices" className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInvoices.map((invoice) => (
                  <div 
                    key={invoice.id} 
                    className="border rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4"
                  >
                    <div className="flex-grow w-full">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                        <h3 className="font-semibold text-sm sm:text-base flex-grow">{invoice.projectName}</h3>
                        <Badge 
                          variant="outline"
                          className={`
                            text-xs 
                            ${invoice.status === 'Paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'}
                          `}
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Invoice:</span>
                          <p className="font-medium">{invoice.id}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amount:</span>
                          <p className="font-bold">{invoice.amount}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Date:</span>
                          <p>{invoice.date}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => downloadInvoice(invoice.downloadLink)}
                      >
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                      {invoice.status === 'Pending' && (
                        <Button 
                          size="sm"
                          className="flex-1 sm:flex-none"
                          onClick={() => handlePayInvoice(invoice)}
                        >
                          <CreditCard className="mr-2 h-4 w-4" /> Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
