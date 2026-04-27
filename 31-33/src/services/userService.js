// Импортируем функции для работы с пользователями из модели 
import {
    getAllUsers as getAllUsersModel, // Переименовываем, чтобы избежать конфликта имен
    findUserById,                    // Функция поиска пользователя по ID
} from "../models/user.model.js";

// Получить список всех пользователей
export async function getAllUsers() {
    return getAllUsersModel(); // Вызываем модель и возвращаем результат
}

// Получить пользователя по его ID
export async function getUserById(id) {
    return findUserById(id); // Вызываем модель и возвращаем найденного пользователя (или null)
}