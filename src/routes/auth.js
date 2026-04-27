// Импортируем валидатор и схемы для проверки входных данных
import { validate, registerSchema, loginSchema } from "../validators/auth.js";
// Импортируем контроллеры для обработки запросов аутентификации
import { register, login, refresh, logout } from "../controllers/authController.js";
// Импортируем middleware для проверки JWT токена (нужен для logout)
import authenticate from "../middleware/authenticate.js";
// Импортируем роутер Express для создания маршрутов
import { Router } from "express";

// Создаём экземпляр роутера
const router = Router();

//маршруты аутентификаци

// Регистрация нового пользователя
// POST /api/auth/register
// Сначала валидируем тело запроса (email и пароль), затем вызываем контроллер регистрации
router.post("/register", validate(registerSchema), register);

// Вход пользователя
// POST /api/auth/login
// Валидируем данные, затем вызываем контроллер входа
router.post("/login", validate(loginSchema), login);

// Обновление токенов (refresh)
// POST /api/auth/refresh
// Проверяет refresh-токен из cookie и выдаёт новую пару токенов
router.post("/refresh", refresh);

// Выход пользователя
// POST /api/auth/logout
// Сначала проверяет access-токен (authenticate), затем отзывает refresh-токен и очищает cookie
router.post("/logout", authenticate, logout);

// Экспортируем роутер для подключения в основном файле приложения
export default router;