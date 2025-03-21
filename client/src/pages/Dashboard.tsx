import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChatbots } from "@/api/chatbots";
import { getOrganizations } from "@/api/organizations";
import { getActiveUsersCount } from "@/api/activeUsers";
import { getSubscriptionStatus } from "@/api/subscription";
import { Bot, Building2, Users, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export function Dashboard() {
  const [chatbots, setChatbots] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState({
    subscriptionStatus: '',
    paymentVerified: false
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [chatbotsData, orgsData, activeUsersData, subscriptionData] = await Promise.all([
          getChatbots(),
          getOrganizations(),
          getActiveUsersCount(),
          getSubscriptionStatus()
        ]);
        setChatbots(chatbotsData.chatbots);
        setOrganizations(orgsData.organizations);
        setActiveUsers(activeUsersData.count);

        if (subscriptionData.success) {
          setSubscription(subscriptionData.data);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load dashboard data"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up interval to refresh active users count every minute
    const interval = setInterval(async () => {
      try {
        const activeUsersData = await getActiveUsersCount();
        setActiveUsers(activeUsersData.count);
      } catch (error) {
        console.error("Failed to refresh active users count:", error);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [toast]);

  // Helper function to get subscription status display
  const getSubscriptionStatusDisplay = () => {
    switch (subscription.subscriptionStatus) {
      case 'active':
        return { text: 'Active', className: 'bg-green-100 text-green-800' };
      case 'pending':
        return { text: 'Pending', className: 'bg-yellow-100 text-yellow-800' };
      case 'cancelled':
        return { text: 'Cancelled', className: 'bg-red-100 text-red-800' };
      case 'expired':
        return { text: 'Expired', className: 'bg-red-100 text-red-800' };
      default:
        return { text: 'None', className: 'bg-gray-100 text-gray-800' };
    }
  };

  const statusDisplay = getSubscriptionStatusDisplay();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chatbots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : chatbots.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : organizations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="text-2xl font-bold flex items-center gap-2">
                {loading ? "..." : (
                  <>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusDisplay.className}`}>
                      {statusDisplay.text}
                    </span>
                  </>
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {loading ? "" : (subscription.paymentVerified ? "Payment verified" : "Payment not verified")}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Chatbots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : chatbots.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No chatbots found</div>
              ) : (
                chatbots.map(bot => (
                  <div key={bot._id} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                    <div>
                      <p className="font-medium">{bot.name}</p>
                      <p className="text-sm text-muted-foreground">{bot.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      bot.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bot.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : organizations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No organizations found</div>
              ) : (
                organizations.map(org => (
                  <div key={org._id} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-sm text-muted-foreground">{org.industry}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {org.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}