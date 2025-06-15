import React, { useEffect, useState } from "react";
// Use only one Toaster implementation
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import LoadingScreen from "./components/LoadingScreen";
import { useNavigationGestures } from "./hooks/useNavigationGestures";

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
import Coupons from "./pages/Coupons";
import Categories from "./pages/Categories";
import WriteReview from "./pages/WriteReview";
import Wishlist from "./pages/Wishlist";
import HelpSupport from "./pages/HelpSupport";

// Providers
import { CartProvider } from "./hooks/useCart";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import OrderCompletedGuard from "./components/OrderCompletedGuard";
import ErrorBoundary from './components/ErrorBoundary';

// Services initialization
import { initializeApp, setupPerformanceMonitoring } from "./utils/appInitializer";

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

// Add these imports at the top with other page imports
import TermsOfUse from "./pages/TermsOfUse";
import ReturnPolicy from "./pages/ReturnPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const AppContent = () => {
  // Add global navigation gestures
  useNavigationGestures();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/product/:productId" element={<ProductDetail />} />
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
      <Route path="/categories" element={<Categories />} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
      <Route path="/order/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/orders" element={<Navigate to="/order-history" replace />} />
      
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/privacy-settings" element={<ProtectedRoute><PrivacySettings /></ProtectedRoute>} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/help-support" element={<HelpSupport />} />
      
      <Route path="/coupons" element={<Coupons />} />
      <Route path="/wishlist" element={<Wishlist />} />
      
      <Route path="*" element={<NotFound />} />
      
      <Route path="/write-review/:productId" element={<ProtectedRoute><WriteReview /></ProtectedRoute>} />
      <Route path="/terms-of-use" element={<TermsOfUse />} />
      <Route path="/return-policy" element={<ReturnPolicy />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    </Routes>
  );
};

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
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
              <BrowserRouter>
                <Toaster />
                <AppContent />
              </BrowserRouter>
            </ThemeProvider>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
