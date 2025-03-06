import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { getSubscriptionPlans, createStripeCheckoutSession } from "@/api/stripe";
import { useToast } from "@/hooks/useToast";

export function Subscription() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getSubscriptionPlans();
        setPlans(data.plans);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load subscription plans: " + error.message,
        });
      }
    };
    fetchPlans();
  }, [toast]);

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(true);
      const response = await createStripeCheckoutSession(planId);

      if (response.success && response.data.url) {
        // Redirect to Stripe's checkout page
        window.location.href = response.data.url;
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create checkout session",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process subscription: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="max-w-6xl mx-auto pt-20 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground">
            Select the perfect plan for your business needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.id} className="backdrop-blur bg-background/95">
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-3xl font-bold">
                  £{plan.price}
                  <span className="text-lg text-muted-foreground">/month</span>
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Subscribe Now"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}