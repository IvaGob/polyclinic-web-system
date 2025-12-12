import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const RequireAuth = ({ allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return <p>Завантаження...</p>; // Можна замінити на спінер Material UI
    }

    // 1. Якщо користувач є і його роль дозволена -> Показуємо сторінку
    if (user && allowedRoles.includes(user.role)) {
        return <Outlet />;
    }

    // 2. Якщо користувач є, але роль не та -> Кидаємо на головну (або можна створити сторінку 403 Access Denied)
    if (user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // 3. Якщо користувача немає -> Кидаємо на логін
    return <Navigate to="/login" state={{ from: location }} replace />;
};

export default RequireAuth;