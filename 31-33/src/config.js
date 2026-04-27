// Загружаем переменные окружения из файла .env в process.env
import "dotenv/config";
// Импортируем утилиту для генерации секретных ключей (только для разработки)
import generateSecret from "./utils/generateSecret.js";

// Объект конфигурации приложения со значениями по умолчанию
const config = {
    // Порт, на котором будет запущен сервер
    port: process.env.PORT || 3000,

    // Настройки JSON Web Token (JWT) для аутентификации
    jwt: {
        // Секретный ключ для подписи токенов (в продакшене ОБЯЗАН быть в .env)
        secret: process.env.JWT_SECRET || generateSecret("JWT_SECRET"),
        // Время жизни access-токена (по умолчанию 15 минут)
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
        // Время жизни refresh-токена (по умолчанию 7 дней)
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },

    // Настройки cookie 
    cookie: {
        // Флаг secure: true для HTTPS в продакшене (берется из .env)
        secure: process.env.COOKIE_SECURE === "true",
        // strict — защита от CSRF, cookie отправляется только с того же сайта
        sameSite: "strict",
        // httpOnly — запрещает доступ к cookie из JavaScript (защита от XSS)
        httpOnly: true,
        // Максимальный возраст refresh-токена в миллисекундах (7 дней)
        maxAgeRefresh: 7 * 24 * 60 * 60 * 1000,
    },

    // Настройки CORS (Cross-Origin Resource Sharing)
    cors: {
        // Разрешенный источник запросов (для React/Vite по умолчанию)
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        // Разрешить отправку cookie через CORS
        credentials: true,
    },

    // Настройки базы данных (SQLite)
    db: {
        // Путь к файлу базы данных
        path: process.env.DB_PATH || "./database.db",
    },

    // Текущее окружение: development, production, test и т.д.
    nodeEnv: process.env.NODE_ENV || "development",
};

// Экспортируем конфигурацию для использования в других модулях
export default config;