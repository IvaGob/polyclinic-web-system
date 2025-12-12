import React, { useEffect, useState } from 'react';
import { 
    Container, Typography, Paper, Tabs, Tab, Box, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
    Accordion, AccordionSummary, AccordionDetails, Divider, Grid,
    Button, TextField, Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from '../api/axios';

// Компонент для панелей вкладок
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const PatientProfile = () => {
    const [tabValue, setTabValue] = useState(0);
    const [appointments, setAppointments] = useState([]);
    const [history, setHistory] = useState([]);
    
    // Стан для редагування профілю
    const [profileData, setProfileData] = useState({
        fullName: '', phone: '', email: '', address: ''
    });
    const [msg, setMsg] = useState({ type: '', text: '' });

    // Завантаження даних при старті
    useEffect(() => {
        fetchData();
        fetchProfile();
    }, []);

    const fetchData = async () => {
        try {
            const appRes = await axios.get('/appointments/my');
            setAppointments(appRes.data);
            const histRes = await axios.get('/medical-records/my');
            setHistory(histRes.data);
        } catch (err) {
            console.error("Помилка завантаження даних", err);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await axios.get('/users/profile');
            // Сервер може повернути null для address, тому ставимо ''
            setProfileData({
                fullName: res.data.full_name || '',
                phone: res.data.phone || '',
                email: res.data.email || '',
                address: res.data.address || ''
            });
        } catch (err) {
            console.error("Помилка завантаження профілю", err);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setMsg({ type: '', text: '' }); // Очистити повідомлення при зміні вкладки
    };

    // --- Логіка СКАСУВАННЯ запису ---
    const handleCancel = async (id) => {
        if (!window.confirm("Ви впевнені, що хочете скасувати цей запис?")) return;
        try {
            await axios.put(`/appointments/${id}/cancel`);
            fetchData(); // Оновити таблицю
            alert("Запис успішно скасовано");
        } catch (err) {
            alert("Помилка скасування запису");
        }
    };

    // --- Логіка ОНОВЛЕННЯ профілю ---
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await axios.put('/users/profile', profileData);
            setMsg({ type: 'success', text: 'Дані успішно оновлено!' });
        } catch (err) {
            setMsg({ type: 'error', text: 'Помилка оновлення даних' });
        }
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Мій кабінет</Typography>
            
            <Paper elevation={3}>
                <Tabs value={tabValue} onChange={handleTabChange} centered>
                    <Tab label="Мої записи" />
                    <Tab label="Історія хвороби (Медкарта)" />
                    <Tab label="Налаштування профілю" />
                </Tabs>

                {/* Вкладка 1: Майбутні записи */}
                <TabPanel value={tabValue} index={0}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Дата та час</TableCell>
                                    <TableCell>Лікар</TableCell>
                                    <TableCell>Спеціалізація</TableCell>
                                    <TableCell>Статус</TableCell>
                                    <TableCell>Дії</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {appointments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">Записів немає</TableCell>
                                    </TableRow>
                                ) : (
                                    appointments.map((app) => (
                                        <TableRow key={app.id}>
                                            <TableCell>
                                                {new Date(app.appointment_date).toLocaleString('uk-UA')}
                                            </TableCell>
                                            <TableCell>{app.doctor_name}</TableCell>
                                            <TableCell>{app.specialization}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={app.status === 'scheduled' ? 'Заплановано' : (app.status === 'cancelled' ? 'Скасовано' : 'Завершено')} 
                                                    color={app.status === 'scheduled' ? 'primary' : (app.status === 'cancelled' ? 'error' : 'default')} 
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {app.status === 'scheduled' && (
                                                    <Button 
                                                        size="small" 
                                                        color="error" 
                                                        variant="outlined"
                                                        onClick={() => handleCancel(app.id)}
                                                    >
                                                        Скасувати
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Вкладка 2: Історія хвороби */}
                <TabPanel value={tabValue} index={1}>
                    {history.length === 0 ? (
                        <Typography align="center">Історія хвороби порожня</Typography>
                    ) : (
                        history.map((record) => (
                            <Accordion key={record.id} sx={{ mb: 1 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Grid container>
                                        <Grid item xs={12} sm={4}>
                                            <Typography sx={{ fontWeight: 'bold' }}>
                                                {new Date(record.visit_date).toLocaleDateString('uk-UA')}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Typography>{record.doctor_name} ({record.specialization})</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Typography color="error">Діагноз: {record.diagnosis_code}</Typography>
                                        </Grid>
                                    </Grid>
                                </AccordionSummary>
                                <AccordionDetails sx={{ backgroundColor: '#f9f9f9' }}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Скарги та симптоми:</Typography>
                                        <Typography variant="body1">{record.clinical_data.symptoms}</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Призначення та лікування:</Typography>
                                        <Typography variant="body1">{record.clinical_data.treatment}</Typography>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    )}
                </TabPanel>

                {/* Вкладка 3: Налаштування */}
                <TabPanel value={tabValue} index={2}>
                    <Container maxWidth="sm">
                        <Typography variant="h6" gutterBottom>Редагування особистих даних</Typography>
                        
                        {msg.text && <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert>}
                        
                        <Box component="form" onSubmit={handleUpdateProfile}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="ПІБ"
                                value={profileData.fullName}
                                onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Телефон"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Адреса"
                                multiline
                                rows={2}
                                value={profileData.address}
                                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Email"
                                value={profileData.email}
                                disabled
                                helperText="Email не можна змінити (зверніться до адміністратора)"
                            />
                            <Button type="submit" variant="contained" sx={{ mt: 2 }} size="large">
                                Зберегти зміни
                            </Button>
                        </Box>
                    </Container>
                </TabPanel>
            </Paper>
        </Container>
    );
};

export default PatientProfile;