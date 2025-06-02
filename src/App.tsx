import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen";

// Pages
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import Address from "./pages/Address";
import Payment from "./pages/Payment";
import OrderConfirmation from "./pages/OrderConfirmation";
import ForgotPassword from "./pages/ForgotPassword";
import OrderHistory from "./pages/OrderHistory";
import OrderDetails from "./pages/OrderDetails";
import ChangePassword from "./pages/ChangePassword";
import PrivacySettings from "./pages/PrivacySettings";
import AboutUs from "./pages/AboutUs";

// Providers
import { CartProvider } from "./hooks/useCart";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import OrderCompletedGuard from "./components/OrderCompletedGuard";
import ErrorBoundary from './components/ErrorBoundary';

// Services initialization
import { initializeApp, setupPerformanceMonitoring } from "./utils/appInitializer";
import { trackError } from "./utils/errorTracking";

// Create a client with proper error handling and retry logic
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 404 errors
        if (typeof error === 'object' && error !== null && 'status' in error) {
          if ((error as any).status === 404) return false;
        }
        
        // Retry a maximum of 2 times for other errors
        return failureCount < 2;
      },
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
      refetchOnMount: true
    }
  }
});

// Add this import
import WriteReview from "./pages/WriteReview";
// Add this import at the top with other page imports
import Wishlist from "./pages/Wishlist";

// Then add this route inside the Routes component (around line 125)
<Route path="/wishlist" element={<Wishlist />} />

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Initialize application services
    initializeApp();
    
    // Set up performance monitoring
    setupPerformanceMonitoring();
    
    // Simulate loading time (you can remove this in production)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                {/* Make sure this matches the parameter name in useParams */}
                <Route path="/cart" element={<Cart />} />
                <Route path="/address" element={
                  <ProtectedRoute>
                    <OrderCompletedGuard>
                      <Address />
                    </OrderCompletedGuard>
                  </ProtectedRoute>
                } />
                <Route path="/payment" element={
                  <ProtectedRoute>
                    <OrderCompletedGuard>
                      <ErrorBoundary>
                        <Payment />
                      </ErrorBoundary>
                    </OrderCompletedGuard>
                  </ProtectedRoute>
                } />
                <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                <Route path="/order/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/orders" element={<Navigate to="/order-history" replace />} />
                
                {/* Routes */}
                <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                <Route path="/privacy-settings" element={<ProtectedRoute><PrivacySettings /></ProtectedRoute>} />
                <Route path="/about-us" element={<AboutUs />} />
                
                <Route path="*" element={<NotFound />} />
                
                {/* Add this route inside the Routes component */}
                <Route path="/write-review/:productId" element={<ProtectedRoute><WriteReview /></ProtectedRoute>} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
