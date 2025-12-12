import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const NavBar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static" sx={{ mb: 4 }}>
            <Toolbar>
                {/* Логотип / Назва (клікабельна) */}
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                        🏥 Поліклініка
                    </Link>
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* Кнопки доступні ВСІМ */}
                    <Button color="inherit" component={Link} to="/">
                        Головна
                    </Button>

                    {/* Якщо користувач НЕ увійшов (Гість) */}
                    {!user && (
                        <>
                            <Button color="inherit" component={Link} to="/doctors">
                                Лікарі
                            </Button>
                            <Button color="inherit" component={Link} to="/login">
                                Вхід
                            </Button>
                            <Button variant="outlined" color="inherit" component={Link} to="/register">
                                Реєстрація
                            </Button>
                        </>
                    )}

                    {/* Меню для ПАЦІЄНТА */}
                    {user && user.role === 'patient' && (
                        <>
                            <Button color="inherit" component={Link} to="/doctors">
                                Записатися
                            </Button>
                            <Button color="inherit" component={Link} to="/profile">
                                Мій кабінет
                            </Button>
                        </>
                    )}

                    {/* Меню для ЛІКАРЯ */}
                    {user && user.role === 'doctor' && (
                        <>
                            <Button color="inherit" component={Link} to="/doctor-cabinet">
                                Робочий стіл
                            </Button>
                        </>
                    )}

                    {/* Меню для АДМІНІСТРАТОРА */}
                    {user && user.role === 'admin' && (
                        <>
                            <Button color="inherit" component={Link} to="/admin">
                                Адмін-панель
                            </Button>
                        </>
                    )}

                    {/* Кнопка ВИХІД (для всіх залогінених) */}
                    {user && (
                        <Button 
                            color="inherit" 
                            onClick={handleLogout} 
                            sx={{ ml: 2, border: '1px solid rgba(255,255,255,0.3)' }}
                        >
                            Вийти ({user.role})
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;