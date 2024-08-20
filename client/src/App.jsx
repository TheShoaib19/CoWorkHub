import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import About from './pages/About';
import Profile from './pages/Profile';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import CreateListing from './pages/CreateListing';
import AddCatering from './pages/AddCatering';
import UpdateCatering from './pages/UpdateCatering';
import Catering from './pages/Catering';
import UpdateListing from './pages/UpdateListing';
import Listing from './pages/Listing';
import Search from './pages/Search';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Cart from './pages/Cart';
import OrderConfirmation from './pages/OrderConfirmation';
import AdminDashboard from './components/AdminDashboard.jsx';

const stripePromise = loadStripe('pk_test_51PgfU0Boz0A99JEO1G6KfGLccZvr0fY0CpJKW28xGcUcif4Ra2qPtjDB5oVfwARnCm8En9moAYfUkMPzOr8hWogw00hGZ45q4M'); 
export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Elements stripe={stripePromise}>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/sign-in' element={<SignIn />} />
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
        <Route path='/about' element={<About />} />
        <Route path='/search' element={<Search />} />
        <Route path='/listing/:listingId' element={<Listing />} />
        <Route path='/catering/get/:cateringId' element={<Catering />} />
        <Route path='/cart' element={<Cart />} /> 
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route element={<PrivateRoute />}>
          <Route path='/profile' element={<Profile />} />
          <Route path='/create-listing' element={<CreateListing />} />
          <Route path='/AddCatering' element={<AddCatering />} />
          <Route path='/update-listing/:listingId' element={<UpdateListing />} />
          <Route path='/UpdateCatering/:cateringId' element={<UpdateCatering />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
      </Elements>
    </BrowserRouter>
  );
}
