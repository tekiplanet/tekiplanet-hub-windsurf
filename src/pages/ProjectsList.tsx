import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  PlusCircle,
  Server,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const mockProjects = [
  {
    id: 'PRJ-001',
    name: 'Banking App Redesign',
    client: 'FinTech Solutions',
    status: 'In Progress',
    startDate: '2024-01-15',
    endDate: '2024-03-30',
    progress: 65,
    budget: '₦7,500,000'
  },
  {
    id: 'PRJ-002',
    name: 'E-commerce Platform',
    client: 'Global Retail Inc.',
    status: 'Completed',
    startDate: '2023-11-01',
    endDate: '2024-01-10',
    progress: 100,
    budget: '₦5,200,000'
  },
  {
    id: 'PRJ-003',
    name: 'Corporate Website',
    client: 'Tech Innovations Ltd',
    status: 'Pending',
    startDate: '2024-02-01',
    endDate: '2024-04-15',
    progress: 20,
    budget: '₦3,800,000'
  }
];

export default function ProjectsListPage() {
  return (
    // <Dashboard>
      <ProjectsList />
    // </Dashboard>
  );
}

function ProjectsList() {
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

  const filteredProjects = mockProjects.filter(project => 
    (filterStatus ? project.status === filterStatus : true) &&
    (project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     project.client.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-4 md:p-6 bg-background"
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate('/dashboard/projects/new')}
        >
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex space-x-2 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search projects..." 
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
        {filteredProjects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No projects found
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader 
                className="flex flex-row items-center justify-between space-y-0 p-4 pb-0"
                onClick={() => navigate(`/dashboard/projects/${project.id}`)}
              >
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-lg leading-none tracking-tight">
                    {project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {project.client}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(project.status)} text-xs`}
                >
                  {project.status}
                </Badge>
              </CardHeader>
              <CardContent 
                className="p-4 pt-2 cursor-pointer"
                onClick={() => navigate(`/dashboard/projects/${project.id}`)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Server className="h-4 w-4" />
                    <span>{project.startDate} - {project.endDate}</span>
                  </div>
                  <span className="font-bold text-primary">{project.budget}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className={`h-2 rounded-full ${
                      project.status === 'Completed' 
                        ? 'bg-green-500' 
                        : project.status === 'In Progress' 
                        ? 'bg-yellow-500' 
                        : 'bg-blue-500'
                    }`} 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
