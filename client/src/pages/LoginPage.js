import React, { useState, useContext } from 'react';
import { TextField, Button, Container, Paper, Typography, Box, Alert } from '@mui/material';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('/auth/login', { email, password });
            // Отримуємо токен і роль від сервера
            const { token, role } = response.data; 
            
            // Декодуємо токен, щоб отримати дані користувача
            const userData = { role }; 
            
            login(token, userData);
            navigate('/'); // Перенаправлення на головну
        } catch (err) {
            if (!err?.response) {
                setError('Немає відповіді від сервера');
            } else if (err.response?.status === 400 || err.response?.status === 401) {
                setError('Невірний логін або пароль');
            } else {
                setError('Помилка входу');
            }
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography component="h1" variant="h5" align="center">
                        Вхід в систему
                    </Typography>
                    
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Email адреса"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Пароль"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Увійти
                        </Button>
                    </Box>
                    <Box textAlign="center" sx={{ mt: 2 }}>
                        <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2' }}>
                            Немає акаунту? Зареєструватися
                        </Link>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginPage;