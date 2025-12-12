import React, { useEffect, useState, useContext } from 'react';
import { Container, Grid, Card, CardContent, Typography, CardActions, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Box } from '@mui/material';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DoctorsPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const { user } = useContext(AuthContext); // Отримуємо поточного користувача
    const navigate = useNavigate();

    // Завантаження списку лікарів при відкритті сторінки
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await axios.get('/doctors');
                setDoctors(res.data);
            } catch (err) {
                console.error("Помилка завантаження лікарів", err);
            }
        };
        fetchDoctors();
    }, []);

    // Обробка кліку "Записатися"
    const handleBookClick = (doctor) => {
        // 1. Якщо це Гість (не увійшов)
        if (!user) {
            if (window.confirm("Щоб записатися на прийом, необхідно увійти в систему. Перейти на сторінку входу?")) {
                navigate('/login');
            }
            return;
        }

        // 2. Якщо це Лікар або Адмін (не Пацієнт)
        if (user.role !== 'patient') {
            alert("Записуватися на прийом можуть тільки користувачі з роллю 'Пацієнт'.");
            return;
        }

        // 3. Якщо все ок - відкриваємо модалку
        setSelectedDoctor(doctor);
        setMessage({ type: '', text: '' });
        setOpen(true);
    };

    // Відправка запиту на бронювання
    const handleConfirmBooking = async () => {
        if (!selectedDate || !selectedTime) {
            setMessage({ type: 'error', text: 'Будь ласка, оберіть дату та час' });
            return;
        }

        try {
            // Формуємо дату у форматі ISO (YYYY-MM-DD HH:mm:ss)
            const fullDate = `${selectedDate} ${selectedTime}:00`;
            
            await axios.post('/appointments', {
                doctorId: selectedDoctor.id,
                date: fullDate
            });

            setMessage({ type: 'success', text: 'Успішно записано! Перевірте "Мій кабінет".' });
            
            // Закриваємо вікно через 2 секунди
            setTimeout(() => {
                setOpen(false);
                setSelectedDate('');
                setSelectedTime('');
                setMessage({ type: '', text: '' });
            }, 2000);

        } catch (err) {
            // Відображаємо повідомлення від сервера (наприклад, "Час зайнято")
            setMessage({ type: 'error', text: err.response?.data?.message || 'Помилка запису' });
        }
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom component="h1">
                    Наші Спеціалісти
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Оберіть лікаря та зручний час для візиту онлайн
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {doctors.map((doc) => (
                    <Grid item xs={12} sm={6} md={4} key={doc.id}>
                        <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="overline" color="primary" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    {doc.specialization}
                                </Typography>
                                <Typography variant="h5" component="div" gutterBottom>
                                    {doc.full_name}
                                </Typography>
                                <Typography sx={{ mb: 1.5, fontWeight: 'medium' }} color="text.primary">
                                    Кабінет: {doc.cabinet_number}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {doc.bio || "Інформація про лікаря відсутня."}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ p: 2, pt: 0 }}>
                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    size="large"
                                    onClick={() => handleBookClick(doc)}
                                >
                                    Записатися на прийом
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Модальне вікно запису */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ textAlign: 'center' }}>
                    Запис до лікаря
                    <Typography variant="subtitle2" color="primary">
                        {selectedDoctor?.full_name}
                    </Typography>
                </DialogTitle>
                
                <DialogContent>
                    {message.text && (
                        <Alert severity={message.type} sx={{ mb: 2 }}>
                            {message.text}
                        </Alert>
                    )}
                    
                    <Box sx={{ mt: 1 }}>
                        <TextField
                            label="Дата візиту"
                            type="date"
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Час візиту"
                            type="time"
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 1800 }} // Крок 30 хвилин
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            helperText="Прийом триває 30 хвилин"
                        />
                    </Box>
                </DialogContent>
                
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpen(false)} color="inherit">Скасувати</Button>
                    <Button onClick={handleConfirmBooking} variant="contained" disabled={!selectedDate || !selectedTime}>
                        Підтвердити запис
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DoctorsPage;