import React from 'react';
import { Box, Container, Typography, Grid, Link } from '@mui/material';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto', // Цей стиль притискає футер до низу
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                        ? theme.palette.grey[200]
                        : theme.palette.grey[800],
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4} justifyContent="space-between">
                    <Grid item xs={12} sm={6}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Інформація про розробника
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Веб-система розроблена в рамках курсової роботи.
                            <br />
                            Студент: <strong>Дячко Іван</strong>
                            <br />
                            Група: ОІ-35
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Контакти
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Телефон: <Link href="tel:+380508538034" color="inherit">+38 (097) 000-00-00</Link>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Email: <Link href="mailto:dacko7462@gmail.com" color="inherit">dacko7462@gmail.com</Link>
                        </Typography>
                    </Grid>
                </Grid>
                
                <Box mt={3} textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                        {'Copyright © '}
                        <Link color="inherit" href="/">
                            Polyclinic System
                        </Link>{' '}
                        {new Date().getFullYear()}
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;