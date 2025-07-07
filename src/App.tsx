import React, { useEffect, useState } from "react";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import LoadingScreen from "./components/LoadingScreen";
import { useNavigationGestures } from './hooks/useNavigationGestures';
import { history } from './history';
import PaymentDetails from '@/pages/PaymentDetails';

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
import TermsOfUse from "./pages/TermsOfUse";
import ReturnPolicy from "./pages/ReturnPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// Providers
import { CartProvider } from "./hooks/useCart";
import { AuthProvider } from "./contexts/AuthContext";
import { CouponStateProvider } from "./components/CouponStateManager";
import ProtectedRoute from "./components/ProtectedRoute";
import OrderCompletedGuard from "./components/OrderCompletedGuard";
import ErrorBoundary from './components/ErrorBoundary';

// Services initialization
import { initializeApp, setupPerformanceMonitoring } from "./utils/appInitializer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (typeof error === 'object' && error !== null && 'status' in error) {
          if ((error as any).status === 404) return false;
        }
        return failureCount < 2;
      },
      staleTime: 0, // Set to 0 to force fresh data
      cacheTime: 0, // Disable caching
      refetchOnWindowFocus: true,
      refetchOnMount: true
    }
  }
});

const AppContent = () => {
  console.log('AppContent rendering');
  useNavigationGestures();

  // Add this effect to ensure proper history tracking
  useEffect(() => {
    const isCapacitor = !!(window as any).Capacitor;
    if (isCapacitor) {
      // Add this to ensure proper history management
      window.addEventListener('popstate', (event) => {
        console.log('popstate event', event);
      });
    }
  }, []);

  return (
    <ErrorBoundary>
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
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Add this line */}
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
        <Route path="/payment-details" element={<PaymentDetails />} />
      </Routes>
    </ErrorBoundary>
  );
};

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeApp();
        setupPerformanceMonitoring();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitError(error instanceof Error ? error : new Error('Unknown initialization error'));
        setIsInitialized(true); // Still mark as initialized so we can show error UI
      }
    };
    initialize();
  }, []);

  if (initError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
        <p className="text-gray-700 mb-4">We encountered an error while starting the app.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Reload App
        </button>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" attribute="class">
        <ErrorBoundary>
          <AuthProvider>
            {!isInitialized ? (
              <LoadingScreen />
            ) : (
              <CartProvider>
                <CouponStateProvider>
                  <TooltipProvider>
                    <ErrorBoundary>
                      <AppContent />
                      <Toaster />
                    </ErrorBoundary>
                  </TooltipProvider>
                </CouponStateProvider>
              </CartProvider>
            )}
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );  
};

export default App;
