// Импортируем роутер Express для создания маршрутов
import { Router } from "express";
// Импортируем контроллеры для работы с пользователями
import { getAllUsers, getUserById } from "../controllers/userController.js";
// Импортируем middleware аутентификации (проверяет JWT токен)
import authenticate from "../middleware/authenticate.js";
// Импортируем middleware авторизации (проверяет роли)
import authorize from "../middleware/authorize.js";

// Создаём экземпляр роутера
const router = Router();

// ----- ПРИМЕНЕНИЕ MIDDLEWARE КО ВСЕМ МАРШРУТАМ ВНУТРИ ЭТОГО РОУТЕРА -----
// Все запросы к /users сначала проходят через аутентификацию
// и затем через авторизацию — доступ только для пользователей с ролью "admin"
router.use(authenticate, authorize("admin"));

// ----- МАРШРУТЫ ДЛЯ РАБОТЫ С ПОЛЬЗОВАТЕЛЯМИ (ТОЛЬКО ДЛЯ АДМИНОВ) -----

// GET /users — получить список всех пользователей
router.get("/", getAllUsers);

// GET /users/:id — получить пользователя по его ID
router.get("/:id", getUserById);

// Экспортируем роутер для подключения в основном файле приложения
export default router;