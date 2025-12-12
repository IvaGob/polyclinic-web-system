import axios from 'axios';

// Створюємо екземпляр з базовим URL
// Завдяки proxy в package.json, ми можемо писати просто /api
export default axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});