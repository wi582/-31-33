// Импортируем класс операционных ошибок для случая "пользователь не найден"
import AppError from "../utils/appError.js";
// Импортируем все функции сервисного слоя для работы с пользователями
import * as userService from "../services/userService.js";

//  ПОЛУЧИТЬ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ 
export async function getAllUsers(req, res, next) {
    try {
        // Запрашиваем список всех пользователей через сервис
        const users = await userService.getAllUsers();
        // Отправляем успешный ответ со статусом 200 и массивом пользователей
        res.status(200).json(users);
    } catch (error) {
        // Любую ошибку передаём в централизованный обработчик ошибок
        next(error);
    }
}

// ПОЛУЧИТЬ ПОЛЬЗОВАТЕЛЯ ПО ID 
export async function getUserById(req, res, next) {
    try {
        // Получаем ID из параметров URL (например, /users/:id)
        const user = await userService.getUserById(req.params.id);
        
        // Если пользователь не найден — возвращаем ошибку 404 (Not Found)
        if (!user) return next(new AppError("Пользователь не найден", 404));
        
        // Если найден — отправляем данные пользователя со статусом 200
        res.status(200).json(user);
    } catch (error) {
        // Передаём ошибку в обработчик
        next(error);
    }
}