import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import HomePage from "./pages/HomePage";
import CartPage from './pages/CartPage';
import { getCurrentUser } from './services/authService';

function App() {
  // Korumalı route için kontrol fonksiyonu
  const ProtectedRoute = ({ children, requireAdmin }) => {
    const user = getCurrentUser();
    
    if (!user) {
      return <Navigate to="/login" />;
    }

    if (requireAdmin && !user.isAdmin) {
      return <Navigate to="/home" />;
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/home" 
          element={
            <ProtectedRoute requireAdmin={false}>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/customer" 
          element={
            <ProtectedRoute requireAdmin={false}>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
