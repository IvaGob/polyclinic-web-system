import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#009688', // Медичний бірюзовий (Teal)
            light: '#52c7b8',
            dark: '#00675b',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#ff7043', // М'який помаранчевий для акцентів (кнопки "Записатися")
            light: '#ffa270',
            dark: '#c63f17',
            contrastText: '#000000',
        },
        background: {
            default: '#f4f6f8', // Світло-сірий фон (не чисто білий, щоб очам було легше)
            paper: '#ffffff',
        },
        text: {
            primary: '#2c3e50', // Темно-синій замість чорного (м'якше виглядає)
            secondary: '#546e7a',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 600 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600, color: '#00675b' }, // Заголовки будуть темнішими за основний колір
        h5: { fontWeight: 500 },
        h6: { fontWeight: 500 },
        button: {
            textTransform: 'none', // Прибираємо КАПСЛОК на кнопках (виглядає сучасніше)
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12, // Більш округлі кнопки та картки (сучасний тренд)
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)', // Легка тінь
                    border: '1px solid #e0e0e0',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                elevation3: {
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
                },
            },
        },
    },
});

export default theme;