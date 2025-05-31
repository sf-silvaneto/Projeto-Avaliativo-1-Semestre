// src/App.tsx
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
import DashboardPage from './pages/dashboard/DashboardPage';

// Pages - Prontuarios
import ProntuarioListPage from './pages/prontuario/ProntuarioListPage';
import ProntuarioCreatePage from './pages/prontuario/ProntuarioCreatePage';
import ProntuarioDetailPage from './pages/prontuario/ProntuarioDetailPage';
import ProntuarioEditPage from './pages/prontuario/ProntuarioEditPage';

// Pages - Medicos
import MedicoListPage from './pages/medico/MedicoListPage';
import MedicoCreatePage from './pages/medico/MedicoCreatePage';
import MedicoEditPage from './pages/medico/MedicoEditPage';

// Pages - Pacientes
import PacienteListPage from './pages/paciente/PacienteListPage';
import PacienteCreatePage from './pages/paciente/PacienteCreatePage';
import PacienteEditPage from './pages/paciente/PacienteEditPage';
// import PacienteDetailPage from './pages/paciente/PacienteDetailPage'; // Se for criar, descomente e importe


// Pages - Legal
import TermosDeUsoPage from './pages/legal/TermosDeUsoPage'; 
import PoliticaDePrivacidadePage from './pages/legal/PoliticaDePrivacidadePage'; 

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
            <Route path="/termos" element={<TermosDeUsoPage />} />
            <Route path="/privacidade" element={<PoliticaDePrivacidadePage />} />
          </Route>
          
          {/* Restricted Public Routes (not accessible when logged in) */}
          <Route element={<PublicRoute restricted={true} />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<RegisterPage />} />
            <Route path="/recuperar-senha" element={<ResetPasswordPage />} />
          </Route>
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/painel-de-controle" element={<DashboardPage />} />
            
            <Route path="/prontuarios" element={<ProntuarioListPage />} />
            <Route path="/prontuarios/novo" element={<ProntuarioCreatePage />} />
            <Route path="/prontuarios/:id" element={<ProntuarioDetailPage />} />
            <Route path="/prontuarios/:id/editar" element={<ProntuarioEditPage />} />
            
            <Route path="/perfil" element={<ProfilePage />} />
            
            <Route path="/medicos" element={<MedicoListPage />} />
            <Route path="/medicos/novo" element={<MedicoCreatePage />} />
            <Route path="/medicos/:id/editar" element={<MedicoEditPage />} />

            {/* ROTAS PARA PACIENTES */}
            <Route path="/pacientes" element={<PacienteListPage />} />
            <Route path="/pacientes/novo" element={<PacienteCreatePage />} />
            <Route path="/pacientes/:id/editar" element={<PacienteEditPage />} />
            {/* A linha abaixo estava causando o erro de comentário não terminado.
                Se PacienteDetailPage for implementada, adicione a rota corretamente:
            <Route path="/pacientes/:id" element={<PacienteDetailPage />} />
            */}
          </Route>
          
          <Route path="/home" element={<Navigate to="/" replace />} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
