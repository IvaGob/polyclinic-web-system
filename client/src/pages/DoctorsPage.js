import React, { useEffect, useState, useContext } from 'react';
import { 
    Container, Card, CardContent, Typography, CardActions, Button, 
    Dialog, DialogTitle, DialogContent, DialogActions, Alert, Box, TextField, Avatar, Grid 
} from '@mui/material';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';

const DoctorsPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    
    // Стан для дати і слотів
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState(null);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/doctors').then(res => setDoctors(res.data)).catch(err => console.error(err));
    }, []);

    const getTomorrowDate = () => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const handleBookClick = (doctor) => {
        if (!user) {
            if (window.confirm("Увійдіть, щоб записатися.")) navigate('/login');
            return;
        }
        if (user.role !== 'patient') {
            // Ця перевірка тепер дублюється, але хай залишається для надійності
            alert("Тільки пацієнти можуть записуватися.");
            return;
        }
        setSelectedDoctor(doctor);
        setSelectedDate(getTomorrowDate());
        setSelectedTime(null);
        setOpen(true);
    };

    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            const fetchBooked = async () => {
                try {
                    const res = await axios.get(`/appointments/booked?doctorId=${selectedDoctor.id}&date=${selectedDate}`);
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
            setSelectedTime(null);
        }
    }, [selectedDate, selectedDoctor]);

    const generateTimeSlots = () => {
        const slots = [];
        let start = 9 * 60; 
        const end = 17 * 60; 

        while (start < end) {
            const hours = Math.floor(start / 60).toString().padStart(2, '0');
            const minutes = (start % 60).toString().padStart(2, '0');
            const timeString = `${hours}:${minutes}`;
            slots.push(timeString);
            start += 30;
        }
        return slots;
    };

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
                <Typography variant="h4" gutterBottom component="h1" fontWeight="bold" color="primary.dark">
                    Наші Спеціалісти
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Оберіть лікаря та зручний час для візиту онлайн
                </Typography>
            </Box>

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 3
            }}>
                {doctors.map((doc) => (
                    <Card 
                        key={doc.id}
                        elevation={2} 
                        sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            borderRadius: 3,
                            transition: '0.3s',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                        }}
                    >
                        <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                            <Avatar 
                                sx={{ 
                                    bgcolor: 'primary.light', 
                                    width: 64, 
                                    height: 64, 
                                    margin: '0 auto 16px auto' 
                                }}
                            >
                                <MedicalServicesOutlinedIcon fontSize="large" sx={{ color: 'white' }} />
                            </Avatar>

                            <Typography 
                                variant="subtitle1" 
                                color="primary.main" 
                                sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}
                            >
                                {doc.specialization}
                            </Typography>

                            <Typography variant="h5" component="div" gutterBottom fontWeight="bold">
                                {doc.full_name}
                            </Typography>
                            
                            <Box sx={{ 
                                bgcolor: 'background.default', 
                                py: 0.5, 
                                px: 2, 
                                borderRadius: 4, 
                                display: 'inline-block', 
                                mb: 2 
                             }}>
                                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                    Кабінет: {doc.cabinet_number}
                                </Typography>
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                {doc.bio || "Інформація про досвід лікаря уточнюється."}
                            </Typography>
                        </CardContent>
                        
                        <CardActions sx={{ p: 2, pt: 0 }}>
                            {/* Логіка відображення кнопки: */}
                            {(!user || user.role === 'patient') ? (
                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    size="large"
                                    onClick={() => handleBookClick(doc)}
                                    sx={{ borderRadius: 2, py: 1.2 }}
                                >
                                    Записатися на прийом
                                </Button>
                            ) : (
                                <Button 
                                    fullWidth 
                                    variant="outlined" 
                                    disabled
                                    sx={{ borderRadius: 2, py: 1.2 }}
                                >
                                    Запис тільки для пацієнтів
                                </Button>
                            )}
                        </CardActions>
                    </Card>
                ))}
            </Box>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                    Запис до лікаря
                    <Typography variant="h6" color="primary.dark" fontWeight="bold">
                        {selectedDoctor?.full_name}
                    </Typography>
                </DialogTitle>
                
                <DialogContent>
                    {message.text && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Оберіть дату візиту"
                            type="date"
                            fullWidth
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            inputProps={{ min: getTomorrowDate() }} 
                            sx={{ mb: 3 }}
                        />

                        {selectedDate && (
                            <>
                                <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                                    Доступні години на {new Date(selectedDate).toLocaleDateString('uk-UA')}:
                                </Typography>
                                
                                <Grid container spacing={2}>
                                    {timeSlots.map((time) => {
                                        const isBooked = bookedSlots.includes(time);
                                        const isSelected = selectedTime === time;

                                        return (
                                            <Grid item xs={4} sm={3} key={time}>
                                                <Button
                                                    variant={isSelected ? "contained" : "outlined"}
                                                    color={isSelected ? "primary" : (isBooked ? "inherit" : "success")}
                                                    onClick={() => !isBooked && setSelectedTime(time)}
                                                    disabled={isBooked}
                                                    fullWidth
                                                    sx={{ 
                                                        py: 1, 
                                                        borderRadius: 2,
                                                        fontWeight: 'bold',
                                                        opacity: isBooked ? 0.4 : 1,
                                                        textDecoration: isBooked ? 'line-through' : 'none',
                                                        borderColor: isBooked ? '#ccc' : undefined
                                                    }}
                                                >
                                                    {time}
                                                </Button>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
                    <Button onClick={() => setOpen(false)} color="inherit" size="large">Скасувати</Button>
                    <Button 
                        onClick={handleConfirmBooking} 
                        variant="contained" 
                        size="large"
                        disabled={!selectedTime}
                        sx={{ px: 4 }}
                    >
                        Підтвердити
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DoctorsPage;