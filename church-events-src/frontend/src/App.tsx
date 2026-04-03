import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/useAuth';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import EventDetail from './pages/EventDetail';
import BookingFlow from './pages/BookingFlow';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/dashboard/Dashboard';
import DashboardBookings from './pages/dashboard/DashboardBookings';
import DashboardSponsors from './pages/dashboard/DashboardSponsors';
import DashboardSettings from './pages/dashboard/DashboardSettings';
import DashboardUsers from './pages/dashboard/DashboardUsers';
import DashboardPricing from './pages/dashboard/DashboardPricing';
import DashboardEvents from './pages/dashboard/DashboardEvents';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Protect routes that require login
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Protect routes that require Responsible or Admin role
const StaffRoute = ({ children }: { children: React.ReactNode }) => {
  const { isResponsible, isLoading } = useAuth();
  if (isLoading) return null;
  return isResponsible ? <>{children}</> : <Navigate to="/" />;
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/booking/:eventId" element={<BookingFlow />} />
        <Route path="/booking/confirmation/:id" element={<BookingConfirmation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Registered users */}
        <Route path="/my-bookings" element={
          <PrivateRoute><MyBookings /></PrivateRoute>
        } />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Staff only */}
        <Route path="/dashboard" element={
          <StaffRoute><Dashboard /></StaffRoute>
        } />
        <Route path="/dashboard/bookings" element={
          <StaffRoute><DashboardBookings /></StaffRoute>
        } />
        <Route path="/dashboard/sponsors" element={
          <StaffRoute><DashboardSponsors /></StaffRoute>
        } />
        <Route path="/dashboard/settings" element={
          <StaffRoute><DashboardSettings /></StaffRoute>
        } />
        <Route path="/dashboard/pricing/:eventId" element={
          <StaffRoute><DashboardPricing /></StaffRoute>
        } />

        import DashboardEvents from './pages/dashboard/DashboardEvents';

<Route path="/dashboard/events" element={
  <StaffRoute><DashboardEvents /></StaffRoute>
} />

        {/* Admin only */}
        <Route path="/dashboard/users" element={
          <StaffRoute><DashboardUsers /></StaffRoute>
        } />
      </Routes>
    </>
  );
}

export default App;