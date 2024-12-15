import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import axios from 'axios'; // Import axios
import { AlertTriangle, XCircle } from 'lucide-react';

// Explicitly define the component with a named function
export default function PaymentConfirmation(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();

  const { 
    amount, 
    paymentMethod 
  } = location.state || { 
    amount: null, 
    paymentMethod: null 
  };

  console.log('Full Location State:', location.state);

  // Normalize payment method
  const finalPaymentMethod = 
    paymentMethod === 'bank' ? 'bank_transfer' : 
    paymentMethod === 'paystack' ? 'paystack' : 
    null;

  console.log('Payment Method:', finalPaymentMethod, 'Original Method:', paymentMethod);

  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'failed' | 'canceled' | null>(null);

  // Redirect if no payment details
  useEffect(() => {
    if (!amount || !finalPaymentMethod) {
      console.error('Invalid payment details:', { amount, finalPaymentMethod });
      toast.error("Invalid payment details", {
        description: "Please start the funding process from the wallet page."
      });
      navigate('/dashboard/wallet');
    }
  }, [amount, finalPaymentMethod, navigate]);

  // Check payment status from URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get('status');
    const trxref = searchParams.get('trxref');

    if (status === 'cancelled') {
      setPaymentStatus('canceled');
      toast.error('Payment was canceled. Please try again.');
    } else if (status === 'failed' || (status === null && trxref)) {
      setPaymentStatus('failed');
      toast.error('Payment failed. Please try again.');
    }
  }, [location.search, navigate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic file validation
      if (file.size > 5 * 1024 * 1024) {
        console.error('File size exceeds 5MB limit:', file.size);
        toast.error("File size exceeds 5MB limit");
        return;
      }
      
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        console.error('Invalid file type:', file.type);
        toast.error("Invalid file type. Please upload JPG, PNG, or PDF");
        return;
      }

      setPaymentProof(file);
      toast.success("File selected successfully");
    }
  };

  const handleBankTransferSubmit = () => {
    if (!paymentProof) {
      console.error('No payment proof uploaded');
      toast.error("Please upload payment proof");
      return;
    }

    // Create form data for file upload
    const formData = new FormData();
    formData.append('amount', amount?.toString() || '');
    formData.append('payment_method', 'bank_transfer');
    formData.append('payment_proof', paymentProof);

    setIsUploading(true);

    // Get the authentication token from localStorage
    const token = localStorage.getItem('token');

    // Use axios for file upload with progress tracking
    axios.post('/wallet/bank-transfer', formData, {
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`, // Add the Bearer token
      },
      withCredentials: true, // Enable sending cookies cross-origin
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        setUploadProgress(percentCompleted);
      }
    })
    .then((response) => {
      console.log('Payment proof uploaded successfully', response.data);
      toast.success("Payment request submitted. Awaiting approval.");
      
      // Navigate to wallet page or show success modal
      navigate('/dashboard/wallet', {
        state: { 
          message: 'Payment proof submitted. Awaiting verification.' 
        }
      });
    })
    .catch((error) => {
      console.error('Error uploading payment proof', error);
      toast.error(
        error.response?.data?.message || 
        "Failed to upload payment proof. Please try again."
      );
    })
    .finally(() => {
      setIsUploading(false);
    });
  };

  const handlePaystackPayment = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/wallet/initiate-paystack-payment`, 
        { amount: parseFloat(amount) },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Log the response for debugging
      console.log('Paystack Initialization Response:', response.data);

      // Open Paystack checkout in the same window
      window.location.href = response.data.authorization_url;
    } catch (error) {
      console.error('Paystack Payment Initialization Error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if we have payment details from navigation state
  useEffect(() => {
    if (!location.state?.amount || !location.state?.paymentMethod) {
      navigate('/dashboard/wallet');
      return;
    }
  }, [location.state, navigate]);

  // Render method with explicit type
  const renderPaymentContent = (): React.JSX.Element | null => {
    if (!amount || !finalPaymentMethod) {
      return null;
    }

    switch (finalPaymentMethod) {
      case 'bank_transfer':
        return (
          <Dashboard>
            <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  type: "spring", 
                  stiffness: 120 
                }}
                className="w-full max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
              >
                <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
                  <div className="flex items-center space-x-4 mb-6">
                    <LucideIcons.Landmark className="w-10 h-10 text-primary" strokeWidth={1.5} />
                    <h2 className="text-2xl font-bold text-foreground">
                      Bank Payment
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {/* Amount Display */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="bg-muted/30 rounded-xl p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm text-muted-foreground">Amount to Fund</p>
                        <p className="text-3xl font-bold text-foreground">
                          ₦{amount ? amount.toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <LucideIcons.Copy 
                          onClick={() => {
                            const copyText = amount ? amount.toString() : '';
                            
                            // Fallback copy method
                            const copyToClipboard = (text: string) => {
                              try {
                                // Modern clipboard API
                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                  return navigator.clipboard.writeText(text);
                                }
                                
                                // Fallback for older browsers
                                const textArea = document.createElement('textarea');
                                textArea.value = text;
                                textArea.style.position = 'fixed';
                                textArea.style.left = '-9999px';
                                document.body.appendChild(textArea);
                                textArea.select();
                                
                                const successful = document.execCommand('copy');
                                document.body.removeChild(textArea);
                                
                                return successful ? Promise.resolve() : Promise.reject();
                              } catch (err) {
                                console.error('Failed to copy text', err);
                                return Promise.reject(err);
                              }
                            };

                            copyToClipboard(copyText)
                              .then(() => toast.success('Amount copied'))
                              .catch(() => toast.error('Failed to copy amount'));
                          }}
                          className="w-6 h-6 text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                        />
                        <LucideIcons.CheckCircle2 
                          className="w-8 h-8 text-green-500" 
                          strokeWidth={1.5} 
                        />
                      </div>
                    </motion.div>

                    {/* Bank Details */}
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center space-x-3 mb-3">
                        <LucideIcons.Info 
                          className="w-6 h-6 text-blue-500" 
                          strokeWidth={1.5} 
                        />
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                          Bank Transfer Details
                        </h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Bank:</span>{" "}
                          TekiPlanet Bank
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-muted-foreground">Account Number:</span>{" "}
                            1234567890
                          </div>
                          <LucideIcons.Copy 
                            onClick={() => {
                              const copyText = '1234567890';
                              
                              // Fallback copy method
                              const copyToClipboard = (text: string) => {
                                try {
                                  // Modern clipboard API
                                  if (navigator.clipboard && navigator.clipboard.writeText) {
                                    return navigator.clipboard.writeText(text);
                                  }
                                  
                                  // Fallback for older browsers
                                  const textArea = document.createElement('textarea');
                                  textArea.value = text;
                                  textArea.style.position = 'fixed';
                                  textArea.style.left = '-9999px';
                                  document.body.appendChild(textArea);
                                  textArea.select();
                                  
                                  const successful = document.execCommand('copy');
                                  document.body.removeChild(textArea);
                                  
                                  return successful ? Promise.resolve() : Promise.reject();
                                } catch (err) {
                                  console.error('Failed to copy text', err);
                                  return Promise.reject(err);
                                }
                              };

                              copyToClipboard(copyText)
                                .then(() => toast.success('Account number copied'))
                                .catch(() => toast.error('Failed to copy account number'));
                            }}
                            className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-muted-foreground">Account Name:</span>{" "}
                            TekiPlanet Services
                          </div>
                          <LucideIcons.Copy 
                            onClick={() => {
                              const copyText = 'TekiPlanet Services';
                              
                              // Fallback copy method
                              const copyToClipboard = (text: string) => {
                                try {
                                  // Modern clipboard API
                                  if (navigator.clipboard && navigator.clipboard.writeText) {
                                    return navigator.clipboard.writeText(text);
                                  }
                                  
                                  // Fallback for older browsers
                                  const textArea = document.createElement('textarea');
                                  textArea.value = text;
                                  textArea.style.position = 'fixed';
                                  textArea.style.left = '-9999px';
                                  document.body.appendChild(textArea);
                                  textArea.select();
                                  
                                  const successful = document.execCommand('copy');
                                  document.body.removeChild(textArea);
                                  
                                  return successful ? Promise.resolve() : Promise.reject();
                                } catch (err) {
                                  console.error('Failed to copy text', err);
                                  return Promise.reject(err);
                                }
                              };

                              copyToClipboard(copyText)
                                .then(() => toast.success('Account name copied'))
                                .catch(() => toast.error('Failed to copy account name'));
                            }}
                            className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div>
                      <Label 
                        htmlFor="payment-proof" 
                        className="block mb-2 text-sm font-medium"
                      >
                        Upload Payment Proof
                      </Label>
                      <div 
                        className={cn(
                          "relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300",
                          paymentProof 
                            ? "border-green-500 bg-green-50" 
                            : "border-gray-300 hover:border-primary"
                        )}
                      >
                        <Input 
                          id="payment-proof"
                          type="file" 
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center space-y-2">
                          <LucideIcons.Upload 
                            className={cn(
                              "w-10 h-10 mx-auto mb-2",
                              paymentProof 
                                ? "text-green-500" 
                                : "text-muted-foreground"
                            )}
                          />
                          {paymentProof ? (
                            <p className="text-sm text-green-600">
                              {paymentProof.name}
                            </p>
                          ) : (
                            <>
                              <p className="text-sm text-muted-foreground">
                                Drag and drop or click to upload
                              </p>
                              <p className="text-xs text-muted-foreground">
                                JPG, PNG, PDF (max 5MB)
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar for Upload */}
                    {isUploading && (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-2 bg-primary rounded-full"
                      />
                    )}

                    {/* Submit and Cancel Buttons */}
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                      <Button 
                        onClick={handleBankTransferSubmit}
                        disabled={!paymentProof || isUploading}
                        className="w-full"
                        size="lg"
                      >
                        {isUploading 
                          ? `Uploading (${uploadProgress}%)` 
                          : "Submit Payment Proof"}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/dashboard/wallet')}
                        className="w-full"
                        size="lg"
                      >
                        Cancel Payment
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Dashboard>
        );
      
      case 'paystack':
        return (
          <Dashboard>
            <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  type: "spring", 
                  stiffness: 120 
                }}
                className="w-full max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
              >
                <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
                  <div className="flex items-center space-x-4 mb-6">
                    <LucideIcons.CreditCard className="w-10 h-10 text-primary" strokeWidth={1.5} />
                    <h2 className="text-2xl font-bold text-foreground">
                      Paystack Payment
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {/* Amount Display */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="bg-muted/30 rounded-xl p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm text-muted-foreground">Amount to Fund</p>
                        <p className="text-3xl font-bold text-foreground">
                          ₦{amount ? amount.toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <LucideIcons.Copy 
                          onClick={() => {
                            const copyText = amount ? amount.toString() : '';
                            
                            // Fallback copy method
                            const copyToClipboard = (text: string) => {
                              try {
                                // Modern clipboard API
                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                  return navigator.clipboard.writeText(text);
                                }
                                
                                // Fallback for older browsers
                                const textArea = document.createElement('textarea');
                                textArea.value = text;
                                textArea.style.position = 'fixed';
                                textArea.style.left = '-9999px';
                                document.body.appendChild(textArea);
                                textArea.select();
                                
                                const successful = document.execCommand('copy');
                                document.body.removeChild(textArea);
                                
                                return successful ? Promise.resolve() : Promise.reject();
                              } catch (err) {
                                console.error('Failed to copy text', err);
                                return Promise.reject(err);
                              }
                            };

                            copyToClipboard(copyText)
                              .then(() => toast.success('Amount copied'))
                              .catch(() => toast.error('Failed to copy amount'));
                          }}
                          className="w-6 h-6 text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                        />
                        <LucideIcons.CheckCircle2 
                          className="w-8 h-8 text-green-500" 
                          strokeWidth={1.5} 
                        />
                      </div>
                    </motion.div>

                    {/* Paystack Payment Button */}
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                      <Button 
                        onClick={handlePaystackPayment}
                        disabled={isLoading}
                        className="w-full"
                        size="lg"
                      >
                        {isLoading 
                          ? "Initializing Payment..." 
                          : "Proceed to Paystack Payment"}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/dashboard/wallet')}
                        className="w-full"
                        size="lg"
                      >
                        Cancel Payment
                      </Button>
                    </div>

                    {/* Support Contact Section */}
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center space-x-3 mb-3">
                        <LucideIcons.HelpCircle className="w-6 h-6 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">
                          Payment Gateway Support
                        </h3>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                          If you encounter any issues with the Paystack payment gateway, 
                          please contact our support team immediately.
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">Support Email:</span>{" "}
                            support@tekiplanet.com
                          </div>

                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">Support Hotline:</span>{" "}
                            +234 (0) 123 456 7890
                          </div>
     
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Dashboard>
        );
      
      default:
        return null;
    }
  };

  // Render payment failure or cancellation notice
  const renderPaymentNotice = () => {
    if (paymentStatus === 'canceled') {
      return (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-yellow-600" />
          <div>
            <p className="font-semibold">Payment Canceled</p>
            <p className="text-sm">You have canceled the payment process. Would you like to try again?</p>
          </div>
        </div>
      );
    }

    if (paymentStatus === 'failed') {
      return (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center space-x-3 mb-4">
          <XCircle className="h-6 w-6 text-red-600" />
          <div>
            <p className="font-semibold">Payment Failed</p>
            <p className="text-sm">We could not process your payment. Please check your payment method and try again.</p>
          </div>
        </div>
      );
    }

    return null;
  };

  // Return the rendered content
  return (
    <div>
      {renderPaymentNotice()}
      {renderPaymentContent()}
    </div>
  );
}
