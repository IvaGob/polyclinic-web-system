import React, { useContext, useState } from 'react';
import { 
    AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, useMediaQuery, useTheme 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const NavBar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // Для мобільного меню
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // true, якщо екран менше 900px

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/login');
    };

    // Компонент посилання для мобільного меню (щоб не дублювати код)
    const MobileLink = ({ to, children }) => (
        <MenuItem onClick={handleClose} component={Link} to={to}>
            {children}
        </MenuItem>
    );

    return (
        <AppBar position="static" sx={{ mb: 4 }}>
            <Toolbar>
                {/* Логотип */}
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        🏥 <span style={{ marginLeft: '8px' }}>Поліклініка</span>
                    </Link>
                </Typography>

                {/* --- ДЕСКТОПНА ВЕРСІЯ (Кнопки в ряд) --- */}
                {!isMobile ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button color="inherit" component={Link} to="/">Головна</Button>

                        {!user && (
                            <>
                                <Button color="inherit" component={Link} to="/doctors">Лікарі</Button>
                                <Button color="inherit" component={Link} to="/login">Вхід</Button>
                                <Button variant="outlined" color="inherit" component={Link} to="/register" sx={{ ml: 1 }}>Реєстрація</Button>
                            </>
                        )}

                        {user && user.role === 'patient' && (
                            <>
                                <Button color="inherit" component={Link} to="/doctors">Записатися</Button>
                                <Button color="inherit" component={Link} to="/profile">Мій кабінет</Button>
                            </>
                        )}

                        {user && user.role === 'doctor' && (
                            <Button color="inherit" component={Link} to="/doctor-cabinet">Робочий стіл</Button>
                        )}

                        {user && user.role === 'admin' && (
                            <Button color="inherit" component={Link} to="/admin">Адмін-панель</Button>
                        )}

                        {user && (
                            <Button 
                                color="inherit" 
                                onClick={handleLogout} 
                                sx={{ ml: 2, border: '1px solid rgba(255,255,255,0.3)' }}
                            >
                                Вийти
                            </Button>
                        )}
                    </Box>
                ) : (
                    /* --- МОБІЛЬНА ВЕРСІЯ (Гамбургер) --- */
                    <>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            onClick={handleMenu}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MobileLink to="/">Головна</MobileLink>

                            {!user && [
                                <MobileLink key="docs" to="/doctors">Лікарі</MobileLink>,
                                <MobileLink key="login" to="/login">Вхід</MobileLink>,
                                <MobileLink key="reg" to="/register">Реєстрація</MobileLink>
                            ]}

                            {user && user.role === 'patient' && [
                                <MobileLink key="book" to="/doctors">Записатися</MobileLink>,
                                <MobileLink key="cab" to="/profile">Мій кабінет</MobileLink>
                            ]}

                            {user && user.role === 'doctor' && (
                                <MobileLink to="/doctor-cabinet">Робочий стіл</MobileLink>
                            )}

                            {user && user.role === 'admin' && (
                                <MobileLink to="/admin">Адмін-панель</MobileLink>
                            )}

                            {user && (
                                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                    Вийти
                                </MenuItem>
                            )}
                        </Menu>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;