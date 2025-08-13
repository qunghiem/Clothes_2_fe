// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from "./pages/Home";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AutoLogoutProvider } from "./components/AutoLogoutProvider";
import { SessionTimeoutWarning } from "./components/SessionTimeoutWarning";
import { initializeApp } from './store/slices/authSlice';

const App = () => {
  const dispatch = useDispatch();

  // Initialize app when component mounts
  useEffect(() => {
    dispatch(initializeApp());
  }, [dispatch]);

  return (
    <AutoLogoutProvider 
      timeoutDuration={5 * 60 * 1000} // 5 minutes
      warningDuration={30 * 1000}      // 30 seconds warning
      showWarning={true}
    >
      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        
        {/* Session Timeout Warning Modal */}
        <SessionTimeoutWarning />
        
        <Navbar />
        <SearchBar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/place-order" element={
            <ProtectedRoute>
              <PlaceOrder />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
        
        <Footer />
      </div>
    </AutoLogoutProvider>
  );
};

export default App;