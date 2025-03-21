import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/useToast";
import {
  getSubscriptionDetails,
  getInvoices,
  cancelSubscription
} from "@/api/subscription";
import { Loader2, AlertCircle, FileText, Calendar, CheckCircle, XCircle } from "lucide-react";

interface Invoice {
  invoiceId: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  pdfUrl: string;
}

interface SubscriptionDetails {
  subscriptionStatus: string;
  subscriptionId: string;
  paymentVerified: boolean;
  subscription: {
    planId: string;
    planName: string;
    startDate: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
  customerId: string;
}

export function SubscriptionManagement() {
  const [loading, setLoading] = useState(true);
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      setLoading(true);
      try {
        const detailsResponse = await getSubscriptionDetails();
        setSubscriptionDetails(detailsResponse.data);

        const invoicesResponse = await getInvoices();
        setInvoices(invoicesResponse.data.invoices);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [toast]);

  const handleCancelSubscription = async () => {
    setSuspendLoading(true);
    try {
      const response = await cancelSubscription();

      setSubscriptionDetails(prev => {
        if (!prev) return null;
        return {
          ...prev,
          subscription: {
            ...prev.subscription,
            cancelAtPeriodEnd: true
          }
        };
      });

      toast({
        title: "Subscription Updated",
        description: "Your subscription will be cancelled at the end of the current billing period.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setSuspendLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, label: string }> = {
      active: { color: "bg-green-500", label: "Active" },
      cancelled: { color: "bg-yellow-500", label: "Cancelled" },
      paused: { color: "bg-blue-500", label: "Paused" },
      past_due: { color: "bg-orange-500", label: "Past Due" },
      unpaid: { color: "bg-red-500", label: "Unpaid" },
      trialing: { color: "bg-purple-500", label: "Trial" },
      expired: { color: "bg-gray-500", label: "Expired" },
      none: { color: "bg-gray-500", label: "None" },
      pending: { color: "bg-blue-500", label: "Pending" }
    };

    const statusInfo = statusMap[status] || { color: "bg-gray-500", label: status };

    return (
      <Badge className={`${statusInfo.color} text-white`}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading subscription details...</span>
      </div>
    );
  }

  if (!subscriptionDetails || subscriptionDetails.subscriptionStatus === "none") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>You don't have an active subscription.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To access all features, please subscribe to one of our plans.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/subscription")}>View Plans</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>

      {/* Subscription Details */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Your Subscription</CardTitle>
              <CardDescription>Details about your current subscription</CardDescription>
            </div>
            {getStatusBadge(subscriptionDetails.subscriptionStatus)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plan</p>
                <p className="text-lg font-semibold">{subscriptionDetails.subscription?.planName || "Standard Plan"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="flex items-center">
                  {subscriptionDetails.subscriptionStatus === "active" ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <p className="text-lg font-semibold capitalize">{subscriptionDetails.subscriptionStatus}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p>{formatDate(subscriptionDetails.subscription?.startDate)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Period Ends</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p>{formatDate(subscriptionDetails.subscription?.currentPeriodEnd)}</p>
                </div>
              </div>
            </div>

            {subscriptionDetails.subscription?.cancelAtPeriodEnd && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-300">Subscription Cancellation</p>
                    <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                      Your subscription is set to cancel at the end of the current billing period on {formatDate(subscriptionDetails.subscription?.currentPeriodEnd)}.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/subscription")}>
            Change Plan
          </Button>

          {subscriptionDetails.subscriptionStatus === "active" && !subscriptionDetails.subscription?.cancelAtPeriodEnd && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={suspendLoading}>
                  {suspendLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Cancel Subscription"
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your subscription? Your subscription will remain active until the end of the current billing period, after which it will be cancelled.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelSubscription}>
                    Yes, Cancel Subscription
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your past invoices and payment history</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No invoices found</p>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.invoiceId} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        Invoice - {formatDate(invoice.date)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium">
                      {invoice.currency.toUpperCase()} {invoice.amount.toFixed(2)}
                    </p>
                    {invoice.pdfUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}