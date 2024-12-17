import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/axios';  
import { 
  Code, 
  Shield, 
  Briefcase, 
  ArrowRight, 
  Smartphone, 
  Palette 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import PagePreloader from '@/components/ui/PagePreloader';

// Helper function to map icon names to Lucide icons
const getLucideIcon = (iconName: string) => {
  const iconMap = {
    'Code': Code,
    'Shield': Shield,
    'Briefcase': Briefcase,
    'Smartphone': Smartphone,
    'Palette': Palette,
    default: Code // Fallback icon
  };

  return iconMap[iconName] || iconMap.default;
};

interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  subServices: {
    id: string;
    title: string;
    description?: string;
  }[];
}

const servicesImages = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
  'https://images.unsplash.com/photo-1522252234503-e356532cafd5',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4'
];

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceCategories = async () => {
      try {
        const response = await apiClient.get('/services/categories');
        
        // Ensure response.data is an array
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.data || []);
        
        setServiceCategories(categoriesData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching service categories:', err);
        setError(err.response?.data?.message || 'Failed to fetch service categories');
        setIsLoading(false);
      }
    };

    fetchServiceCategories();
  }, []);

  const handleServiceSelect = (categoryId: string, serviceId: string) => {
    navigate(`/dashboard/services/quote/${categoryId}/${serviceId}`);
  };

  if (isLoading) {
    return <PagePreloader />;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  if (!serviceCategories || serviceCategories.length === 0) {
    return <div className="text-center py-8">No services available</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Hero Section with Carousel */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="relative h-64 md:h-96 w-full">
          <img 
            src={servicesImages[0]} 
            alt="Service" 
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
      </motion.div>

      {/* Services Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {serviceCategories.map((category) => {
          const ServiceIcon = getLucideIcon(category.icon);
          return (
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
                <ServiceIcon className="h-12 w-12 text-primary" />
                <div>
                  <CardTitle>{category.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
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
          );
        })}
      </motion.div>
    </div>
  );
};

export default ServicesPage;
