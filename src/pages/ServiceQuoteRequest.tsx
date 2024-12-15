import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
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

const webAppTypes = [
  'Corporate Website',
  'E-commerce Platform',
  'Mobile App (iOS)',
  'Mobile App (Android)',
  'Cross-platform App',
  'Portfolio Website',
  'Web Application',
  'Blog/Content Site'
];

const securityAssessmentTypes = [
  'Network Security Audit',
  'Penetration Testing',
  'Vulnerability Assessment',
  'Compliance Review',
  'Cloud Security',
  'Application Security'
];

const budgetRanges = [
  '₦50,000 - ₦200,000',
  '₦200,000 - ₦500,000',
  '₦500,000 - ₦1,000,000',
  '₦1,000,000 - ₦5,000,000',
  'Above ₦5,000,000'
];

export default function ServiceQuoteRequest() {
  const { category, serviceId } = useParams<{ 
    category: string, 
    serviceId: string 
  }>();

  const formSchema = z.object({
    projectType: z.string().min(1, "Please select a project type"),
    budget: z.string().min(1, "Please select a budget range"),
    description: z.string().min(10, "Please provide more details"),
    timeline: z.string().optional(),
    companyName: z.string().optional(),
    contactEmail: z.string().email("Invalid email address").optional()
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectType: '',
      budget: '',
      description: '',
      timeline: '',
      companyName: '',
      contactEmail: ''
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // TODO: Implement quote request submission
    console.log('Quote Request:', values);
    // Integrate with backend service
  };

  const renderFormFields = () => {
    const projectTypes = category === 'software-engineering' 
      ? webAppTypes 
      : securityAssessmentTypes;

    return (
      <>
        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {category === 'software-engineering' 
                  ? 'Type of Website/App' 
                  : 'Type of Security Assessment'}
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Range</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {budgetRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Details</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide detailed description of your project"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timeline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Timeline</FormLabel>
              <FormControl>
                <Input 
                  type="text" 
                  placeholder="e.g., 2-3 months" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Your company name" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Your contact email" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-4 max-w-2xl"
    >
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {category === 'software-engineering' 
          ? 'Software Development Quote Request' 
          : 'Cyber Security Assessment Quote'}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {renderFormFields()}
          
          <Button type="submit" className="w-full">
            Submit Quote Request
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
