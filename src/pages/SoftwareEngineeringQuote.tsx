import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Code2, Laptop, Server, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SoftwareEngineeringQuote() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    timeline: '',
    budget: '',
    platform: '',
    features: '',
    technicalDetails: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });

  const getServiceIcon = () => {
    switch(serviceId) {
      case 'web-development':
        return <Laptop className="h-8 w-8 text-primary" />;
      case 'app-development':
        return <Server className="h-8 w-8 text-primary" />;
      case 'maintenance':
        return <Code2 className="h-8 w-8 text-primary" />;
      default:
        return <Code2 className="h-8 w-8 text-primary" />;
    }
  };

  const getServiceTitle = () => {
    switch(serviceId) {
      case 'web-development':
        return 'Web Development Quote';
      case 'app-development':
        return 'App Development Quote';
      case 'maintenance':
        return 'Maintenance Service Quote';
      default:
        return 'Service Quote';
    }
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input 
                placeholder="Enter project name"
                value={formData.projectName}
                onChange={(e) => setFormData({...formData, projectName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Project Description</label>
              <Textarea 
                placeholder="Describe your project requirements"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="min-h-[100px]"
              />
            </div>

            {renderServiceSpecificFields()}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="timeline">Timeline & Budget</TabsTrigger>
                <TabsTrigger value="technical">Technical Details</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expected Timeline</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3">1-3 months</SelectItem>
                      <SelectItem value="3-6">3-6 months</SelectItem>
                      <SelectItem value="6-12">6-12 months</SelectItem>
                      <SelectItem value="12+">12+ months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Budget Range</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">₦500k - ₦2M</SelectItem>
                      <SelectItem value="standard">₦2M - ₦5M</SelectItem>
                      <SelectItem value="premium">₦5M - ₦10M</SelectItem>
                      <SelectItem value="enterprise">₦10M+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="technical" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Technical Requirements</label>
                  <Textarea 
                    placeholder="Describe any specific technical requirements or preferences"
                    value={formData.technicalDetails}
                    onChange={(e) => setFormData({...formData, technicalDetails: e.target.value})}
                    className="min-h-[100px]"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Name</label>
              <Input 
                placeholder="Enter your full name"
                value={formData.contactName}
                onChange={(e) => setFormData({...formData, contactName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input 
                type="email"
                placeholder="Enter your email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input 
                type="tel"
                placeholder="Enter your phone number"
                value={formData.contactPhone}
                onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
              />
            </div>
          </motion.div>
        );
    }
  };

  const renderServiceSpecificFields = () => {
    switch(serviceId) {
      case 'web-development':
        return (
          <>
            <div className="space-y-2">
              <label>Website Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select website type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="portfolio">Portfolio</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>Required Features</label>
              <Textarea 
                placeholder="List the key features you need (e.g., user authentication, payment integration)"
                value={formData.features}
                onChange={(e) => setFormData({...formData, features: e.target.value})}
              />
            </div>
          </>
        );
      
      case 'app-development':
        return (
          <>
            <div className="space-y-2">
              <label>Platform</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ios">iOS</SelectItem>
                  <SelectItem value="android">Android</SelectItem>
                  <SelectItem value="both">Both (Cross-platform)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>App Features</label>
              <Textarea 
                placeholder="List the key features you need (e.g., offline mode, push notifications)"
                value={formData.features}
                onChange={(e) => setFormData({...formData, features: e.target.value})}
              />
            </div>
          </>
        );

      case 'maintenance':
        return (
          <>
            <div className="space-y-2">
              <label>Current Technology Stack</label>
              <Textarea 
                placeholder="Describe your current technology stack"
              />
            </div>
            <div className="space-y-2">
              <label>Maintenance Requirements</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select maintenance type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug-fixing">Bug Fixing</SelectItem>
                  <SelectItem value="updates">Updates & Upgrades</SelectItem>
                  <SelectItem value="optimization">Performance Optimization</SelectItem>
                  <SelectItem value="security">Security Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-4 max-w-3xl"
    >

      <Card className="border-t-4 border-t-primary">
        <CardHeader>
          <div className="flex items-center space-x-4">
            {getServiceIcon()}
            <div>
              <CardTitle>{getServiceTitle()}</CardTitle>
              <CardDescription>
                Step {currentStep} of {totalSteps}: {
                  currentStep === 1 ? 'Project Details' :
                  currentStep === 2 ? 'Timeline & Technical Details' :
                  'Contact Information'
                }
              </CardDescription>
            </div>
          </div>
          <Progress 
            value={(currentStep / totalSteps) * 100} 
            className="mt-4"
          />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between pt-4 mt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(curr => Math.max(1, curr - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (currentStep === totalSteps) {
                  // Handle form submission
                  console.log('Form submitted:', formData);
                } else {
                  setCurrentStep(curr => Math.min(totalSteps, curr + 1));
                }
              }}
            >
              {currentStep === totalSteps ? (
                <span className="flex items-center">
                  Submit Request
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </span>
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 