import React, { useContext } from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h3" gutterBottom>
                Система Поліклініки
            </Typography>
            
            {user ? (
                <Box>
                    <Typography variant="h5" color="success.main">
                        Ви увійшли як: {user.role}
                    </Typography>
                    <Button variant="outlined" color="error" onClick={logout} sx={{ mt: 2 }}>
                        Вийти
                    </Button>
                </Box>
            ) : (
                <Box>
                    <Typography variant="body1">
                        Будь ласка, авторизуйтесь для доступу.
                    </Typography>
                    <Button component={Link} to="/login" variant="contained" sx={{ mt: 2 }}>
                        Увійти
                    </Button>
                    <Typography variant="body1">
                        Або зареєструйтесь.
                    </Typography>
                    <Button component={Link} to="/register" variant="contained" sx={{ mt: 2 }}>
                        Зареєструватись
                    </Button>
                </Box>
            )}
        </Container>
    );
};

export default HomePage;