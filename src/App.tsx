import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Address from './pages/Address';
import Payment from './pages/Payment';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ChangePassword from './pages/ChangePassword';
import Contact from './pages/Contact';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Explore from './pages/Explore';
import WriteReview from './pages/WriteReview';
import { useNavigationGestures } from './hooks/useNavigationGestures';
import Invoice from './pages/Invoice';
import DeepLinkHandler from '@/components/DeepLinkHandler';
import MobileAppRedirect from '@/components/MobileAppRedirect';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useNavigationGestures();

  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    setIsAppReady(true);
  }, []);

  if (!isAppReady) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <DeepLinkHandler />
          <MobileAppRedirect />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/address" element={<Address />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order/:orderId" element={<OrderDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile/change-password" element={<ChangePassword />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/write-review/:productId" element={<WriteReview />} />
            <Route path="/invoice/:orderId" element={<Invoice />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
