import React, { useContext } from 'react';
import { Container, Typography, Button, Box, Paper, Card, CardContent } from '@mui/material'; // Grid більше не потрібен тут
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PeopleIcon from '@mui/icons-material/People';

const HomePage = () => {
    const { user } = useContext(AuthContext);

    return (
        <Box>
            {/* 1. HERO SECTION (Банер) */}
            <Box sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                py: 8, 
                textAlign: 'center',
                mb: 6
            }}>
                <Container maxWidth="md">
                    <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                        Сучасна міська поліклініка
                    </Typography>
                    <Typography variant="h5" paragraph sx={{ mb: 4, opacity: 0.9 }}>
                        Піклуємося про ваше здоров'я за допомогою сучасних технологій. 
                        Записуйтесь до лікаря онлайн без черг та дзвінків.
                    </Typography>
                    
                    {!user ? (
                        // Кнопки для Гостя
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button component={Link} to="/register" variant="contained" color="secondary" size="large">
                                Стати пацієнтом
                            </Button>
                            <Button component={Link} to="/doctors" variant="outlined" color="inherit" size="large">
                                Переглянути лікарів
                            </Button>
                        </Box>
                    ) : (
                        // Кнопки для Авторизованих користувачів залежно від ролі
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            {user.role === 'patient' && (
                                <Button component={Link} to="/doctors" variant="contained" color="secondary" size="large">
                                    Записатися на прийом
                                </Button>
                            )}
                            
                            {user.role === 'doctor' && (
                                <Button component={Link} to="/doctor-cabinet" variant="contained" color="secondary" size="large">
                                    Перейти до кабінету
                                </Button>
                            )}

                            {user.role === 'admin' && (
                                <Button component={Link} to="/admin" variant="contained" color="secondary" size="large">
                                    Адмін-панель
                                </Button>
                            )}
                        </Box>
                    )}
                </Container>
            </Box>

            {/* 2. SERVICES SECTION (Переваги) - Використовуємо CSS Grid */}
            <Container maxWidth="lg" sx={{ mb: 8 }}>
                <Typography variant="h4" align="center" gutterBottom color="primary" sx={{ mb: 4 }}>
                    Чому обирають нас?
                </Typography>
                
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                    gap: 4
                }}>
                    <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                        <MedicalServicesIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>Кваліфіковані лікарі</Typography>
                        <Typography color="text.secondary">
                            Наші спеціалісти мають багаторічний досвід та постійно підвищують кваліфікацію.
                        </Typography>
                    </Paper>

                    <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                        <EventAvailableIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>Онлайн запис 24/7</Typography>
                        <Typography color="text.secondary">
                            Забудьте про черги в реєстратурі. Обирайте зручний час та записуйтесь у кілька кліків.
                        </Typography>
                    </Paper>

                    <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                        <PeopleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>Електронна медкарта</Typography>
                        <Typography color="text.secondary">
                            Вся ваша історія хвороби, аналізи та призначення завжди під рукою у вашому кабінеті.
                        </Typography>
                    </Paper>
                </Box>
            </Container>

            {/* 3. INFO SECTION (Інформація + Мапа) - Тут теж використаємо CSS Grid для надійності */}
            <Container maxWidth="lg" sx={{ mb: 8 }}>
                <Card variant="outlined">
                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, // 2 колонки (50/50)
                            gap: 4,
                            alignItems: 'start' // Вирівнювання по верхньому краю
                        }}>
                            {/* Ліва колонка: Текст і Графік роботи */}
                            <Box>
                                <Typography variant="h5" gutterBottom color="primary">
                                    Про нашу лікарню
                                </Typography>
                                <Typography paragraph>
                                    Комунальне некомерційне підприємство "Міська поліклініка №1" надає повний спектр 
                                    амбулаторно-поліклінічної допомоги населенню. Ми оснащені сучасним діагностичним 
                                    обладнанням та лабораторією.
                                </Typography>
                                
                                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Графік роботи:
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, maxWidth: 300 }}>
                                        <Typography variant="body1">Пн-Пт:</Typography>
                                        <Typography variant="body1" fontWeight="medium">08:00 - 20:00</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, maxWidth: 300 }}>
                                        <Typography variant="body1">Сб:</Typography>
                                        <Typography variant="body1" fontWeight="medium">09:00 - 15:00</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: 300 }}>
                                        <Typography variant="body1">Нд:</Typography>
                                        <Typography variant="body1" color="error" fontWeight="bold">Вихідний</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Права колонка: Google Мапа і Адреса */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <Box sx={{ 
                                    width: '100%', 
                                    height: '300px', 
                                    borderRadius: 2, 
                                    overflow: 'hidden', 
                                    boxShadow: 2,
                                    mb: 2 
                                }}>
                                    <iframe 
                                        title="Hospital Location"
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2540.535691340003!2d30.5234!3d50.4501!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4ce56a736025b%3A0x8a97c622d0434770!2z0LzQsNC50LTQsNC9IE5lemFsZXpobm9zdGksIEt5aXYsIDAyMDAw!5e0!3m2!1sen!2sua!4v1638181234567!5m2!1sen!2sua"
                                        width="100%" 
                                        height="100%" 
                                        style={{ border: 0 }} 
                                        allowFullScreen={true}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade">
                                    </iframe>
                                </Box>
                                
                                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Адреса:
                                    </Typography>
                                    <Typography variant="body1">
                                        м. Київ, вул. Прикладна, 12
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default HomePage;