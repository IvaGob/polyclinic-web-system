import React, { useState } from 'react';
import { TextField, Button, Container, Paper, Typography, Box, Alert, MenuItem } from '@mui/material';
import axios from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        gender: 'male' // Значення за замовчуванням
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Універсальний обробник змін в полях
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Формуємо об'єкт для відправки на сервер
            // Додаємо role: 'patient', бо ця форма для пацієнтів
            const payload = {
                ...formData,
                role: 'patient'
            };

            await axios.post('/auth/register', payload);
            
            // Якщо все добре - перенаправляємо на логін
            alert('Реєстрація успішна! Тепер увійдіть.');
            navigate('/login');
            
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Помилка реєстрації. Перевірте дані.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Реєстрація пацієнта
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="ПІБ (Повне ім'я)"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Email адреса"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Пароль"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Телефон"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                        
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <TextField
                                required
                                fullWidth
                                label="Дата народження"
                                type="date"
                                name="dateOfBirth"
                                InputLabelProps={{ shrink: true }}
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                            />
                            <TextField
                                select
                                required
                                fullWidth
                                label="Стать"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <MenuItem value="male">Чоловік</MenuItem>
                                <MenuItem value="female">Жінка</MenuItem>
                            </TextField>
                        </Box>

                        <TextField
                            margin="normal"
                            fullWidth
                            label="Адреса проживання"
                            name="address"
                            multiline
                            rows={2}
                            value={formData.address}
                            onChange={handleChange}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? 'Реєстрація...' : 'Зареєструватися'}
                        </Button>
                        
                        <Box textAlign="center">
                            <Link to="/login" style={{ textDecoration: 'none' }}>
                                Вже є акаунт? Увійти
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default RegisterPage;