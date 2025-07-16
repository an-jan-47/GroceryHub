
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/Home';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import ForgotPassword from '@/pages/ForgotPassword';
import VerifyOTP from '@/pages/VerifyOTP';
import ResetPassword from '@/pages/ResetPassword';
import Profile from '@/pages/Profile';
import Cart from '@/pages/Cart';
import Payment from '@/pages/Payment';
import OrderHistory from '@/pages/OrderHistory';
import ProductDetail from '@/pages/ProductDetail';
import Search from '@/pages/Search';
import Address from '@/pages/Address';
import Coupons from '@/pages/Coupons';
import DeleteAccount from '@/pages/DeleteAccount';
import Explore from '@/pages/Explore';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/order-history" element={<OrderHistory />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/search" element={<Search />} />
      <Route path="/address" element={<Address />} />
      <Route path="/coupons" element={<Coupons />} />
      <Route path="/delete-account" element={<DeleteAccount />} />
      <Route path="/explore" element={<Explore />} />
    </Routes>
  );
};

export default AppRoutes;
