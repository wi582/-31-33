// Импортируем библиотеку better-sqlite3 для работы с SQLite базой данных
import Database from "better-sqlite3";
// Импортируем конфигурацию приложения 
import config from "../config.js";

// Создаем экземпляр подключения к базе данных
const db = new Database(config.db.path, {
    // В режиме разработки выводим все SQL-запросы в консоль для отладки
    verbose: config.nodeEnv === "development" ? console.log : undefined,
});
// PRAGMA — специальная команда SQLite для настройки базы данных
db.pragma("foreign_keys = ON");

// Выполняем несколько SQL-запросов для инициализации структуры БД
db.exec(`
    -- Таблица пользователей
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,   -- уникальный ID пользователя
        email TEXT NOT NULL UNIQUE,              -- email (логин), уникальный
        password_hash TEXT NOT NULL,             -- хеш пароля (никогда не храним пароль в открытом виде)
        role TEXT NOT NULL DEFAULT 'user',       -- роль: 'user' или 'admin'
        created_at TEXT NOT NULL DEFAULT (datetime('now')), -- дата регистрации
        updated_at TEXT NOT NULL DEFAULT (datetime('now')), -- дата последнего обновления
        last_login TEXT                          -- дата последнего входа
    );

    -- Таблица refresh-токенов (для долгосрочной сессии)
    CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- связь с пользователем
        token_hash TEXT NOT NULL UNIQUE,        -- хеш refresh-токена (не храним сам токен)
        expires_at TEXT NOT NULL,               -- дата истечения токена
        created_at TEXT NOT NULL DEFAULT (datetime('now')) -- дата создания
    );

    -- Индекс для быстрого поиска пользователя по email
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    
    -- Индекс для быстрого поиска refresh-токена по хешу
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
`);

// Выводим сообщение об успешной инициализации БД (с указанием пути к файлу)
console.log(`БД инициализирована: ${config.db.path}`);

// Экспортируем объект БД для использования в других модулях
export default db;