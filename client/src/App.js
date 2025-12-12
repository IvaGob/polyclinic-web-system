import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CssBaseline } from '@mui/material';

// Імпорт сторінок
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorCabinet from './pages/DoctorCabinet';
import PatientProfile from './pages/PatientProfile';
import AdminPanel from './pages/AdminPanel';

// Імпорт компонента захисту
import RequireAuth from './components/RequireAuth';
import NavBar from './components/NavBar';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CssBaseline /> {/* Нормалізація стилів Material UI */}
        <NavBar />
        <Routes>
          {/* --- ПУБЛІЧНІ МАРШРУТИ (Доступні всім) --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />

          {/* --- ЗАХИЩЕНІ МАРШРУТИ --- */}
          
          {/* Тільки для ПАЦІЄНТІВ */}
          <Route element={<RequireAuth allowedRoles={['patient']} />}>
            <Route path="/profile" element={<PatientProfile />} />
          </Route>

          {/* Тільки для ЛІКАРІВ */}
          <Route element={<RequireAuth allowedRoles={['doctor']} />}>
            <Route path="/doctor-cabinet" element={<DoctorCabinet />} />
          </Route>

          {/* Тільки для АДМІНІСТРАТОРА */}
          <Route element={<RequireAuth allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>

          {/* Маршрут для помилок (404) - опціонально */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;