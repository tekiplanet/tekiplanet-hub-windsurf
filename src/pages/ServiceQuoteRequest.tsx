import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/axios';
import PagePreloader from '@/components/ui/PagePreloader';
import { motion, AnimatePresence } from 'framer-motion';
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from "@/components/ui/calendar"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { settingsService } from '@/services/settingsService';
import { ArrowRightIcon, ArrowLeftIcon, CalendarIcon, CheckIcon } from 'lucide-react';
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import toast, { Toaster } from 'react-hot-toast';

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
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const allSettings = await settingsService.getAllSettings();
        console.log('All Settings:', allSettings);
        
        const currency = await settingsService.getDefaultCurrency();
        console.log('Default Currency from Service:', currency);
        
        setDefaultCurrency(currency);
      } catch (error) {
        console.error('Error fetching default currency:', error);
        setDefaultCurrency('USD');
      }
    };

    fetchSettings();
  }, []);

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

  // Permanent fields schema generation
  const permanentFieldsSchema = z.object({
    industry: z.string().min(1, "Industry/Sector is required"),
    budgetRange: z.string().min(1, "Estimated Budget Range is required"),
    contactMethod: z.string().min(1, "Preferred Contact Method is required"),
    projectDescription: z.string().min(10, "Project description must be at least 10 characters"),
    projectDeadline: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Estimated Project Timeline is required" })
  });

  // Dynamically generate form schema based on quote fields
  const generateFormSchema = () => {
    const dynamicFieldsSchema = quoteFields.reduce((acc, field) => {
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
      
      acc[field.id] = fieldSchema;
      return acc;
    }, {});

    return permanentFieldsSchema.extend(dynamicFieldsSchema);
  };

  const formSchema = generateFormSchema();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      industry: '',
      budgetRange: '',
      contactMethod: '',
      projectDescription: '',
      projectDeadline: '',
      ...(quoteFields.length > 0 
        ? quoteFields.reduce((acc, field) => {
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
          }, {} as any)
        : {})
    }
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

  const nextStep = () => {
    // Validate current step's fields before proceeding
    const stepFields = currentStep === 1 
      ? ['industry', 'budgetRange', 'contactMethod'] 
      : quoteFields.map(field => field.id);
    
    const isStepValid = stepFields.every(field => 
      !form.formState.errors[field]
    );

    if (isStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, 2));
    } else {
      // Trigger validation
      form.trigger(stepFields);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await apiClient.post('/quotes', {
        service_id: serviceId,
        ...values
      });

      if (response.data.success) {
        // Show success toast
        toast.success('Quote submitted successfully!');
        
        // Redirect to quotes list
        navigate('/quote-requests');
      }
    } catch (error) {
      // Handle submission error
      toast.error('Failed to submit quote. Please try again.');
      console.error('Quote submission error:', error);
    }
  };

  if (isLoading) {
    return <PagePreloader />;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  return (
    <Dashboard>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="container mx-auto p-4 max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-4">{serviceDetails?.name} Quote Request</h1>
          <p className="mb-6">{serviceDetails?.description}</p>

          {/* Multi-step Form Navigation */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              <Button
                variant={currentStep === 1 ? 'default' : 'outline'}
                onClick={() => setCurrentStep(1)}
              >
                Quote Details
              </Button>
              <div className="w-8 h-1 bg-gray-300"></div>
              <Button
                variant={currentStep === 2 ? 'default' : 'outline'}
                onClick={() => setCurrentStep(2)}
                disabled={quoteFields.length === 0}
              >
                Project Details
              </Button>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="quote-details"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-6">
                      {/* Permanent Quote Details Fields */}
                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field: formField }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Industry/Sector <span className="text-red-500">*</span></FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between",
                                      !formField.value && "text-muted-foreground"
                                    )}
                                  >
                                    {formField.value
                                      ? [
                                        'Technology', 
                                        'Healthcare', 
                                        'Finance', 
                                        'Education', 
                                        'Retail', 
                                        'Manufacturing', 
                                        'Hospitality',
                                        'Real Estate',
                                        'Agriculture',
                                        'Construction',
                                        'Energy',
                                        'Transportation',
                                        'Media & Entertainment',
                                        'Telecommunications',
                                        'Consulting',
                                        'Non-Profit',
                                        'Government',
                                        'Automotive',
                                        'Aerospace',
                                        'Pharmaceuticals',
                                        'E-commerce',
                                        'Logistics',
                                        'Insurance',
                                        'Professional Services',
                                        'Environmental Services',
                                        'Sports & Fitness',
                                        'Art & Design',
                                        'Legal Services',
                                        'Research & Development',
                                        'Other'
                                      ].find((industry) => industry === formField.value)
                                      : "Select industry"}
                                    <CheckIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search industry..." />
                                  <CommandList>
                                    <CommandEmpty>No industry found.</CommandEmpty>
                                    <CommandGroup>
                                      {[
                                        'Technology', 
                                        'Healthcare', 
                                        'Finance', 
                                        'Education', 
                                        'Retail', 
                                        'Manufacturing', 
                                        'Hospitality',
                                        'Real Estate',
                                        'Agriculture',
                                        'Construction',
                                        'Energy',
                                        'Transportation',
                                        'Media & Entertainment',
                                        'Telecommunications',
                                        'Consulting',
                                        'Non-Profit',
                                        'Government',
                                        'Automotive',
                                        'Aerospace',
                                        'Pharmaceuticals',
                                        'E-commerce',
                                        'Logistics',
                                        'Insurance',
                                        'Professional Services',
                                        'Environmental Services',
                                        'Sports & Fitness',
                                        'Art & Design',
                                        'Legal Services',
                                        'Research & Development',
                                        'Other'
                                      ].map((industry) => (
                                        <CommandItem
                                          value={industry}
                                          key={industry}
                                          onSelect={() => {
                                            form.setValue("industry", industry);
                                          }}
                                        >
                                          <CheckIcon
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              industry === formField.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {industry}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="budgetRange"
                        render={({ field: formField }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Estimated Budget Range <span className="text-red-500">*</span></FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between",
                                      !formField.value && "text-muted-foreground"
                                    )}
                                  >
                                    {formField.value || `Select ${defaultCurrency} budget range`}
                                    <CheckIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search budget range..." />
                                  <CommandList>
                                    <CommandEmpty>No range found.</CommandEmpty>
                                    <CommandGroup>
                                      {[
                                        `0-${defaultCurrency}10,000`, 
                                        `${defaultCurrency} 10,001-${defaultCurrency}50,000`, 
                                        `${defaultCurrency}50,001-${defaultCurrency}100,000`, 
                                        `${defaultCurrency}100,001-${defaultCurrency}500,000`, 
                                        `${defaultCurrency}500,001-${defaultCurrency}1,000,000`, 
                                        `${defaultCurrency}1,000,001-${defaultCurrency}5,000,000`, 
                                        `Over ${defaultCurrency}5,000,000`
                                      ].map((range) => (
                                        <CommandItem
                                          value={range}
                                          key={range}
                                          onSelect={() => {
                                            form.setValue("budgetRange", range);
                                          }}
                                        >
                                          <CheckIcon
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              range === formField.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {range}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactMethod"
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel>Preferred Contact Method <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <RadioGroup 
                                onValueChange={formField.onChange} 
                                defaultValue={formField.value}
                                className="grid grid-cols-3 gap-4"
                              >
                                {['Email', 'Phone', 'WhatsApp'].map((method) => (
                                  <div key={method} className="flex items-center space-x-2">
                                    <RadioGroupItem value={method} id={`contactMethod-${method}`} />
                                    <label 
                                      htmlFor={`contactMethod-${method}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {method}
                                    </label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="projectDescription"
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel>Project/Service Description <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Provide a detailed description of your project or service requirements"
                                {...formField} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="projectDeadline"
                        render={({ field: formField }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Estimated Project Timeline/Deadline <span className="text-red-500">*</span></FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !formField.value && "text-muted-foreground"
                                    )}
                                  >
                                    {formField.value ? (
                                      format(new Date(formField.value), "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={formField.value ? new Date(formField.value) : undefined}
                                  onSelect={(date) => formField.onChange(date?.toISOString())}
                                  disabled={(date) =>
                                    date < new Date()
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button 
                        type="button" 
                        onClick={nextStep} 
                        className="flex items-center"
                      >
                        Next Step 
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="project-details"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-6">
                      {/* Dynamic Fields from Database */}
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
                    </div>

                    <div className="flex justify-between mt-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={prevStep} 
                        className="flex items-center"
                      >
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        Previous Step
                      </Button>

                      <Button 
                        type="submit" 
                        className="flex items-center"
                      >
                        Submit Quote Request
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Form>
        </motion.div>
      </div>
    </Dashboard>
  );
};

export default ServiceQuoteRequest;