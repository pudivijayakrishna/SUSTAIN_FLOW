import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/auth";
import { AdminProvider } from "./context/AdminContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AboutUs from "./pages/AboutUs";
import User_Rewards from "./pages/User_Rewards";
import Agency_Rewards from "./pages/Agency_Rewards";
import Ngo_Rewards from "./pages/Ngo_Rewards";
import PrivateRoute from "./components/PrivateRoute";
import DonorHistory from "./components/DonorHistory";
import AgencyHistory from "./components/AgencyHistory";
import Ngo_History from "./pages/Ngo_History";
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ResubmitDocument from './pages/ResubmitDocument';
import DonorPickups from './pages/DonorPickups';

// Admin imports
import Dashboard from "./pages/admin/Dashboard";
import Verifications from "./pages/admin/Verifications";
import Users from "./pages/admin/Users";
import UserDetails from "./pages/admin/UserDetails";
import CreateUser from "./pages/admin/CreateUser";
import AdminPickupFeedback from "./pages/admin/AdminPickupFeedback";
import Feedback from "./pages/Feedback";
import FeedbackForm from "./pages/Feedbackform";

// Layout component for non-admin pages
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <div style={{ minHeight: 'calc(100vh - 200px)' }}>
      {children}
    </div>
    <Footer />
  </>
);

function App() {
  return (
    <AdminProvider>
      <AuthProvider>
        <div className="app">
          <Routes>
            {/* About Us route */}
            <Route path="/feedback" element={<FeedbackForm />} />

            <Route path="/about" element={
              <PublicLayout>
                <AboutUs />
              </PublicLayout>
            } />

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <PrivateRoute allowedRoles={["admin"]}>
                <Routes>
                  <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="users/create" element={<CreateUser />} />
                  <Route path="users/:userId" element={<UserDetails />} />
                  <Route path="verifications" element={<Verifications />} />
                  <Route path="pickup-feedback" element={<AdminPickupFeedback />} />
                </Routes>
              </PrivateRoute>
            } />

            {/* Public Routes */}
            <Route path="/" element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            } />
            <Route path="/login" element={
              <PublicLayout>
                <Login />
              </PublicLayout>
            } />
            <Route path="/register" element={
              <PublicLayout>
                <Register />
              </PublicLayout>
            } />

            {/* Protected Routes */}
            <Route path="/profile" element={
              <PublicLayout>
                <PrivateRoute allowedRoles={["donor", "ngo", "compostAgency"]}>
                  <Profile />
                </PrivateRoute>
              </PublicLayout>
            } />

            {/* NGO Routes */}
            <Route path="/ngo/*" element={
              <PublicLayout>
                <PrivateRoute allowedRoles={["ngo"]}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="rewards" element={<Ngo_Rewards />} />
                    <Route path="history" element={<Ngo_History />} />
                  </Routes>
                </PrivateRoute>
              </PublicLayout>
            } />

            {/* Donor Routes */}
            <Route path="/donor/*" element={
              <PublicLayout>
                <PrivateRoute allowedRoles={["donor"]}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="rewards" element={<User_Rewards />} />
                    <Route path="history" element={<DonorHistory />} />
                    <Route path="pickups" element={<DonorPickups />} />

                  </Routes>
                </PrivateRoute>

              </PublicLayout>
            } />

            {/* Agency Routes */}
            <Route path="/agency/*" element={
              <PublicLayout>
                <PrivateRoute allowedRoles={["compostAgency"]}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="rewards" element={<Agency_Rewards />} />
                    <Route path="history" element={<AgencyHistory />} />
                  </Routes>
                </PrivateRoute>
              </PublicLayout>
            } />

            {/* Change Password Route */}
            <Route path="/change-password" element={
              <PrivateRoute allowedRoles={["ngo", "compostAgency"]}>
                <ChangePassword />
              </PrivateRoute>
            } />

            {/* Forgot Password Route */}
            <Route path="/forgot-password" element={
              <PublicLayout>
                <ForgotPassword />
              </PublicLayout>
            } />

            {/* Reset Password Route */}
            <Route path="/reset-password/:token" element={
              <PublicLayout>
                <ResetPassword />
              </PublicLayout>
            } />

            {/* Resubmission Route */}
            <Route path="/resubmit-document/:token" element={
              <PublicLayout>
                <ResubmitDocument />
              </PublicLayout>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </AdminProvider>
  );
}

export default App;