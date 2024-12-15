import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { 
  DollarSign, ShoppingBag, Users, Briefcase, Zap, 
  Calendar, ChevronRight, BookOpen, Gift 
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

// Mock Data (to be replaced with actual backend data)
const businessProfile = {
  name: "TechNova Solutions",
  avatar: "https://ui-avatars.com/api/?name=TechNova+Solutions",
  activeSubscription: "Pro Workspace",
  subscriptionDaysRemaining: 22
};

const serviceRequests = [
  {
    id: "1",
    title: "Cloud Migration Consultation",
    progress: 65,
    status: "In Progress"
  },
  {
    id: "2", 
    title: "Cybersecurity Assessment",
    progress: 30,
    status: "Pending"
  }
];

const promotions = [
  {
    id: "1",
    title: "50% Off Enterprise Gadgets",
    description: "Special discount for business owners",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4"
  },
  {
    id: "2", 
    title: "Free Consultation Week",
    description: "Book your strategy session now",
    image: "https://images.unsplash.com/photo-1552664730-4d5749dd1e3a"
  }
];

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const quickActions = [
    {
      icon: <Briefcase className="h-5 w-5" />,
      title: "Request a Service",
      onClick: () => navigate('/dashboard/services')
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "Book Workstation",
      onClick: () => navigate('/dashboard/workspace/book')
    },
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      title: "Shop Gadgets",
      onClick: () => navigate('/dashboard/gadgets')
    },
    {
      icon: <Gift className="h-5 w-5" />,
      title: "Referral Dashboard",
      onClick: () => navigate('/dashboard/referrals')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src={businessProfile.avatar} />
            <AvatarFallback>TN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome, {businessProfile.name}! 🚀
            </h1>
            <p className="text-sm text-muted-foreground">
              {businessProfile.activeSubscription} | {businessProfile.subscriptionDaysRemaining} days remaining
            </p>
          </div>
        </div>
      </motion.div>

      {/* Business Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            title: "Total Revenue", 
            value: "$45,231", 
            icon: <DollarSign className="h-4 w-4 text-primary" />,
            trend: "+20.1% this month" 
          },
          { 
            title: "Active Services", 
            value: "12", 
            icon: <ShoppingBag className="h-4 w-4 text-primary" />,
            trend: "3 pending" 
          },
          { 
            title: "Clients", 
            value: "24", 
            icon: <Users className="h-4 w-4 text-primary" />,
            trend: "+4 this week" 
          },
          { 
            title: "Performance", 
            value: "+573", 
            icon: <Zap className="h-4 w-4 text-primary" />,
            trend: "Growth rate" 
          }
        ].map((metric, index) => (
          <Card key={metric.title}>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex justify-between items-center mb-2">
                {metric.icon}
                <span className="text-xs text-muted-foreground">{metric.title}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{metric.value}</h3>
                <p className="text-xs text-primary">{metric.trend}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Service Management & Promotions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Service Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Current Services</CardTitle>
            <CardDescription>Ongoing and pending service requests</CardDescription>
          </CardHeader>
          <CardContent>
            {serviceRequests.map((service) => (
              <div key={service.id} className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{service.title}</span>
                  <span className="text-xs text-muted-foreground">{service.status}</span>
                </div>
                <Progress value={service.progress} className="h-2" />
              </div>
            ))}
            <Button variant="secondary" className="w-full mt-4">
              View All Services
            </Button>
          </CardContent>
        </Card>

        {/* Promotions Carousel */}
        <Card>
          <CardHeader>
            <CardTitle>Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <Carousel>
              <CarouselContent>
                {promotions.map((promo) => (
                  <CarouselItem key={promo.id}>
                    <div className="relative">
                      <img 
                        src={promo.image} 
                        alt={promo.title} 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-lg font-bold">{promo.title}</h3>
                        <p className="text-sm">{promo.description}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Button 
            key={action.title}
            variant="outline" 
            className="flex flex-col h-24 justify-center items-center space-y-2"
            onClick={action.onClick}
          >
            {action.icon}
            <span className="text-xs">{action.title}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}