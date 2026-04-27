// Импортируем Express для создания веб-сервера
import express from "express";
// Импортируем конфигурацию приложения 
import config from "./config.js";
// Helmet — защищает приложение, устанавливая безопасные HTTP-заголовки
import helmet from "helmet";
// CORS — настройка кросс-доменных запросов
import cors from "cors";
// rateLimit — ограничение количества запросов 
import rateLimit from "express-rate-limit";
// Cookie-parser — парсинг куки из запросов
import cookieParser from "cookie-parser";
// Централизованный обработчик ошибок
import errorHandler from "../middleware/errorHandler.js";
// Роутер для аутентификации 
import authRouter from "../routes/auth.js";
// Роутер для работы с пользователями 
import usersRouter from "../routes/users.js";
// Swagger — документация API
import { swaggerUi, spec } from "../docs/swagger.js";

// Создаём экземпляр Express приложения
const app = express();

// настройка лимита запросов
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Временное окно: 15 минут 
    max: 100,                 // Максимум 100 запросов с одного IP за окно
});


// 1. Helmet — защита HTTP-заголовков (предотвращает XSS, кликджекинг и т.д.)
app.use(helmet());

// 2. CORS — разрешаем кросс-доменные запросы с настройками из конфига
app.use(cors(config.cors));

// 3. Cookie-parser — читает куки и добавляет req.cookies
app.use(cookieParser());

// 4. JSON парсер — автоматически преобразует JSON из тела запроса в JS объект
app.use(express.json());

// Аутентификация (регистрация, вход, refresh, выход)
// Применяем rateLimit только к маршрутам /api/auth (защита от брутфорса)
app.use("/api/auth", limiter, authRouter);

// Управление пользователями (только для админов, аутентификация внутри роутера)
app.use("/api/users", usersRouter);

// Документация Swagger (доступна по адресу /api/docs)
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec));

// ----- ОБРАБОТКА ОШИБОК (должен быть ПОСЛЕ всех маршрутов) -----
app.use(errorHandler);

// Экспортируем настроенное приложение (запуск в отдельном файле — server.js)
export default app;