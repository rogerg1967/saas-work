import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { Home } from "./pages/Home"
import { Dashboard } from "./pages/Dashboard"
import { Chatbots } from "./pages/Chatbots"
import { Chat } from "./pages/Chat"
import { Organizations } from "./pages/OrganizationsNew"
import { Team } from "./pages/Team"
import { Settings } from "./pages/Settings"
import { Admin } from "./pages/Admin"
import { UserProfile } from "./pages/UserProfile"
import { StripeSuccess } from "./pages/StripeSuccess"
import { SubscriptionManagement } from "./pages/SubscriptionManagement"
import { Layout } from "./components/Layout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { useEffect } from "react"
import { recordActivity } from "./api/activeUsers"

function App() {
  useEffect(() => {
    // Record user activity every 5 minutes
    const activityInterval = setInterval(() => {
      if (localStorage.getItem('accessToken')) {
        recordActivity();
      }
    }, 5 * 60 * 1000);

    // Initial activity record
    if (localStorage.getItem('accessToken')) {
      recordActivity();
    }

    return () => clearInterval(activityInterval);
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/stripe-success" element={<StripeSuccess />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chatbots"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Chatbots />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chatbots/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Chat />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizations"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Organizations />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/team"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Team />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Admin />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SubscriptionManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App