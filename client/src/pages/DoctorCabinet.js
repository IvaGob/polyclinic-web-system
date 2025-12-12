import React, { useEffect, useState } from 'react';
import { 
    Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Grid, 
    Accordion, AccordionSummary, AccordionDetails, Divider, Box 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from '../api/axios';

const DoctorCabinet = () => {
    const [appointments, setAppointments] = useState([]);
    const [openVisit, setOpenVisit] = useState(false); // Модалка прийому
    const [openHistory, setOpenHistory] = useState(false); // Модалка історії
    
    const [selectedApp, setSelectedApp] = useState(null);
    const [patientHistory, setPatientHistory] = useState([]);
    
    // Стан форми медичного запису
    const [formData, setFormData] = useState({
        diagnosis: '', symptoms: '', treatment: ''
    });

    const fetchSchedule = async () => {
        try {
            const res = await axios.get('/appointments/doctor');
            setAppointments(res.data);
        } catch (err) {
            console.error("Помилка завантаження розкладу", err);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    // --- Логіка Історії Хвороби ---
    const handleViewHistory = async (patientId, patientName) => {
        try {
            const res = await axios.get(`/medical-records/patient/${patientId}`);
            setPatientHistory(res.data);
            setSelectedApp({ ...selectedApp, patient_name: patientName }); // Зберігаємо ім'я для заголовка
            setOpenHistory(true);
        } catch (err) {
            alert("Не вдалося завантажити історію");
        }
    };

    // --- Логіка Прийому ---
    const handleOpenVisit = (app) => {
        setSelectedApp(app);
        setOpenVisit(true);
    };

    const handleCloseVisit = () => {
        setOpenVisit(false);
        setFormData({ diagnosis: '', symptoms: '', treatment: '' });
    };

    const handleSubmitVisit = async () => {
        try {
            await axios.post('/medical-records', {
                patientId: selectedApp.patient_id,
                appointmentId: selectedApp.id,
                ...formData
            });
            alert('Прийом завершено!');
            handleCloseVisit();
            fetchSchedule();
        } catch (err) {
            alert('Помилка збереження');
        }
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Кабінет Лікаря: Розклад</Typography>
            
            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Час</TableCell>
                            <TableCell>Пацієнт</TableCell>
                            <TableCell>Дата народження</TableCell>
                            <TableCell>Дії</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {appointments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">На сьогодні записів немає</TableCell>
                            </TableRow>
                        ) : (
                            appointments.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell>
                                        {new Date(app.appointment_date).toLocaleString('uk-UA', { 
                                            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
                                        })}
                                    </TableCell>
                                    <TableCell>{app.patient_name}</TableCell>
                                    <TableCell>
                                        {new Date(app.date_of_birth).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button 
                                                variant="outlined" 
                                                size="small"
                                                onClick={() => handleViewHistory(app.patient_id, app.patient_name)}
                                            >
                                                Історія
                                            </Button>
                                            <Button 
                                                variant="contained" 
                                                color="success"
                                                size="small"
                                                onClick={() => handleOpenVisit(app)}
                                            >
                                                Прийом
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Модальне вікно 1: ІСТОРІЯ ПАЦІЄНТА */}
            <Dialog open={openHistory} onClose={() => setOpenHistory(false)} maxWidth="md" fullWidth>
                <DialogTitle>Історія хвороби: {selectedApp?.patient_name}</DialogTitle>
                <DialogContent dividers>
                    {patientHistory.length === 0 ? (
                        <Typography align="center">Записів не знайдено</Typography>
                    ) : (
                        patientHistory.map((record) => (
                            <Accordion key={record.id} sx={{ mb: 1 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Grid container>
                                        <Grid item xs={4}>
                                            <b>{new Date(record.visit_date).toLocaleDateString('uk-UA')}</b>
                                        </Grid>
                                        <Grid item xs={4}>{record.doctor_name}</Grid>
                                        <Grid item xs={4} sx={{ color: 'error.main' }}>
                                            {record.diagnosis_code}
                                        </Grid>
                                    </Grid>
                                </AccordionSummary>
                                <AccordionDetails sx={{ bgcolor: '#fafafa' }}>
                                    <Typography variant="body2" color="textSecondary">Симптоми:</Typography>
                                    <Typography paragraph>{record.clinical_data.symptoms}</Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body2" color="textSecondary">Лікування:</Typography>
                                    <Typography>{record.clinical_data.treatment}</Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenHistory(false)}>Закрити</Button>
                </DialogActions>
            </Dialog>

            {/* Модальне вікно 2: ПРОВЕДЕННЯ ПРИЙОМУ */}
            <Dialog open={openVisit} onClose={handleCloseVisit} maxWidth="md" fullWidth>
                <DialogTitle>Заповнення карти: {selectedApp?.patient_name}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Діагноз"
                                fullWidth required
                                value={formData.diagnosis}
                                onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Скарги"
                                fullWidth multiline rows={3}
                                value={formData.symptoms}
                                onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Призначення"
                                fullWidth multiline rows={3}
                                value={formData.treatment}
                                onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseVisit}>Скасувати</Button>
                    <Button onClick={handleSubmitVisit} variant="contained">Зберегти</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DoctorCabinet;