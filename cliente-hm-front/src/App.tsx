import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context providers
import { AuthProvider } from './context/AuthContext';

// Routes
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';

// Pages - Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Pages - Admin
import ProfilePage from './pages/profile/ProfilePage';

// Pages - Prontuarios
import ProntuarioListPage from './pages/prontuario/ProntuarioListPage';
import ProntuarioCreatePage from './pages/prontuario/ProntuarioCreatePage';
import ProntuarioDetailPage from './pages/prontuario/ProntuarioDetailPage';
import ProntuarioEditPage from './pages/prontuario/ProntuarioEditPage';

// Pages - Other
import HomePage from './pages/home/HomePage';
import NotFoundPage from './pages/error/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/termos" element={<div>Termos de Uso</div>} />
            <Route path="/privacidade" element={<div>Política de Privacidade</div>} />
          </Route>
          
          {/* Restricted Public Routes (not accessible when logged in) */}
          <Route element={<PublicRoute restricted={true} />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<RegisterPage />} />
            <Route path="/recuperar-senha" element={<ResetPasswordPage />} />
          </Route>
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/prontuarios" element={<ProntuarioListPage />} />
            <Route path="/prontuarios/novo" element={<ProntuarioCreatePage />} />
            <Route path="/prontuarios/:id" element={<ProntuarioDetailPage />} />
            <Route path="/prontuarios/:id/editar" element={<ProntuarioEditPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>
          
          {/* Redirect /home to / */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          
          {/* 404 - Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;