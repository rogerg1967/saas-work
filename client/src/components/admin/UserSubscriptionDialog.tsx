import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserSubscriptionDetails, updateUserSubscriptionStatus } from "@/api/admin";
import { useToast } from "@/hooks/useToast";

interface UserSubscriptionDialogProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function UserSubscriptionDialog({
  userId,
  userName,
  open,
  onOpenChange,
  onUpdate,
}: UserSubscriptionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open && userId) {
      fetchSubscriptionDetails();
    }
  }, [open, userId]);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      const response = await getUserSubscriptionDetails(userId);
      setSubscription(response.data);
      setNewStatus(response.data.subscriptionStatus);
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

  const handleStatusUpdate = async () => {
    try {
      setLoading(true);
      await updateUserSubscriptionStatus(userId, newStatus);
      toast({
        title: "Success",
        description: "Subscription status updated successfully",
      });
      fetchSubscriptionDetails();
      onUpdate();
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "cancelled":
      case "expired":
        return "destructive";
      case "paused":
      case "past_due":
      case "unpaid":
        return "warning";
      case "trialing":
        return "info";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Manage Subscription for {userName}</DialogTitle>
          <DialogDescription>
            View and update subscription details for this user.
          </DialogDescription>
        </DialogHeader>

        {loading && !subscription ? (
          <div className="flex justify-center p-4">Loading subscription details...</div>
        ) : subscription ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Subscription Details
                  <Badge variant={getStatusBadgeVariant(subscription.subscriptionStatus)}>
                    {subscription.subscriptionStatus}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium">Plan:</div>
                  <div>{subscription.subscription?.planName || "No plan"}</div>

                  <div className="text-sm font-medium">Start Date:</div>
                  <div>{formatDate(subscription.subscription?.startDate)}</div>

                  <div className="text-sm font-medium">Current Period End:</div>
                  <div>{formatDate(subscription.subscription?.currentPeriodEnd)}</div>

                  <div className="text-sm font-medium">Payment Verified:</div>
                  <div>{subscription.paymentVerified ? "Yes" : "No"}</div>

                  <div className="text-sm font-medium">Customer ID:</div>
                  <div>{subscription.customerId || "N/A"}</div>

                  <div className="text-sm font-medium">Subscription ID:</div>
                  <div>{subscription.subscriptionId || "N/A"}</div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="status">Update Subscription Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="trialing">Trialing</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {subscription.invoices && subscription.invoices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {subscription.invoices.map((invoice: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-secondary rounded-md">
                        <div>
                          <div>{formatDate(invoice.date)}</div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.amount} {invoice.currency}
                          </div>
                        </div>
                        <Badge variant={invoice.status === "paid" ? "success" : "warning"}>
                          {invoice.status}
                        </Badge>
                        {invoice.pdfUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center p-4">No subscription data available</div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleStatusUpdate} disabled={loading || newStatus === subscription?.subscriptionStatus}>
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}