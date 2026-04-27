// Импортируем подключение к базе данных
import db from "../db/db.js";

//Функции для работы с пользователями

// Найти пользователя по email 
export async function findUserByEmail(email) {
    // prepare — подготовка запроса (защита от SQL-инъекций)
    const query = db.prepare("SELECT * FROM users WHERE email = ?");
    // query.get — возвращает первую найденную строку или undefined
    return query.get(email) || null; // Возвращаем null, если пользователь не найден
}

// Создать нового пользователя
export async function createUser(email, passwordHash, role) {
    const query = db.prepare(
        "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
    );
    // query.run — выполняет запрос (для INSERT/UPDATE/DELETE)
    const result = query.run(email, passwordHash, role);
    return result.lastInsertRowid; // Возвращаем ID созданного пользователя
}

// Найти пользователя по ID (без пароля — только публичные поля)
export async function findUserById(id) {
    const query = db.prepare(
        "SELECT id, email, role, created_at, last_login FROM users WHERE id = ?"
    );
    return query.get(id) || null;
}

// Получить всех пользователей (без паролей — для админ-панели)
export async function getAllUsers() {
    const query = db.prepare(
        "SELECT id, email, role, created_at, last_login FROM users"
    );
    return query.all(); // query.all — возвращает все строки результата
}

//Функции для работы с refresh-токенами

// Сохранить refresh-токен для пользователя
export async function saveRefreshToken(userId, tokenHash, expiresAt) {
    const query = db.prepare(
        "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)"
    );
    query.run(userId, tokenHash, expiresAt); // Выполняем вставку
}

// Найти refresh-токен по его хешу (при проверке)
export async function findRefreshToken(tokenHash) {
    const query = db.prepare(
        "SELECT * FROM refresh_tokens WHERE token_hash = ?"
    );
    return query.get(tokenHash) || null;
}

// Удалить конкретный refresh-токен (при выходе или ротации)
export async function deleteRefreshToken(tokenHash) {
    const query = db.prepare("DELETE FROM refresh_tokens WHERE token_hash = ?");
    query.run(tokenHash);
}

// Удалить ВСЕ refresh-токены пользователя (при смене пароля или принудительном выходе со всех устройств)
export async function deleteAllRefreshTokensForUser(userId) {
    const query = db.prepare("DELETE FROM refresh_tokens WHERE user_id = ?");
    query.run(userId);
}