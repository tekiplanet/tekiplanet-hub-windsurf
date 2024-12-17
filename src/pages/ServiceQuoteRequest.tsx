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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface ServiceQuoteField {
  id: string;
  name: string;
  label: string;
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
      const fieldLabel = field.label;
      
      let fieldSchema: z.ZodType;
      
      switch(field.type) {
        case 'text':
        case 'phone':
          fieldSchema = field.required 
            ? z.string().min(1, `${fieldLabel} is required`) 
            : z.string().optional();
          break;
        case 'number':
          fieldSchema = field.required 
            ? z.string().refine(val => !isNaN(Number(val)), { message: `${fieldLabel} must be a number` })
            : z.string().optional();
          break;
        case 'select':
          fieldSchema = field.required 
            ? z.string().min(1, `Please select a ${fieldLabel}`) 
            : z.string().optional();
          break;
        case 'multi-select':
          fieldSchema = field.required 
            ? z.array(z.string()).min(1, `Please select at least one ${fieldLabel}`) 
            : z.array(z.string()).optional();
          break;
        case 'radio':
          fieldSchema = field.required 
            ? z.string().min(1, `Please select a ${fieldLabel}`) 
            : z.string().optional();
          break;
        case 'checkbox':
          fieldSchema = field.required 
            ? z.boolean().refine(val => val === true, { message: `${fieldLabel} must be checked` })
            : z.boolean().optional();
          break;
        case 'email':
          fieldSchema = field.required 
            ? z.string().email(`Invalid ${fieldLabel}`) 
            : z.string().email(`Invalid ${fieldLabel}`).optional();
          break;
        case 'textarea':
          fieldSchema = field.required 
            ? z.string().min(1, `${fieldLabel} is required`) 
            : z.string().optional();
          break;
        case 'date':
          fieldSchema = field.required 
            ? z.string().refine(val => !isNaN(Date.parse(val)), { message: `${fieldLabel} must be a valid date` })
            : z.string().optional();
          break;
        default:
          fieldSchema = field.required 
            ? z.string().min(1, `${fieldLabel} is required`) 
            : z.string().optional();
      }
      
      schemaFields[field.id] = fieldSchema;
    });

    return z.object(schemaFields);
  };

  const formSchema = generateFormSchema();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: quoteFields.length > 0 
      ? quoteFields.reduce((acc, field) => {
          switch(field.type) {
            case 'multi-select':
              acc[field.id] = [];
              break;
            case 'checkbox':
              acc[field.id] = false;
            case 'number':
            case 'date':
              acc[field.id] = '';
              break;
            default:
              acc[field.id] = '';
          }
          return acc;
        }, {} as any)
      : {}
  });

  useEffect(() => {
    if (quoteFields.length > 0) {
      const defaultValues = quoteFields.reduce((acc, field) => {
        switch(field.type) {
          case 'multi-select':
            acc[field.id] = [];
            break;
          case 'checkbox':
            acc[field.id] = false;
            break;
          case 'number':
          case 'date':
            acc[field.id] = '';
            break;
          default:
            acc[field.id] = '';
        }
        return acc;
      }, {} as any);

      form.reset(defaultValues);
    }
  }, [quoteFields, form.reset]);

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
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </FormLabel>
                      {(field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'number' || field.type === 'date') && (
                        <FormControl>
                          <Input 
                            type={field.type === 'number' ? 'number' : 
                                   field.type === 'email' ? 'email' : 
                                   field.type === 'date' ? 'date' : 
                                   'text'} 
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

                      {field.type === 'select' && field.options && (
                        <FormControl>
                          <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${field.label}`} />
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

                      {field.type === 'multi-select' && field.options && (
                        <FormControl>
                          <div className="grid grid-cols-2 gap-4">
                            {field.options.map((option) => (
                              <div key={option} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`${field.id}-${option}`}
                                  checked={(formField.value ?? []).includes(option)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = formField.value ?? [];
                                    const newValue = checked 
                                      ? [...currentValue, option]
                                      : currentValue.filter(v => v !== option);
                                    formField.onChange(newValue);
                                  }}
                                />
                                <label 
                                  htmlFor={`${field.id}-${option}`} 
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {option}
                                </label>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                      )}

                      {field.type === 'radio' && field.options && (
                        <FormControl>
                          <RadioGroup 
                            onValueChange={formField.onChange} 
                            defaultValue={formField.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            {field.options.map((option) => (
                              <div key={option} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                                <label 
                                  htmlFor={`${field.id}-${option}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {option}
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                      )}

                      {field.type === 'checkbox' && (
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={field.id}
                              checked={formField.value}
                              onCheckedChange={formField.onChange}
                            />
                            <label 
                              htmlFor={field.id} 
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {field.label}
                            </label>
                          </div>
                        </FormControl>
                      )}

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