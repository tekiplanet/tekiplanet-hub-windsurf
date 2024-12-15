import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, 
  Shield, 
  Briefcase, 
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useNavigate } from 'react-router-dom';

const serviceCategories = [
  {
    id: 'software-engineering',
    title: 'Software Engineering',
    icon: <Code className="h-12 w-12 text-primary" />,
    description: 'Custom web and mobile app development solutions',
    subServices: [
      { 
        id: 'web-development', 
        title: 'Web Development', 
        description: 'Create stunning, responsive websites' 
      },
      { 
        id: 'app-development', 
        title: 'App Development', 
        description: 'Mobile apps for iOS and Android' 
      },
      { 
        id: 'maintenance', 
        title: 'Maintenance', 
        description: 'Ongoing support and updates' 
      }
    ]
  },
  {
    id: 'cyber-security',
    title: 'Cyber Security',
    icon: <Shield className="h-12 w-12 text-primary" />,
    description: 'Comprehensive security assessments and solutions',
    subServices: [
      { 
        id: 'security-audit', 
        title: 'Security Audit', 
        description: 'Thorough vulnerability assessment' 
      },
      { 
        id: 'penetration-testing', 
        title: 'Penetration Testing', 
        description: 'Identify and mitigate security risks' 
      }
    ]
  },
  {
    id: 'it-consulting',
    title: 'IT Consulting',
    icon: <Briefcase className="h-12 w-12 text-primary" />,
    description: 'Expert guidance for your technology strategy',
    subServices: [
      { 
        id: 'expert-session', 
        title: 'Expert Consultation', 
        description: 'One-on-one strategic technology advice' 
      }
    ]
  }
];

const servicesImages = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
  'https://images.unsplash.com/photo-1522252234503-e356532cafd5',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4'
];

export default function ServicesPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleServiceSelect = (categoryId: string, serviceId: string) => {
    switch(categoryId) {
      case 'software-engineering':
        navigate(`/dashboard/services/quote/software-engineering/${serviceId}`);
        break;
      case 'cyber-security':
        navigate(`/dashboard/services/quote/cyber-security/${serviceId}`);
        break;
      case 'it-consulting':
        navigate('/dashboard/services/consulting');
        break;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Hero Section with Carousel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Carousel>
          <CarouselContent>
            {servicesImages.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative h-64 md:h-96 w-full">
                  <img 
                    src={image} 
                    alt={`Service ${index + 1}`} 
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-lg" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h2 className="text-2xl md:text-4xl font-bold">
                      Transforming Your Digital Vision
                    </h2>
                    <p className="text-sm md:text-base mt-2">
                      Innovative Solutions for Modern Businesses
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </motion.div>

      {/* Services Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {serviceCategories.map((category) => (
          <Card 
            key={category.id}
            className={`hover:shadow-lg transition-all duration-300 ${
              activeCategory === category.id 
                ? 'border-primary' 
                : 'border-transparent'
            }`}
            onMouseEnter={() => setActiveCategory(category.id)}
            onMouseLeave={() => setActiveCategory(null)}
          >
            <CardHeader className="flex flex-row items-center space-x-4">
              {category.icon}
              <div>
                <CardTitle>{category.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.subServices.map((service) => (
                  <Button 
                    key={service.id}
                    variant="outline" 
                    className="w-full justify-between"
                    onClick={() => handleServiceSelect(category.id, service.id)}
                  >
                    <span>{service.title}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
