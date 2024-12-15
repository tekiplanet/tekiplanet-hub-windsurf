import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const PaystackCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    const verifyPaystackTransaction = async () => {
      try {
        // Log full URL and all query parameters for debugging
        console.log('Full Callback URL:', window.location.href);
        console.log('Full Search Params:', Object.fromEntries(new URLSearchParams(location.search)));

        // Extract reference from URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const reference = searchParams.get('reference');
        const trxref = searchParams.get('trxref');

        const verificationReference = reference || trxref;

        console.log('Extracted References:', { 
          reference, 
          trxref, 
          verificationReference 
        });

        if (!verificationReference) {
          throw new Error('No reference found in URL');
        }

        console.log('Verifying Paystack transaction with reference:', verificationReference);

        // Verify transaction with backend
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/wallet/verify-paystack-payment`,
          { reference: verificationReference },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Verification response:', response.data);

        if (response.data.status === 'success') {
          setVerificationStatus('success');
          toast.success(`₦${response.data.amount} successfully added to your wallet`);
          navigate('/dashboard/wallet');
        } else {
          console.log('Payment verification failed:', response.data);
          setVerificationStatus('error');
          toast.error(response.data.message || 'Payment verification failed');
          navigate('/dashboard/wallet');
        }
      } catch (error) {
        console.error('Paystack Verification Error:', error);
        console.log('Error details:', error.message, error.stack);
        setVerificationStatus('error');
        toast.error('An error occurred during payment verification');
        navigate('/dashboard/wallet');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPaystackTransaction();
  }, [location, navigate]);

  const handleRetry = () => {
    setIsVerifying(true);
    setVerificationStatus('pending');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        {isVerifying && (
          <div>
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-500" />
            <h2 className="text-xl text-primary font-semibold mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your transaction...</p>
          </div>
        )}

        {!isVerifying && verificationStatus === 'error' && (
          <div>
            <h2 className="text-xl font-semibold text-red-500 mb-4">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-6">
              We could not verify your payment. This might be due to network issues or an invalid transaction.
            </p>
            <div className="flex space-x-4 justify-center">
              <Button onClick={handleRetry} className="w-full">
                Retry Verification
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/wallet')} 
                className="w-full"
              >
                Back to Wallet
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaystackCallback;
