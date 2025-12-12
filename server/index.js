const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE (Захист маршрутів) ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) return res.status(401).json({ message: "Немає токена" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Токен недійсний" });
        req.user = user; // Зберігаємо дані юзера в запиті
        next();
    });
};

// --- МАРШРУТИ ---

app.get('/', (req, res) => res.send('Polyclinic API Running'));

// 1. Отримати список спеціалізацій
app.get('/api/specializations', async (req, res) => {
    try {
        const allSpecs = await pool.query('SELECT * FROM specializations');
        res.json(allSpecs.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 2. Реєстрація
app.post('/api/auth/register', async (req, res) => {
    const client = await pool.connect();
    try {
        const { email, password, fullName, phone, role, ...details } = req.body;
        
        // Перевірка існування
        const userExist = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExist.rows.length > 0) {
            return res.status(401).json({ message: "Користувач вже існує" });
        }

        // Хешування
        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(password, salt);

        await client.query('BEGIN');
        const newUser = await client.query(
            'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [email, bcryptPassword, fullName, phone, role]
        );
        const userId = newUser.rows[0].id;

        if (role === 'patient') {
            await client.query(
                'INSERT INTO patients (user_id, date_of_birth, address, gender) VALUES ($1, $2, $3, $4)',
                [userId, details.dateOfBirth, details.address, details.gender]
            );
        } else if (role === 'doctor') {
            await client.query(
                'INSERT INTO doctors (user_id, specialization_id, bio, cabinet_number) VALUES ($1, $2, $3, $4)',
                [userId, details.specializationId, details.bio, details.cabinetNumber]
            );
        }

        await client.query('COMMIT');
        const token = jwt.sign({ user_id: userId, role: role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, role });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
});

// 3. Вхід
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (user.rows.length === 0) return res.status(401).json({ message: "Невірні дані" });

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) return res.status(401).json({ message: "Невірні дані" });

        const token = jwt.sign(
            { user_id: user.rows[0].id, role: user.rows[0].role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );
        res.json({ token, role: user.rows[0].role });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 4. Отримати список ЛІКАРІВ (для сторінки запису)
app.get('/api/doctors', async (req, res) => {
    try {
        // Об'єднуємо таблиці, щоб отримати ім'я лікаря (з users) та назву спеціалізації
        const query = `
            SELECT d.id, u.full_name, s.name as specialization, d.bio, d.cabinet_number 
            FROM doctors d 
            JOIN users u ON d.user_id = u.id 
            JOIN specializations s ON d.specialization_id = s.id
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 5. ЗАПИС НА ПРИЙОМ (з перевіркою часу)
app.post('/api/appointments', authenticateToken, async (req, res) => {
    try {
        const { doctorId, date } = req.body; // date format: 'YYYY-MM-DD HH:mm:ss'
        const userId = req.user.user_id;

        // Знаходимо ID пацієнта за ID юзера
        const patientData = await pool.query('SELECT id FROM patients WHERE user_id = $1', [userId]);
        if (patientData.rows.length === 0) {
            return res.status(403).json({ message: "Тільки пацієнти можуть записуватись" });
        }
        const patientId = patientData.rows[0].id;

        // ПЕРЕВІРКА: Чи вільний цей час у цього лікаря?
        const check = await pool.query(
            "SELECT * FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND status != 'cancelled'",
            [doctorId, date]
        );

        if (check.rows.length > 0) {
            return res.status(400).json({ message: "Цей час вже зайнято. Оберіть інший." });
        }

        // Створюємо запис
        const newApp = await pool.query(
            "INSERT INTO appointments (doctor_id, patient_id, appointment_date) VALUES ($1, $2, $3) RETURNING *",
            [doctorId, patientId, date]
        );

        res.json(newApp.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 6. МОЇ ЗАПИСИ (для кабінету пацієнта)
app.get('/api/appointments/my', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;
        // Отримуємо записи + імена лікарів
        const query = `
            SELECT a.id, a.appointment_date, a.status, u.full_name as doctor_name, s.name as specialization
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
            JOIN specializations s ON d.specialization_id = s.id
            WHERE p.user_id = $1
            ORDER BY a.appointment_date DESC
        `;
        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// 7. Отримати записи до поточного лікаря
app.get('/api/appointments/doctor', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'doctor') return res.status(403).json({ message: "Доступ заборонено" });

        // Знаходимо ID лікаря за ID користувача
        const docRes = await pool.query('SELECT id FROM doctors WHERE user_id = $1', [req.user.user_id]);
        if (docRes.rows.length === 0) return res.status(404).json({ message: "Профіль лікаря не знайдено" });
        const doctorId = docRes.rows[0].id;

        // Вибираємо записи (тільки заплановані)
        const query = `
            SELECT a.id, a.appointment_date, a.status, u.full_name as patient_name, p.id as patient_id, p.date_of_birth, p.gender
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN users u ON p.user_id = u.id
            WHERE a.doctor_id = $1 AND a.status = 'scheduled'
            ORDER BY a.appointment_date ASC
        `;
        const result = await pool.query(query, [doctorId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 8. Створити медичний запис (Провести прийом)
app.post('/api/medical-records', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'doctor') return res.status(403).json({ message: "Тільки лікарі можуть створювати записи" });

        const { patientId, appointmentId, diagnosis, symptoms, treatment } = req.body;
        
        const docRes = await pool.query('SELECT id FROM doctors WHERE user_id = $1', [req.user.user_id]);
        const doctorId = docRes.rows[0].id;

        // Формуємо JSON для поля clinical_data
        const clinicalData = {
            symptoms: symptoms,
            treatment: treatment,
            notes: "Створено в веб-системі"
        };

        await pool.query('BEGIN');

        // 1. Вставка запису в історію хвороби
        const newRecord = await pool.query(
            'INSERT INTO medical_records (patient_id, doctor_id, appointment_id, visit_date, diagnosis_code, clinical_data) VALUES ($1, $2, $3, CURRENT_DATE, $4, $5) RETURNING *',
            [patientId, doctorId, appointmentId, diagnosis, clinicalData]
        );

        // 2. Оновлення статусу запису на "completed"
        await pool.query("UPDATE appointments SET status = 'completed' WHERE id = $1", [appointmentId]);

        await pool.query('COMMIT');
        res.json(newRecord.rows[0]);
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// 9. Отримати мою історію хвороби (Медичні записи)
app.get('/api/medical-records/my', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;

        // 1. Знаходимо ID пацієнта
        const patientRes = await pool.query('SELECT id FROM patients WHERE user_id = $1', [userId]);
        if (patientRes.rows.length === 0) return res.status(404).json({ message: "Пацієнта не знайдено" });
        const patientId = patientRes.rows[0].id;

        // 2. Витягуємо записи разом з іменами лікарів
        // Зверніть увагу: ми дістаємо дані з JSONB поля clinical_data
        const query = `
            SELECT mr.id, mr.visit_date, mr.diagnosis_code, mr.clinical_data, u.full_name as doctor_name, s.name as specialization
            FROM medical_records mr
            JOIN doctors d ON mr.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
            JOIN specializations s ON d.specialization_id = s.id
            WHERE mr.patient_id = $1
            ORDER BY mr.visit_date DESC
        `;
        
        const result = await pool.query(query, [patientId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// 10. (АДМІН) Створення лікаря
app.post('/api/admin/doctors', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Доступ заборонено" });

        const { email, password, fullName, phone, specializationId, bio, cabinetNumber } = req.body;
        
        // Хешування
        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(password, salt);

        await client.query('BEGIN');
        const newUser = await client.query(
            'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [email, bcryptPassword, fullName, phone, 'doctor']
        );
        
        await client.query(
            'INSERT INTO doctors (user_id, specialization_id, bio, cabinet_number) VALUES ($1, $2, $3, $4)',
            [newUser.rows[0].id, specializationId, bio, cabinetNumber]
        );

        await client.query('COMMIT');
        res.json({ message: "Лікаря успішно створено" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send(err.message);
    } finally {
        client.release();
    }
});

// 11. (ПАЦІЄНТ) Скасувати запис
app.put('/api/appointments/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;

        // Перевіряємо, чи належить запис цьому пацієнту
        const check = await pool.query(
            'SELECT a.id FROM appointments a JOIN patients p ON a.patient_id = p.id WHERE a.id = $1 AND p.user_id = $2',
            [id, userId]
        );

        if (check.rows.length === 0) return res.status(403).json({ message: "Запис не знайдено або доступ заборонено" });

        await pool.query("UPDATE appointments SET status = 'cancelled' WHERE id = $1", [id]);
        res.json({ message: "Запис скасовано" });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// 12. (ПАЦІЄНТ) Отримати дані профілю
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;
        // Об'єднуємо таблиці users та patients
        const result = await pool.query(
            'SELECT u.full_name, u.phone, u.email, p.address FROM users u JOIN patients p ON u.id = p.user_id WHERE u.id = $1',
            [userId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// 13. (ПАЦІЄНТ) Оновити профіль
app.put('/api/users/profile', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.user_id;
        const { fullName, phone, address } = req.body;

        await client.query('BEGIN');
        await client.query('UPDATE users SET full_name = $1, phone = $2 WHERE id = $3', [fullName, phone, userId]);
        await client.query('UPDATE patients SET address = $1 WHERE user_id = $2', [address, userId]);
        await client.query('COMMIT');
        
        res.json({ message: "Профіль оновлено" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
});
// 14. (ЛІКАР) Отримати історію хвороби конкретного пацієнта
app.get('/api/medical-records/patient/:patientId', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'doctor') return res.status(403).json({ message: "Доступ заборонено" });

        const { patientId } = req.params;

        // Витягуємо записи історії
        const query = `
            SELECT mr.id, mr.visit_date, mr.diagnosis_code, mr.clinical_data, u.full_name as doctor_name, s.name as specialization
            FROM medical_records mr
            JOIN doctors d ON mr.doctor_id = d.id
            JOIN users u ON d.user_id = u.id
            JOIN specializations s ON d.specialization_id = s.id
            WHERE mr.patient_id = $1
            ORDER BY mr.visit_date DESC
        `;
        
        const result = await pool.query(query, [patientId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
// 15. Отримати список ЗАЙНЯТИХ слотів для лікаря на конкретну дату
app.get('/api/appointments/booked', async (req, res) => {
    try {
        const { doctorId, date } = req.query; // Очікуємо ?doctorId=1&date=2023-12-12

        // Вибираємо тільки час записів, які не скасовані
        const query = `
            SELECT appointment_date 
            FROM appointments 
            WHERE doctor_id = $1 
            AND DATE(appointment_date) = $2 
            AND status != 'cancelled'
        `;
        
        const result = await pool.query(query, [doctorId, date]);
        
        // Повертаємо масив дат
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// 16. Отримати повний список лікарів (для адміна)
app.get('/api/admin/doctors', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Доступ заборонено" });

        // Витягуємо більше даних, ніж для пацієнтів (включаючи email і телефон)
        const query = `
            SELECT d.id, u.email, u.full_name, u.phone, s.id as specialization_id, s.name as specialization, d.bio, d.cabinet_number 
            FROM doctors d 
            JOIN users u ON d.user_id = u.id 
            JOIN specializations s ON d.specialization_id = s.id
            ORDER BY u.full_name
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// 17. Оновити дані лікаря
app.put('/api/admin/doctors/:id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Доступ заборонено" });

        const { id } = req.params; // ID лікаря
        const { fullName, phone, specializationId, bio, cabinetNumber } = req.body;

        await client.query('BEGIN');

        // 1. Отримуємо user_id цього лікаря
        const docRes = await client.query('SELECT user_id FROM doctors WHERE id = $1', [id]);
        if (docRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Лікаря не знайдено" });
        }
        const userId = docRes.rows[0].user_id;

        // 2. Оновлюємо загальні дані (users)
        await client.query(
            'UPDATE users SET full_name = $1, phone = $2 WHERE id = $3',
            [fullName, phone, userId]
        );

        // 3. Оновлюємо специфічні дані (doctors)
        await client.query(
            'UPDATE doctors SET specialization_id = $1, bio = $2, cabinet_number = $3 WHERE id = $4',
            [specializationId, bio, cabinetNumber, id]
        );

        await client.query('COMMIT');
        res.json({ message: "Дані лікаря успішно оновлено" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
});

// 18. Видалити лікаря
app.delete('/api/admin/doctors/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Доступ заборонено" });
        
        const { id } = req.params;

        // Знаходимо user_id
        const docRes = await pool.query('SELECT user_id FROM doctors WHERE id = $1', [id]);
        if (docRes.rows.length === 0) return res.status(404).json({ message: "Лікаря не знайдено" });
        const userId = docRes.rows[0].user_id;

        // Видаляємо користувача (завдяки CASCADE лікар теж видалиться)
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        res.json({ message: "Лікаря видалено" });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
// 19. (АДМІН) Додати спеціалізацію
app.post('/api/admin/specializations', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Доступ заборонено" });
        const { name } = req.body;
        const newSpec = await pool.query('INSERT INTO specializations (name) VALUES ($1) RETURNING *', [name]);
        res.json(newSpec.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// 20. (АДМІН) Видалити спеціалізацію
app.delete('/api/admin/specializations/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Доступ заборонено" });
        const { id } = req.params;
        // Видалення (може викликати помилку, якщо є лікарі з цією спеціалізацією)
        await pool.query('DELETE FROM specializations WHERE id = $1', [id]);
        res.json({ message: "Спеціалізацію видалено" });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "Неможливо видалити: існують лікарі з цією спеціалізацією" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));