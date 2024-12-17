import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client'; 
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Quote {
  id: number;
  service: {
    name: string;
  };
  industry: string;
  budget_range: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  project_deadline: string;
  created_at: string;
}

const QuoteRequestsList: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await apiClient.get('/quotes');
        
        if (response.data.success) {
          setQuotes(response.data.quotes.data);
        } else {
          toast.error('Failed to load quote requests');
        }
      } catch (error) {
        toast.error('Error fetching quote requests');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'reviewed': return 'outline';
      case 'accepted': return 'success';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return <div>Loading quote requests...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Quote Requests</h1>
      
      {quotes.length === 0 ? (
        <div className="text-center py-10">
          <p>You have no quote requests yet.</p>
          <Button 
            onClick={() => navigate('/service-quote-request')} 
            className="mt-4"
          >
            Create New Quote Request
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {quotes.map((quote) => (
            <Card key={quote.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>{quote.service.name}</CardTitle>
                <Badge variant={getStatusVariant(quote.status)}>
                  {quote.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Industry</p>
                    <p>{quote.industry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget Range</p>
                    <p>{quote.budget_range}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Project Deadline</p>
                    <p>{new Date(quote.project_deadline).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted On</p>
                    <p>{new Date(quote.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuoteRequestsList;
