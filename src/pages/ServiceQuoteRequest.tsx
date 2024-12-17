import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/axios';
import PagePreloader from '@/components/ui/PagePreloader';
import { motion } from 'framer-motion';
import Dashboard from './Dashboard';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface ServiceQuoteField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface ServiceDetails {
  id: string;
  name: string;
  description: string;
  short_description: string;
  category: {
    id: string;
    name: string;
  };
}

const ServiceQuoteRequest: React.FC = () => {
  const { categoryId, serviceId } = useParams<{ categoryId: string; serviceId: string }>();
  const navigate = useNavigate();
  const [serviceDetails, setServiceDetails] = useState<ServiceDetails | null>(null);
  const [quoteFields, setQuoteFields] = useState<ServiceQuoteField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceQuoteDetails = async () => {
      try {
        const response = await apiClient.get(`/services/${serviceId}/quote-details`);
        
        setServiceDetails(response.data.service);
        setQuoteFields(response.data.quote_fields);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching service quote details:', err);
        setError('Failed to fetch service quote details');
        setIsLoading(false);
      }
    };

    fetchServiceQuoteDetails();
  }, [serviceId]);

  // Dynamically generate form schema based on quote fields
  const generateFormSchema = () => {
    const schemaFields: { [key: string]: z.ZodType } = {};
    
    quoteFields.forEach(field => {
      let fieldSchema: z.ZodType;
      
      switch(field.type) {
        case 'text':
          fieldSchema = field.required 
            ? z.string().min(1, `${field.name} is required`) 
            : z.string().optional();
          break;
        case 'select':
          fieldSchema = field.required 
            ? z.string().min(1, `Please select a ${field.name}`) 
            : z.string().optional();
          break;
        case 'email':
          fieldSchema = field.required 
            ? z.string().email(`Invalid ${field.name}`) 
            : z.string().email(`Invalid ${field.name}`).optional();
          break;
        case 'textarea':
          fieldSchema = field.required 
            ? z.string().min(1, `${field.name} is required`) 
            : z.string().optional();
          break;
        default:
          fieldSchema = field.required 
            ? z.string().min(1, `${field.name} is required`) 
            : z.string().optional();
      }
      
      schemaFields[field.id] = fieldSchema;
    });

    return z.object(schemaFields);
  };

  const formSchema = generateFormSchema();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: quoteFields.reduce((acc, field) => {
      acc[field.id] = '';
      return acc;
    }, {} as any)
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // TODO: Implement quote request submission
    console.log('Quote Request:', values);
    // Integrate with backend service
  };

  if (isLoading) {
    return <PagePreloader />;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  return (
    <Dashboard>
      <div className="container mx-auto p-4 max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-4">{serviceDetails?.name} Quote Request</h1>
          <p className="mb-6">{serviceDetails?.description}</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {quoteFields.map((field) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={field.id}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>
                        {field.name} {field.required && <span className="text-red-500">*</span>}
                      </FormLabel>
                      {field.type === 'text' && (
                        <FormControl>
                          <Input 
                            type="text" 
                            id={field.id} 
                            name={field.id} 
                            required={field.required} 
                            {...formField} 
                          />
                        </FormControl>
                      )}

                      {field.type === 'select' && field.options && (
                        <FormControl>
                          <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${field.name}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      )}

                      {field.type === 'email' && (
                        <FormControl>
                          <Input 
                            type="email" 
                            id={field.id} 
                            name={field.id} 
                            required={field.required} 
                            {...formField} 
                          />
                        </FormControl>
                      )}

                      {field.type === 'textarea' && (
                        <FormControl>
                          <Textarea 
                            id={field.id} 
                            name={field.id} 
                            required={field.required} 
                            {...formField} 
                          />
                        </FormControl>
                      )}

                      {/* Add more input types as needed */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <Button type="submit" className="w-full">
                Submit Quote Request
              </Button>
            </form>
          </Form>
        </motion.div>
      </div>
    </Dashboard>
  );
};

export default ServiceQuoteRequest;