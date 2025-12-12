import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, TextField, Button, Box, Paper, MenuItem, Grid, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip,
    List, ListItem, ListItemText, ListItemSecondaryAction, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import axios from '../api/axios';

const AdminPanel = () => {
    const [specializations, setSpecializations] = useState([]);
    const [doctorsList, setDoctorsList] = useState([]); // Список лікарів
    const [editMode, setEditMode] = useState(false); // Чи ми редагуємо лікаря?
    const [editDoctorId, setEditDoctorId] = useState(null); // ID лікаря, якого редагуємо

    // Стан для форми лікаря
    const [formData, setFormData] = useState({
        email: '', password: '', fullName: '', phone: '',
        specializationId: '', bio: '', cabinetNumber: ''
    });
    
    // Стан для нової спеціалізації
    const [newSpecName, setNewSpecName] = useState('');

    const [message, setMessage] = useState({ type: '', text: '' });

    // Завантаження даних при старті
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const specs = await axios.get('/specializations');
            setSpecializations(specs.data);
            const docs = await axios.get('/admin/doctors'); 
            setDoctorsList(docs.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- ЛОГІКА ЛІКАРІВ ---

    const handleEdit = (doctor) => {
        setEditMode(true);
        setEditDoctorId(doctor.id);
        setFormData({
            email: doctor.email,
            password: '', 
            fullName: doctor.full_name,
            phone: doctor.phone || '',
            specializationId: doctor.specialization_id,
            bio: doctor.bio || '',
            cabinetNumber: doctor.cabinet_number
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditDoctorId(null);
        setFormData({
            email: '', password: '', fullName: '', phone: '',
            specializationId: '', bio: '', cabinetNumber: ''
        });
        setMessage({ type: '', text: '' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Ви впевнені? Це видалить лікаря та всі його записи!")) return;
        try {
            await axios.delete(`/admin/doctors/${id}`);
            fetchData(); 
            setMessage({ type: 'success', text: 'Лікаря видалено' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Помилка видалення' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await axios.put(`/admin/doctors/${editDoctorId}`, formData);
                setMessage({ type: 'success', text: 'Дані лікаря оновлено!' });
                setEditMode(false); 
            } else {
                await axios.post('/admin/doctors', formData);
                setMessage({ type: 'success', text: 'Лікаря успішно створено!' });
            }
            
            setFormData({
                email: '', password: '', fullName: '', phone: '',
                specializationId: '', bio: '', cabinetNumber: ''
            });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Помилка' });
        }
    };

    // --- ЛОГІКА СПЕЦІАЛІЗАЦІЙ ---

    const handleAddSpec = async () => {
        if (!newSpecName.trim()) return;
        try {
            await axios.post('/admin/specializations', { name: newSpecName });
            setNewSpecName('');
            fetchData(); // Оновити список
            setMessage({ type: 'success', text: 'Спеціалізацію додано' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Помилка додавання спеціалізації' });
        }
    };

    const handleDeleteSpec = async (id) => {
        if (!window.confirm("Видалити цю спеціалізацію?")) return;
        try {
            await axios.delete(`/admin/specializations/${id}`);
            fetchData();
            setMessage({ type: 'success', text: 'Спеціалізацію видалено' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Помилка видалення (можливо, є лікарі з цією спеціалізацією)' });
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Панель Адміністратора</Typography>
            
            {message.text && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

            <Grid container spacing={4}>
                {/* ЛІВА КОЛОНКА: УПРАВЛІННЯ ЛІКАРЯМИ */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                        <Typography variant="h6" gutterBottom color={editMode ? "primary" : "textPrimary"}>
                            {editMode ? `Редагування лікаря` : 'Додати нового лікаря'}
                        </Typography>
                        
                        <Box component="form" onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField 
                                        fullWidth required label="Email (Логін)" name="email" 
                                        value={formData.email} onChange={handleChange} 
                                        disabled={editMode} 
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField 
                                        fullWidth 
                                        required={!editMode} 
                                        label={editMode ? "Новий пароль (необов'язково)" : "Пароль"} 
                                        name="password" type="password" 
                                        value={formData.password} onChange={handleChange} 
                                    />
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
                                    <TextField fullWidth label="Біографія" name="bio" multiline rows={2} value={formData.bio} onChange={handleChange} />
                                </Grid>
                            </Grid>
                            
                            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                                <Button type="submit" variant="contained" size="large">
                                    {editMode ? 'Зберегти зміни' : 'Створити лікаря'}
                                </Button>
                                {editMode && (
                                    <Button variant="outlined" color="error" onClick={handleCancelEdit}>
                                        Скасувати
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* ПРАВА КОЛОНКА: УПРАВЛІННЯ СПЕЦІАЛІЗАЦІЯМИ */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Спеціалізації</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField 
                                label="Нова спеціалізація" 
                                size="small" 
                                fullWidth 
                                value={newSpecName}
                                onChange={(e) => setNewSpecName(e.target.value)}
                            />
                            <IconButton color="primary" onClick={handleAddSpec} disabled={!newSpecName.trim()}>
                                <AddCircleOutlineIcon fontSize="large"/>
                            </IconButton>
                        </Box>
                        <Divider />
                        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                            {specializations.map((spec) => (
                                <ListItem key={spec.id} divider>
                                    <ListItemText primary={spec.name} />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" aria-label="delete" color="error" onClick={() => handleDeleteSpec(spec.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            {/* СПИСОК ЛІКАРІВ (ЗНИЗУ) */}
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Список лікарів</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>ПІБ</TableCell>
                            <TableCell>Спеціалізація</TableCell>
                            <TableCell>Кабінет</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell align="right">Дії</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {doctorsList.map((doc) => (
                            <TableRow key={doc.id}>
                                <TableCell>
                                    <Typography fontWeight="bold">{doc.full_name}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip label={doc.specialization} size="small" color="primary" variant="outlined" />
                                </TableCell>
                                <TableCell>{doc.cabinet_number}</TableCell>
                                <TableCell>{doc.email}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleEdit(doc)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(doc.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {doctorsList.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">Лікарів ще не додано</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default AdminPanel;