import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CssBaseline, Box } from '@mui/material';
// 1. Імпорт ThemeProvider та нашої теми
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

// Сторінки
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorCabinet from './pages/DoctorCabinet';
import PatientProfile from './pages/PatientProfile';
import AdminPanel from './pages/AdminPanel';

// Компоненти
import RequireAuth from './components/RequireAuth';
import NavBar from './components/NavBar';
import Footer from './components/Footer';

function App() {
  return (
    // 2. Обгортаємо весь додаток у ThemeProvider
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          <CssBaseline /> {/* Скидання стилів + застосування фону з теми */}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            
            <NavBar />
            
            <Box component="main" sx={{ flexGrow: 1, pb: 4 }}>
              <Routes>
                {/* Публічні маршрути */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/doctors" element={<DoctorsPage />} />

                {/* Захищені маршрути для Пацієнта */}
                <Route element={<RequireAuth allowedRoles={['patient']} />}>
                  <Route path="/profile" element={<PatientProfile />} />
                </Route>

                {/* Захищені маршрути для Лікаря */}
                <Route element={<RequireAuth allowedRoles={['doctor']} />}>
                  <Route path="/doctor-cabinet" element={<DoctorCabinet />} />
                </Route>

                {/* Захищені маршрути для Адміна */}
                <Route element={<RequireAuth allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<AdminPanel />} />
                </Route>
              </Routes>
            </Box>

            <Footer />
            
          </Box>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;