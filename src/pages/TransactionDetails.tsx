import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  CreditCard, 
  ShoppingBag, 
  Calendar, 
  Clock, 
  Info, 
  FileText, 
  Banknote, 
  Tag, 
  CheckCheck, 
  Copy, 
  Landmark 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import axios from 'axios';

interface TransactionDetails {
  transaction: {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    created_at: string;
    payment_method?: string;
    status: string;
  };
  related_info: any;
  metadata: {
    timestamp: string;
    formatted_date: string;
    timezone: string;
  };
}

const TransactionDetails: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/transactions/${transactionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch transaction details');
        }

        const data = await response.json();
        setTransaction(data);
      } catch (error) {
        toast.error('Unable to load transaction details', {
          description: 'Please try again later.'
        });
        navigate('/dashboard/wallet');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [transactionId, navigate]);

  const handleCopyTransactionId = () => {
    if (transaction) {
      navigator.clipboard.writeText(transaction.transaction.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      console.log('Downloading receipt for transaction:', transaction.transaction.id);
      console.log('API Base URL:', import.meta.env.VITE_API_URL);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/transactions/${transaction.transaction.id}/receipt`, 
        { 
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/pdf'
          },
          // Explicitly handle various status codes
          validateStatus: function (status) {
            return status >= 200 && status < 300; // Only accept successful responses
          }
        }
      );

      // Detailed logging of response
      console.log('Receipt Response Details:', {
        status: response.status,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length']
      });

      // Validate PDF content type
      if (response.headers['content-type'] !== 'application/pdf') {
        console.error('Invalid content type:', response.headers['content-type']);
        toast.error('Download Failed', {
          description: 'Received an invalid file type'
        });
        return;
      }

      // Create a blob with explicit PDF type
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Validate blob size
      if (blob.size === 0) {
        console.error('Empty PDF received');
        toast.error('Download Failed', {
          description: 'Received an empty PDF file'
        });
        return;
      }

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `transaction-${transaction.transaction.id}-receipt.pdf`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke the blob URL
      window.URL.revokeObjectURL(url);

      // Success toast
      toast.success('Receipt Downloaded', {
        description: `Transaction ${transaction.transaction.id} receipt downloaded`
      });

    } catch (error) {
      console.error('Receipt Download Error:', error);
      
      // Comprehensive error handling
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with an error
          console.error('Server Error Response:', error.response.data);
          toast.error('Download Failed', {
            description: error.response.data.details || 'Unable to download receipt'
          });
        } else if (error.request) {
          // Request made but no response received
          toast.error('Network Error', {
            description: 'No response from server. Check your connection.'
          });
        } else {
          // Something happened in setting up the request
          toast.error('Download Error', {
            description: 'An unexpected error occurred'
          });
        }
      } else {
        // Non-Axios error
        toast.error('Unexpected Error', {
          description: 'An unknown error prevented receipt download'
        });
      }
    }
  };

  // Status label component
  const StatusLabel = ({ status }: { status: string }) => {
    const statusStyles = {
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800'
    };

    return (
      <span 
        className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!transaction) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Card className="shadow-lg rounded-2xl border-none">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">
              {transaction.transaction.description}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="space-y-6">
            {/* Transaction Summary Header */}
            <div className="bg-secondary/10 rounded-xl p-4 text-center">
              <div className={`text-3xl font-bold mb-2 ${
                transaction.transaction.type === 'credit' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {transaction.transaction.type === 'credit' ? '+' : '-'}
                {formatCurrency(transaction.transaction.amount)}
              </div>
              <div className="text-sm text-muted-foreground">
                {transaction.transaction.description}
              </div>
            </div>

            {/* Transaction Details List */}
            <div className="space-y-4">
              {/* Transaction Details Section */}
              <div className="bg-secondary/5 border border-secondary/20 rounded-xl">
                {/* Transaction ID */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-secondary/20">
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Transaction ID</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleCopyTransactionId}
                            className="h-6 w-6"
                          >
                            {copiedId ? (
                              <CheckCheck className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {copiedId ? 'Copied!' : 'Copy Transaction ID'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="text-sm font-mono truncate max-w-[120px] sm:max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                      {transaction.transaction.id}
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-secondary/20">
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Date</span>
                  </div>
                  <span className="text-sm">
                    {transaction.metadata.formatted_date}
                  </span>
                </div>

                {/* Payment Method */}
                {transaction.transaction.payment_method && (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-secondary/20">
                    <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                      <Landmark className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Payment Method</span>
                    </div>
                    <span className="text-sm">
                      {transaction.transaction.payment_method}
                    </span>
                  </div>
                )}

                {/* Transaction Type */}
                <div className="flex justify-between items-center p-4">
                  <div className="flex items-center space-x-3">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Transaction Type</span>
                  </div>
                  <Badge 
                    variant={transaction.transaction.type === 'credit' ? 'secondary' : 'destructive'}
                    className="uppercase"
                  >
                    {transaction.transaction.type}
                  </Badge>
                </div>

                {/* Transaction Status */}
                <div className="flex justify-between items-center p-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Transaction Status</span>
                  </div>
                  <StatusLabel status={transaction.transaction.status} />
                </div>
              </div>

              {/* Additional Details */}
              {transaction.related_info && Object.keys(transaction.related_info).length > 0 && (
                <div className="bg-secondary/5 border border-secondary/20 rounded-xl">
                  <div className="p-4 border-b border-secondary/20 flex items-center">
                    <Info className="h-5 w-5 mr-3 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Additional Details
                    </h3>
                  </div>
                  {Object.entries(transaction.related_info).map(([key, value]) => (
                    <div 
                      key={key} 
                      className="flex justify-between items-center p-4 border-b border-secondary/20 last:border-b-0"
                    >
                      <span className="capitalize text-sm text-muted-foreground">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-right">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pb-6">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleDownloadReceipt}
              >
                <FileText className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionDetails;
