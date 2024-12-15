import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useWalletStore } from "@/store/useWalletStore";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Search,
  Filter,
  Download,
  Upload,
  TrendingUp,
  Calendar,
  CreditCard,
  DollarSign,
  History,
  Settings,
  HelpCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/useAuthStore";

export default function WalletPage() {
  const user = useAuthStore(state => state.user);
  const { 
    getBalance, 
    getTransactions, 
    addBalance, 
    addTransaction 
  } = useWalletStore();
  
  const [amount, setAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");

  // Get user-specific data
  const balance = getBalance(user?.id || '');
  const transactions = getTransactions(user?.id || '');

  // Calculate statistics
  const stats = {
    totalSpent: transactions
      .filter(t => t.type === 'debit')
      .reduce((acc, t) => acc + t.amount, 0),
    totalFunded: transactions
      .filter(t => t.type === 'credit')
      .reduce((acc, t) => acc + t.amount, 0),
    averageTransaction: transactions.length > 0
      ? transactions.reduce((acc, t) => acc + t.amount, 0) / transactions.length
      : 0,
    monthlySpending: transactions
      .filter(t => {
        const date = new Date(t.date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && 
               date.getFullYear() === now.getFullYear() &&
               t.type === 'debit';
      })
      .reduce((acc, t) => acc + t.amount, 0)
  };

  // Prepare chart data - last 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayTransactions = transactions.filter(t => 
      new Date(t.date).toDateString() === date.toDateString()
    );
    
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      spent: dayTransactions
        .filter(t => t.type === 'debit')
        .reduce((acc, t) => acc + t.amount, 0),
      funded: dayTransactions
        .filter(t => t.type === 'credit')
        .reduce((acc, t) => acc + t.amount, 0)
    };
  }).reverse();

  // Filter transactions
  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleFundWallet = async () => {
    if (!user) {
      toast.error("Please login to fund your wallet");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const fundAmount = Number(amount);
      
      // Update both balance and transactions
      addBalance(user.id, fundAmount);
      addTransaction(user.id, {
        id: `FUND-${Date.now()}`,
        type: 'credit',
        amount: fundAmount,
        description: `Wallet Funding via ${selectedPaymentMethod}`,
        date: new Date().toISOString()
      });
      
      setAmount("");
      toast.success("Wallet funded successfully!");
    } catch (error) {
      toast.error("Failed to fund wallet");
      console.error("Funding error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Wallet Overview</h1>
          <p className="text-muted-foreground">Manage your funds and transactions</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Wallet Help</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Learn how to use your wallet effectively:</p>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Fund your wallet using various payment methods</li>
                  <li>Track your spending with detailed transaction history</li>
                  <li>Monitor your balance and spending patterns</li>
                  <li>Export transactions for record keeping</li>
                </ul>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="text-white">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">Current Balance</p>
                <h2 className="text-2xl font-bold">{formatCurrency(balance)}</h2>
              </div>
              <div className="p-3 bg-white/10 rounded-full">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Monthly Spending
                </p>
                <h2 className="text-2xl font-bold">{formatCurrency(stats.monthlySpending)}</h2>
              </div>
              <div className="p-3 bg-destructive/10 rounded-full">
                <ArrowDownRight className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Funded
                </p>
                <h2 className="text-2xl font-bold">{formatCurrency(stats.totalFunded)}</h2>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <ArrowUpRight className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Transaction
                </p>
                <h2 className="text-2xl font-bold">
                  {formatCurrency(stats.averageTransaction)}
                </h2>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        {/* Transactions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Chart */}
            <div className="h-[200px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="spent" 
                    name="Spent"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="funded" 
                    name="Funded"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="credit">Credits</SelectItem>
                  <SelectItem value="debit">Debits</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transactions List */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'credit' 
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <Upload className="h-4 w-4" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>
                            {new Date(transaction.date).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'credit' 
                          ? 'text-green-500'
                          : 'text-destructive'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <Badge variant={transaction.type === 'credit' ? "default" : "destructive"}>
                        {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                      </Badge>
                    </div>
                  </div>
                ))}

                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">No transactions found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Fund Wallet Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fund Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    className="pl-9"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <Select 
                  value={selectedPaymentMethod} 
                  onValueChange={setSelectedPaymentMethod}
                >
                  <SelectTrigger>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full text-white" 
                onClick={handleFundWallet}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Fund Wallet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Download Statement
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Wallet Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Payment Methods
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 