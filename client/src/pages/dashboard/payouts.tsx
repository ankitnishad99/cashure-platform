import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PAYOUT_STATUSES, CURRENCY } from "@/lib/constants";
import { 
  CreditCard, 
  Banknote, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Upload,
  Wallet,
  TrendingUp,
  Calendar
} from "lucide-react";
import type { Payout, InsertPayout } from "@shared/schema";

export default function DashboardPayouts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: payouts, isLoading: payoutsLoading } = useQuery<Payout[]>({
    queryKey: ["/api/payouts"],
  });

  const { data: earnings, isLoading: earningsLoading } = useQuery<{ total: number; thisMonth: number }>({
    queryKey: ["/api/analytics/earnings"],
  });

  const requestPayoutMutation = useMutation({
    mutationFn: (data: InsertPayout) => apiRequest("POST", "/api/payouts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payouts"] });
      setIsDialogOpen(false);
      toast({
        title: "Payout requested successfully!",
        description: "Your payout request has been submitted for review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to request payout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate available balance (total earnings minus pending/completed payouts)
  const totalPayouts = payouts?.reduce((sum, payout) => {
    if (payout.status === PAYOUT_STATUSES.COMPLETED || payout.status === PAYOUT_STATUSES.PENDING) {
      return sum + parseFloat(payout.amount);
    }
    return sum;
  }, 0) || 0;

  const availableBalance = (earnings?.total || 0) - totalPayouts;
  const minPayoutAmount = 100; // Minimum ₹100 payout

  // Calculate stats
  const stats = {
    totalRequests: payouts?.length || 0,
    pending: payouts?.filter(p => p.status === PAYOUT_STATUSES.PENDING).length || 0,
    completed: payouts?.filter(p => p.status === PAYOUT_STATUSES.COMPLETED).length || 0,
    totalPaidOut: payouts
      ?.filter(p => p.status === PAYOUT_STATUSES.COMPLETED)
      .reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0
  };

  const PayoutForm = () => {
    const [formData, setFormData] = useState<Partial<InsertPayout>>({
      amount: "",
      bankDetails: {
        accountNumber: "",
        ifsc: "",
        accountHolderName: "",
        bankName: "",
        upi: ""
      },
      kycDocuments: {}
    });

    const [paymentMethod, setPaymentMethod] = useState<"bank" | "upi">("bank");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const amount = parseFloat(formData.amount || "0");
      if (amount < minPayoutAmount) {
        toast({
          title: "Minimum payout amount",
          description: `Minimum payout amount is ${CURRENCY.symbol}${minPayoutAmount}`,
          variant: "destructive",
        });
        return;
      }

      if (amount > availableBalance) {
        toast({
          title: "Insufficient balance",
          description: "Payout amount exceeds available balance",
          variant: "destructive",
        });
        return;
      }

      requestPayoutMutation.mutate(formData as InsertPayout);
    };

    const handleInputChange = (field: string, value: any) => {
      if (field.startsWith("bank.")) {
        const bankField = field.replace("bank.", "");
        setFormData(prev => ({
          ...prev,
          bankDetails: {
            ...prev.bankDetails,
            [bankField]: value
          }
        }));
      } else {
        setFormData(prev => ({ ...prev, [field]: value }));
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <Alert>
          <Wallet className="h-4 w-4" />
          <AlertDescription>
            Available balance: <strong>{CURRENCY.symbol}{availableBalance.toLocaleString()}</strong>
            <br />
            Minimum payout: {CURRENCY.symbol}{minPayoutAmount}
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="amount">Payout Amount ({CURRENCY.symbol}) *</Label>
          <Input
            id="amount"
            type="number"
            min={minPayoutAmount}
            max={availableBalance}
            value={formData.amount}
            onChange={(e) => handleInputChange("amount", e.target.value)}
            placeholder={minPayoutAmount.toString()}
            required
          />
        </div>

        <div className="space-y-4">
          <Label>Payment Method</Label>
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={paymentMethod === "bank" ? "default" : "outline"}
              onClick={() => setPaymentMethod("bank")}
              className="h-20 flex-col"
            >
              <Banknote className="w-6 h-6 mb-2" />
              Bank Transfer
            </Button>
            <Button
              type="button"
              variant={paymentMethod === "upi" ? "default" : "outline"}
              onClick={() => setPaymentMethod("upi")}
              className="h-20 flex-col"
            >
              <CreditCard className="w-6 h-6 mb-2" />
              UPI
            </Button>
          </div>
        </div>

        {paymentMethod === "bank" ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                value={formData.bankDetails?.accountNumber || ""}
                onChange={(e) => handleInputChange("bank.accountNumber", e.target.value)}
                placeholder="Enter account number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ifsc">IFSC Code *</Label>
              <Input
                id="ifsc"
                value={formData.bankDetails?.ifsc || ""}
                onChange={(e) => handleInputChange("bank.ifsc", e.target.value)}
                placeholder="ABCD0123456"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountHolderName">Account Holder Name *</Label>
              <Input
                id="accountHolderName"
                value={formData.bankDetails?.accountHolderName || ""}
                onChange={(e) => handleInputChange("bank.accountHolderName", e.target.value)}
                placeholder="As per bank account"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name *</Label>
              <Input
                id="bankName"
                value={formData.bankDetails?.bankName || ""}
                onChange={(e) => handleInputChange("bank.bankName", e.target.value)}
                placeholder="Enter bank name"
                required
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="upi">UPI ID *</Label>
            <Input
              id="upi"
              value={formData.bankDetails?.upi || ""}
              onChange={(e) => handleInputChange("bank.upi", e.target.value)}
              placeholder="yourname@paytm"
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>KYC Documents (Required for first payout)</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm">PAN Card</p>
              <Button variant="outline" size="sm" type="button" className="mt-2">
                Upload
              </Button>
            </div>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm">Aadhaar Card</p>
              <Button variant="outline" size="sm" type="button" className="mt-2">
                Upload
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="btn-primary" 
            disabled={requestPayoutMutation.isPending || availableBalance < minPayoutAmount}
          >
            Request Payout
          </Button>
        </div>
      </form>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case PAYOUT_STATUSES.PENDING:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case PAYOUT_STATUSES.PROCESSING:
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        );
      case PAYOUT_STATUSES.COMPLETED:
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case PAYOUT_STATUSES.REJECTED:
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payouts</h1>
          <p className="text-muted-foreground">Request withdrawals and track payout history</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="btn-primary" 
              disabled={availableBalance < minPayoutAmount}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Request Payout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Payout</DialogTitle>
              <DialogDescription>
                Withdraw your earnings to your bank account or UPI.
              </DialogDescription>
            </DialogHeader>
            <PayoutForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
              <p className="text-4xl font-bold text-primary">
                {CURRENCY.symbol}{availableBalance.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Total Earnings: {CURRENCY.symbol}{(earnings?.total || 0).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <Wallet className="w-12 h-12 text-primary mb-2" />
              {availableBalance >= minPayoutAmount ? (
                <p className="text-sm text-green-600">Ready for payout</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Minimum {CURRENCY.symbol}{minPayoutAmount} required
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">All time requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Successful payouts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {CURRENCY.symbol}{stats.totalPaidOut.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total withdrawn</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Track all your payout requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {payoutsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
          ) : payouts && payouts.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Processed</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-medium">
                        {CURRENCY.symbol}{parseFloat(payout.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell>
                        {payout.bankDetails?.upi ? "UPI" : "Bank Transfer"}
                      </TableCell>
                      <TableCell>{formatDate(payout.requestedAt!)}</TableCell>
                      <TableCell>
                        {payout.processedAt ? formatDate(payout.processedAt) : "-"}
                      </TableCell>
                      <TableCell>
                        {payout.adminNotes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payout requests</h3>
              <p className="text-muted-foreground mb-6">
                Request your first payout when you have at least {CURRENCY.symbol}{minPayoutAmount} available
              </p>
              <Button 
                className="btn-primary" 
                onClick={() => setIsDialogOpen(true)}
                disabled={availableBalance < minPayoutAmount}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Request Payout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
