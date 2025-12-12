import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, MenuItem, Grid, Alert } from '@mui/material';
import axios from '../api/axios';

const AdminPanel = () => {
    const [specializations, setSpecializations] = useState([]);
    const [formData, setFormData] = useState({
        email: '', password: '', fullName: '', phone: '',
        specializationId: '', bio: '', cabinetNumber: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    // Завантаження спеціалізацій для випадаючого списку
    useEffect(() => {
        axios.get('/specializations').then(res => setSpecializations(res.data));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/admin/doctors', formData);
            setMessage({ type: 'success', text: 'Лікаря успішно створено!' });
            // Очищення форми
            setFormData({
                email: '', password: '', fullName: '', phone: '',
                specializationId: '', bio: '', cabinetNumber: ''
            });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Помилка створення' });
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Панель Адміністратора</Typography>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom>Додати нового лікаря</Typography>
                
                {message.text && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth required label="Email (Логін)" name="email" value={formData.email} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth required label="Пароль" name="password" type="password" value={formData.password} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth required label="ПІБ Лікаря" name="fullName" value={formData.fullName} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Телефон" name="phone" value={formData.phone} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth required select label="Спеціалізація" name="specializationId" value={formData.specializationId} onChange={handleChange}>
                                {specializations.map((spec) => (
                                    <MenuItem key={spec.id} value={spec.id}>{spec.name}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth required label="Кабінет №" name="cabinetNumber" value={formData.cabinetNumber} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <TextField fullWidth label="Біографія / Опис" name="bio" multiline rows={2} value={formData.bio} onChange={handleChange} />
                        </Grid>
                    </Grid>
                    <Button type="submit" variant="contained" sx={{ mt: 3 }} size="large">Створити лікаря</Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default AdminPanel;