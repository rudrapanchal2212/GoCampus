import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import AddEvent from './pages/AddEvent';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import RegistrationManagement from './pages/RegistrationManagement';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentProfile from './pages/StudentProfile';
import LandingPage from './pages/LandingPage';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthContext from './context/AuthContext';
import './styles.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  // If student hasn't completed profile, redirect to profile page
  if (user.role === 'student' && !user.profileCompleted) {
    return <Navigate to="/profile" />;
  }

  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (user && (user.role === 'admin' || user.role === 'coordinator')) return children;
  return <Navigate to="/dashboard" />; // Redirect to dashboard if not admin or coordinator
};

// Profile Route (for students who haven't completed profile)
const ProfileRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  // If loading, show spinner or nothing
  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;
  return children;
};

// Public Route (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/dashboard" />;
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/signup', '/'];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="App">
      {showNavbar && <Navbar />}
      <div className={showNavbar ? "content" : ""}>
        <Routes>
          {/* Public Routes - Wrapped in PublicRoute to prevent access when logged in */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Student Profile Route */}
          <Route path="/profile" element={<ProfileRoute><StudentProfile /></ProfileRoute>} />

          {/* Protected Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />

          {/* Admin Only Routes */}
          <Route path="/add-event" element={<AdminRoute><AddEvent /></AdminRoute>} />
          <Route path="/edit-event/:id" element={<AdminRoute><AddEvent /></AdminRoute>} />
          <Route path="/students" element={<AdminRoute><Students /></AdminRoute>} />
          <Route path="/attendance" element={<AdminRoute><Attendance /></AdminRoute>} />
          <Route path="/registrations" element={<AdminRoute><RegistrationManagement /></AdminRoute>} />
        </Routes>
      </div>
      <ToastContainer />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
