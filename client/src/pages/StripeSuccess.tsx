import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifySubscriptionPayment } from "@/api/stripe";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";

export function StripeSuccess() {
  const [verifying, setVerifying] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const sessionId = queryParams.get("session_id");

        if (!sessionId) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "No session ID found in URL"
          });
          navigate("/register");
          return;
        }

        const result = await verifySubscriptionPayment(sessionId);

        if (result.success && result.data.verified) {
          // If we received authentication tokens, store them
          if (result.data.accessToken && result.data.refreshToken) {
            localStorage.setItem('accessToken', result.data.accessToken);
            localStorage.setItem('refreshToken', result.data.refreshToken);

            // Update auth context if needed
            if (login && result.data.user) {
              login(result.data.user);
            }
          }

          toast({
            title: "Payment Successful",
            description: "Your subscription has been activated"
          });
          navigate("/dashboard");
        } else {
          toast({
            variant: "destructive",
            title: "Verification Failed",
            description: "Could not verify your payment"
          });
          navigate("/register");
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to verify payment"
        });
        navigate("/register");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [location, navigate, toast, login]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing Your Payment</h1>
        {verifying ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Please wait while we verify your payment...</p>
          </div>
        ) : (
          <p>Redirecting you to the dashboard...</p>
        )}
      </div>
    </div>
  );
}