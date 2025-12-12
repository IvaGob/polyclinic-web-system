import React, { useEffect, useState, useContext } from 'react';
import { 
    Container, Grid, Card, CardContent, Typography, CardActions, Button, 
    Dialog, DialogTitle, DialogContent, DialogActions, Alert, Box, TextField, Chip 
} from '@mui/material';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const DoctorsPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    
    // Стан для дати і слотів
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState(null); // Який слот обрав юзер
    const [bookedSlots, setBookedSlots] = useState([]); // Список зайнятих годин з сервера
    const [message, setMessage] = useState({ type: '', text: '' });

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // 1. Завантаження лікарів
    useEffect(() => {
        axios.get('/doctors').then(res => setDoctors(res.data)).catch(err => console.error(err));
    }, []);

    // 2. Обчислення мінімальної дати (завтра)
    const getTomorrowDate = () => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
    };

    // 3. Відкриття модалки
    const handleBookClick = (doctor) => {
        if (!user) {
            if (window.confirm("Увійдіть, щоб записатися.")) navigate('/login');
            return;
        }
        if (user.role !== 'patient') {
            alert("Тільки пацієнти можуть записуватися.");
            return;
        }
        setSelectedDoctor(doctor);
        setSelectedDate(getTomorrowDate()); // За замовчуванням - завтра
        setSelectedTime(null);
        setOpen(true);
    };

    // 4. Завантаження зайнятих слотів при зміні дати
    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            const fetchBooked = async () => {
                try {
                    const res = await axios.get(`/appointments/booked?doctorId=${selectedDoctor.id}&date=${selectedDate}`);
                    // Перетворюємо дати з БД (ISO) в простий час "HH:mm"
                    const times = res.data.map(item => {
                        const date = new Date(item.appointment_date);
                        return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
                    });
                    setBookedSlots(times);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchBooked();
            setSelectedTime(null); // Скидаємо вибір часу при зміні дати
        }
    }, [selectedDate, selectedDoctor]);

    // 5. Генерація всіх можливих слотів (09:00 - 17:00, крок 30 хв)
    const generateTimeSlots = () => {
        const slots = [];
        let start = 9 * 60; // 09:00 у хвилинах
        const end = 17 * 60; // 17:00

        while (start < end) {
            const hours = Math.floor(start / 60).toString().padStart(2, '0');
            const minutes = (start % 60).toString().padStart(2, '0');
            const timeString = `${hours}:${minutes}`;
            slots.push(timeString);
            start += 30;
        }
        return slots;
    };

    // 6. Відправка запиту
    const handleConfirmBooking = async () => {
        if (!selectedDate || !selectedTime) return;
        try {
            const fullDate = `${selectedDate} ${selectedTime}:00`;
            await axios.post('/appointments', {
                doctorId: selectedDoctor.id,
                date: fullDate
            });
            setMessage({ type: 'success', text: 'Успішно записано!' });
            setTimeout(() => {
                setOpen(false);
                setMessage({ type: '', text: '' });
            }, 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Помилка' });
        }
    };

    const timeSlots = generateTimeSlots();

    return (
        <Container sx={{ mt: 4 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>Наші Спеціалісти</Typography>
                <Typography color="text.secondary">Оберіть лікаря для запису</Typography>
            </Box>

            <Grid container spacing={3}>
                {doctors.map((doc) => (
                    <Grid item xs={12} sm={6} md={4} key={doc.id}>
                        <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="overline" color="primary" fontWeight="bold">
                                    {doc.specialization}
                                </Typography>
                                <Typography variant="h5" gutterBottom>{doc.full_name}</Typography>
                                <Typography color="text.secondary">Кабінет: {doc.cabinet_number}</Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {doc.bio || "Інформація відсутня"}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ p: 2 }}>
                                <Button fullWidth variant="contained" onClick={() => handleBookClick(doc)}>
                                    Записатися
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* МОДАЛЬНЕ ВІКНО ЗАПИСУ */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Запис до лікаря: {selectedDoctor?.full_name}</DialogTitle>
                <DialogContent>
                    {message.text && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Оберіть дату"
                            type="date"
                            fullWidth
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            // Обмежуємо вибір: мінімум завтра
                            inputProps={{ min: getTomorrowDate() }} 
                            sx={{ mb: 3 }}
                        />

                        <Typography variant="subtitle2" gutterBottom>Доступні години:</Typography>
                        
                        <Grid container spacing={1}>
                            {timeSlots.map((time) => {
                                // Перевіряємо, чи цей час є в списку зайнятих
                                const isBooked = bookedSlots.includes(time);
                                const isSelected = selectedTime === time;

                                return (
                                    <Grid item xs={3} key={time}>
                                        <Chip
                                            label={time}
                                            clickable={!isBooked}
                                            color={isSelected ? "primary" : (isBooked ? "default" : "success")}
                                            variant={isSelected ? "filled" : "outlined"}
                                            onClick={() => !isBooked && setSelectedTime(time)}
                                            icon={isBooked ? undefined : <AccessTimeIcon />}
                                            sx={{ 
                                                width: '100%', 
                                                opacity: isBooked ? 0.5 : 1,
                                                textDecoration: isBooked ? 'line-through' : 'none'
                                            }}
                                        />
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Скасувати</Button>
                    <Button 
                        onClick={handleConfirmBooking} 
                        variant="contained" 
                        disabled={!selectedTime}
                    >
                        Підтвердити запис
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DoctorsPage;