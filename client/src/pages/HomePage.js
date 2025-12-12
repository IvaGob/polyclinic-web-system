import React, { useContext } from 'react';
import { Container, Typography, Button, Box, Grid, Paper, Card, CardContent } from '@mui/material';
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
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button component={Link} to="/register" variant="contained" color="secondary" size="large">
                                Стати пацієнтом
                            </Button>
                            <Button component={Link} to="/doctors" variant="outlined" color="inherit" size="large">
                                Переглянути лікарів
                            </Button>
                        </Box>
                    ) : (
                        <Button component={Link} to="/doctors" variant="contained" color="secondary" size="large">
                            Записатися на прийом
                        </Button>
                    )}
                </Container>
            </Box>

            {/* 2. SERVICES SECTION (Переваги) */}
            <Container maxWidth="lg" sx={{ mb: 8 }}>
                <Typography variant="h4" align="center" gutterBottom color="primary" sx={{ mb: 4 }}>
                    Чому обирають нас?
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                            <MedicalServicesIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>Кваліфіковані лікарі</Typography>
                            <Typography color="text.secondary">
                                Наші спеціалісти мають багаторічний досвід та постійно підвищують кваліфікацію.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                            <EventAvailableIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>Онлайн запис 24/7</Typography>
                            <Typography color="text.secondary">
                                Забудьте про черги в реєстратурі. Обирайте зручний час та записуйтесь у кілька кліків.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                            <PeopleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>Електронна медкарта</Typography>
                            <Typography color="text.secondary">
                                Вся ваша історія хвороби, аналізи та призначення завжди під рукою у вашому кабінеті.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* 3. INFO SECTION (Про лікарню) */}
            <Container maxWidth="md" sx={{ mb: 8 }}>
                <Card variant="outlined">
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" gutterBottom color="primary">
                            Про нашу лікарню
                        </Typography>
                        <Typography paragraph>
                            Комунальне некомерційне підприємство "Міська поліклініка №1" надає повний спектр 
                            амбулаторно-поліклінічної допомоги населенню. Ми оснащені сучасним діагностичним 
                            обладнанням та лабораторією.
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                            Графік роботи:
                        </Typography>
                        <Typography variant="body2">Пн-Пт: 08:00 - 20:00</Typography>
                        <Typography variant="body2">Сб: 09:00 - 15:00</Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>Нд: Вихідний</Typography>
                        
                        <Typography variant="body2" color="text.secondary">
                            Адреса: м. Київ, вул. Прикладна, 12
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default HomePage;