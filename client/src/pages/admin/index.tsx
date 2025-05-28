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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { PAYOUT_STATUSES, CURRENCY } from "@/lib/constants";
import { 
  LayoutDashboard,
  Users,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Search,
  Filter,
  Download,
  Shield,
  AlertTriangle,
  Banknote,
  UserCheck,
  Package
} from "lucide-react";
import type { Payout, User, Order } from "@shared/schema";

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: pendingPayouts, isLoading: payoutsLoading } = useQuery<Payout[]>({
    queryKey: ["/api/admin/payouts"],
  });

  const updatePayoutMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/admin/payouts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payouts"] });
      setIsPayoutDialogOpen(false);
      setSelectedPayout(null);
      toast({
        title: "Payout updated successfully",
        description: "The payout status has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update payout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const PayoutReviewDialog = () => {
    const [status, setStatus] = useState(selectedPayout?.status || PAYOUT_STATUSES.PENDING);
    const [notes, setNotes] = useState(selectedPayout?.adminNotes || "");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedPayout) return;

      updatePayoutMutation.mutate({
        id: selectedPayout.id,
        data: {
          status,
          adminNotes: notes
        }
      });
    };

    return (
      <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Payout Request</DialogTitle>
            <DialogDescription>
              Review and process payout request #{selectedPayout?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayout && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payout Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-sm text-muted-foreground">Amount</Label>
                  <p className="font-semibold">
                    {CURRENCY.symbol}{parseFloat(selectedPayout.amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Creator ID</Label>
                  <p className="font-semibold">#{selectedPayout.creatorId}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Requested</Label>
                  <p className="font-semibold">
                    {new Date(selectedPayout.requestedAt!).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Payment Method</Label>
                  <p className="font-semibold">
                    {selectedPayout.bankDetails?.upi ? "UPI" : "Bank Transfer"}
                  </p>
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-4">
                <h4 className="font-semibold">Payment Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedPayout.bankDetails?.upi ? (
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">UPI ID</Label>
                      <p className="font-medium">{selectedPayout.bankDetails.upi}</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label className="text-muted-foreground">Account Number</Label>
                        <p className="font-medium">{selectedPayout.bankDetails?.accountNumber}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">IFSC Code</Label>
                        <p className="font-medium">{selectedPayout.bankDetails?.ifsc}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Account Holder</Label>
                        <p className="font-medium">{selectedPayout.bankDetails?.accountHolderName}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Bank Name</Label>
                        <p className="font-medium">{selectedPayout.bankDetails?.bankName}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Status Update */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PAYOUT_STATUSES.PENDING}>Pending</SelectItem>
                      <SelectItem value={PAYOUT_STATUSES.PROCESSING}>Processing</SelectItem>
                      <SelectItem value={PAYOUT_STATUSES.COMPLETED}>Completed</SelectItem>
                      <SelectItem value={PAYOUT_STATUSES.REJECTED}>Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Admin Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this payout..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setIsPayoutDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-primary" disabled={updatePayoutMutation.isPending}>
                  Update Payout
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
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

  // Calculate stats
  const stats = {
    totalPayouts: pendingPayouts?.length || 0,
    pendingAmount: pendingPayouts
      ?.filter(p => p.status === PAYOUT_STATUSES.PENDING)
      .reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0,
    completedToday: pendingPayouts
      ?.filter(p => {
        const today = new Date().toDateString();
        const processedDate = p.processedAt ? new Date(p.processedAt).toDateString() : null;
        return p.status === PAYOUT_STATUSES.COMPLETED && processedDate === today;
      }).length || 0,
    pendingCount: pendingPayouts?.filter(p => p.status === PAYOUT_STATUSES.PENDING).length || 0
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
          <p className="text-muted-foreground">Manage platform operations and creator payouts</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Payouts</span>
            </TabsTrigger>
            <TabsTrigger value="creators" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Creators</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPayouts}</div>
                  <p className="text-xs text-muted-foreground">All time requests</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {CURRENCY.symbol}{stats.pendingAmount.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
                  <p className="text-xs text-muted-foreground">Processed today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.pendingCount}</div>
                  <p className="text-xs text-muted-foreground">Requires action</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payout Requests</CardTitle>
                <CardDescription>Latest payout requests requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                {payoutsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
                    ))}
                  </div>
                ) : pendingPayouts && pendingPayouts.length > 0 ? (
                  <div className="space-y-4">
                    {pendingPayouts.slice(0, 10).map((payout) => (
                      <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                            <Banknote className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">
                              Payout Request #{payout.id}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Creator #{payout.creatorId} • {formatDate(payout.requestedAt!)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-bold">
                              {CURRENCY.symbol}{parseFloat(payout.amount).toLocaleString()}
                            </div>
                            {getStatusBadge(payout.status)}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPayout(payout);
                              setIsPayoutDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No pending payouts</h3>
                    <p className="text-muted-foreground">
                      All payout requests have been processed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payout Management</CardTitle>
                    <CardDescription>Review and process creator payout requests</CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {payoutsLoading ? (
                  <div className="space-y-4">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
                    ))}
                  </div>
                ) : pendingPayouts && pendingPayouts.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Request ID</TableHead>
                          <TableHead>Creator</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingPayouts.map((payout) => (
                          <TableRow key={payout.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">#{payout.id}</TableCell>
                            <TableCell>Creator #{payout.creatorId}</TableCell>
                            <TableCell className="font-medium">
                              {CURRENCY.symbol}{parseFloat(payout.amount).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {payout.bankDetails?.upi ? "UPI" : "Bank Transfer"}
                            </TableCell>
                            <TableCell>{getStatusBadge(payout.status)}</TableCell>
                            <TableCell>{formatDate(payout.requestedAt!)}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPayout(payout);
                                  setIsPayoutDialogOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No payout requests</h3>
                    <p className="text-muted-foreground">
                      All payout requests have been processed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="creators" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Creator Management</CardTitle>
                <CardDescription>Monitor and manage creator accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Creator Management</h3>
                  <p className="text-muted-foreground">
                    Creator management features will be available soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Monitor platform performance and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">
                    Advanced analytics and reporting features coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <PayoutReviewDialog />
      </div>
    </div>
  );
}
