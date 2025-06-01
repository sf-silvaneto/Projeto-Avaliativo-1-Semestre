// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProfilePage from './pages/profile/ProfilePage';
import DashboardPage from './pages/dashboard/DashboardPage';

import ProntuarioListPage from './pages/prontuario/ProntuarioListPage';
import ProntuarioCreatePage from './pages/prontuario/ProntuarioCreatePage'; // Usado para criar prontuário com primeiro evento
import ProntuarioDetailPage from './pages/prontuario/ProntuarioDetailPage';
import ProntuarioEditPage from './pages/prontuario/ProntuarioEditPage'; // Para editar dados básicos do prontuário
// import AdicionarRegistroProntuarioPage from './pages/prontuario/AdicionarRegistroProntuarioPage'; // NOVA PÁGINA/COMPONENTE

import MedicoListPage from './pages/medico/MedicoListPage';
import MedicoCreatePage from './pages/medico/MedicoCreatePage';
import MedicoEditPage from './pages/medico/MedicoEditPage';
import MedicoDetailPage from './pages/medico/MedicoDetailPage';

import PacienteListPage from './pages/paciente/PacienteListPage';
import PacienteCreatePage from './pages/paciente/PacienteCreatePage';
import PacienteEditPage from './pages/paciente/PacienteEditPage';
import PacienteDetailPage from './pages/paciente/PacienteDetailPage';

import TermosDeUsoPage from './pages/legal/TermosDeUsoPage'; 
import PoliticaDePrivacidadePage from './pages/legal/PoliticaDePrivacidadePage'; 
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
          
          <Route element={<PublicRoute restricted={true} />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<RegisterPage />} />
            <Route path="/recuperar-senha" element={<ResetPasswordPage />} />
          </Route>
          
          <Route element={<ProtectedRoute />}>
            <Route path="/painel-de-controle" element={<DashboardPage />} />
            
            <Route path="/prontuarios" element={<ProntuarioListPage />} />
            {/* ProntuarioCreatePage agora inicia o wizard para criar o prontuário E o primeiro registro */}
            <Route path="/prontuarios/novo" element={<ProntuarioCreatePage />} /> 
            <Route path="/prontuarios/:id" element={<ProntuarioDetailPage />} />
            <Route path="/prontuarios/:id/editar" element={<ProntuarioEditPage />} /> {/* Para editar dados do ProntuarioEntity em si */}
            
            {/* Rota para adicionar um novo registro (Consulta, Internação, etc.) a um prontuário EXISTENTE */}
            {/* <Route path="/prontuarios/:id/novo-registro" element={<AdicionarRegistroProntuarioPage />} /> */}
            {/* O AdicionarRegistroProntuarioPage seria um componente que permite escolher o tipo de registro e então renderiza o formulário específico (ConsultaForm, InternacaoForm etc.), passando o prontuarioId. */}


            <Route path="/perfil" element={<ProfilePage />} />
            
            <Route path="/medicos" element={<MedicoListPage />} />
            <Route path="/medicos/novo" element={<MedicoCreatePage />} />
            <Route path="/medicos/:id/editar" element={<MedicoEditPage />} />
            <Route path="/medicos/:id" element={<MedicoDetailPage />} />

            <Route path="/pacientes" element={<PacienteListPage />} />
            <Route path="/pacientes/novo" element={<PacienteCreatePage />} />
            <Route path="/pacientes/:id/editar" element={<PacienteEditPage />} />
            <Route path="/pacientes/:id" element={<PacienteDetailPage />} />
          </Route>
          
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;