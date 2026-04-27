// Загружаем переменные окружения из файла .env в process.env
import "dotenv/config";
// Импортируем настроенное Express приложение (из src/app.js)
import app from "./src/app.js";
// Импортируем конфигурацию (порт сервера и другие настройки)
import config from "./src/config.js";
// Импортируем подключение к базе данных (инициализируется при импорте)
import db from "./src/db/db.js";

// Функция для запуска сервера (асинхронная, хотя в данном случае асинхронных операций нет)
const startServer = async () => {
    try {
        // Запускаем Express сервер на указанном порту
        app.listen(config.port, () => {
            // Колбэк вызывается после успешного запуска сервера
            console.log(`Сервер запущен на http://localhost:${config.port}`);
            console.log(`Документация доступна на http://localhost:${config.port}/api/docs`);
        });
    } catch (err) {
        // Если запуск не удался (например, порт занят или ошибка доступа)
        console.error("Не удалось запустить сервер:", err);
    }
};

// Запускаем сервер
startServer();