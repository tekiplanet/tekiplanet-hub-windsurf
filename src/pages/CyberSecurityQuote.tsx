import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Shield, Lock, Server, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function CyberSecurityQuote() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    description: '',
    infrastructure: '',
    timeline: '',
    budget: '',
    securityConcerns: '',
    complianceRequirements: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    priority: 'normal'
  });

  const getServiceIcon = () => {
    switch(serviceId) {
      case 'security-audit':
        return <Shield className="h-8 w-8 text-primary" />;
      case 'penetration-testing':
        return <Lock className="h-8 w-8 text-primary" />;
      default:
        return <Shield className="h-8 w-8 text-primary" />;
    }
  };

  const getServiceTitle = () => {
    switch(serviceId) {
      case 'security-audit':
        return 'Security Audit Request';
      case 'penetration-testing':
        return 'Penetration Testing Request';
      default:
        return 'Security Service Request';
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
              <label className="text-sm font-medium">Company Name</label>
              <Input 
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Industry</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance">Finance & Banking</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="retail">Retail & E-commerce</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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
            <Tabs defaultValue="infrastructure" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="infrastructure" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Infrastructure</label>
                  <Textarea 
                    placeholder="Describe your current IT infrastructure"
                    value={formData.infrastructure}
                    onChange={(e) => setFormData({...formData, infrastructure: e.target.value})}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Security Concerns</label>
                  <Textarea 
                    placeholder="Describe any specific security concerns"
                    value={formData.securityConcerns}
                    onChange={(e) => setFormData({...formData, securityConcerns: e.target.value})}
                    className="min-h-[100px]"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="compliance" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Compliance Requirements</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['PCI DSS', 'HIPAA', 'GDPR', 'ISO 27001', 'SOC 2', 'NIST'].map((compliance) => (
                      <Button
                        key={compliance}
                        variant="outline"
                        className="justify-start"
                        onClick={() => {
                          const current = formData.complianceRequirements;
                          setFormData({
                            ...formData,
                            complianceRequirements: current.includes(compliance)
                              ? current.replace(new RegExp(`${compliance}(,\\s*)?`), '')
                              : current ? `${current}, ${compliance}` : compliance
                          });
                        }}
                      >
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={formData.complianceRequirements.includes(compliance)}
                          onChange={() => {}}
                        />
                        {compliance}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority Level</label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({...formData, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <span className="flex items-center">
                      Low Priority
                      <Badge variant="secondary" className="ml-2">Standard</Badge>
                    </span>
                  </SelectItem>
                  <SelectItem value="normal">
                    <span className="flex items-center">
                      Normal Priority
                      <Badge variant="secondary" className="ml-2">Recommended</Badge>
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center">
                      High Priority
                      <Badge variant="destructive" className="ml-2">Urgent</Badge>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
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

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Next Steps</h4>
              <p className="text-sm text-muted-foreground">
                After submission, our security team will review your request and contact you within 24 hours to discuss the next steps and schedule an initial assessment.
              </p>
            </div>
          </motion.div>
        );
    }
  };

  const renderServiceSpecificFields = () => {
    switch(serviceId) {
      case 'security-audit':
        return (
          <>
            <div className="space-y-2">
              <label>Audit Scope</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select audit scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full System Audit</SelectItem>
                  <SelectItem value="network">Network Security</SelectItem>
                  <SelectItem value="application">Application Security</SelectItem>
                  <SelectItem value="compliance">Compliance Audit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );
      
      case 'penetration-testing':
        return (
          <>
            <div className="space-y-2">
              <label>Testing Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select testing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="black-box">Black Box Testing</SelectItem>
                  <SelectItem value="white-box">White Box Testing</SelectItem>
                  <SelectItem value="web-app">Web Application Testing</SelectItem>
                  <SelectItem value="mobile-app">Mobile Application Testing</SelectItem>
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
                  currentStep === 1 ? 'Company Information' :
                  currentStep === 2 ? 'Security Requirements' :
                  'Contact Details'
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