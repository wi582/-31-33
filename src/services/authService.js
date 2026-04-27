// Импорт зависимостей
import bcrypt from "bcryptjs";         
import crypto from "crypto";      
import AppError from "../utils/appError.js";     
import { 
    findUserByEmail, createUser, saveRefreshToken, 
    findRefreshToken, deleteRefreshToken, findUserById 
} from "../models/user.model.js";        // Функции работы с БД
import config from "./config.js";        // Конфигурация приложения
import jwt from "jsonwebtoken";          // Библиотека для работы с JWT токенами

//регистрация
export async function register(email, password) {
    // Проверяем, существует ли пользователь с таким email
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        // Если существует — выбрасываем ошибку 400 (Bad Request)
        throw new AppError("Электронный адрес уже используется.", 400);
    }
    // Хешируем пароль: 12 раундов соли (хороший баланс безопасности и производительности)
    const passwordHash = await bcrypt.hash(password, 12);
    // Создаём пользователя с ролью "user" по умолчанию
    return await createUser(email, passwordHash, "user");
}

// вход
export async function login(email, password) {
    // Ищем пользователя по email
    const user = await findUserByEmail(email);
    if (!user) {
        // Не уточняем, чего именно нет
        throw new AppError("Неверный электронный адрес или пароль.", 401);
    }
    // Сравниваем введённый пароль с хешем из БД
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
        throw new AppError("Неверный электронный адрес или пароль.", 401);
    }
    // Возвращаем данные пользователя (без пароля, т.к. SELECT не включал password_hash)
    return user;
}

//генерация refresh токена
export async function generateRefreshToken(userId) {
    //Генерируем случайный сырой токен
    const rawToken = crypto.randomBytes(64).toString("hex");
    
    //Хешируем токен (SHA-256) перед сохранением в БД
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    
    //Устанавливаем срок действия: текущее время + 7 дней
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    //Сохраняем хеш токена в БД
    await saveRefreshToken(userId, tokenHash, expiresAt);
    
    //Возвращаем сырой токен клиенту (только он знает оригинал)
    return rawToken;
}

//обновление access-токена
export async function rotateRefreshToken(rawToken) {
    //Хешируем полученный сырой токен для поиска в БД
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const stored = await findRefreshToken(tokenHash);
    
    //существует ли токен и не истёк ли он
    if (!stored || new Date(stored.expires_at) < new Date()) {
        throw new AppError("Недействительный или истёкший токен обновления", 401);
    }
    
    //Удаляем старый refresh-токен 
    await deleteRefreshToken(tokenHash);
    
    //Находим пользователя по ID из сохранённого токена
    const user = await findUserById(stored.user_id);
    if (!user) throw new AppError("Пользователь не найден", 401);
    
    //Генерируем НОВЫЙ access-токен 
    const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        config.jwt.secret,                    // Секретный ключ для подписи
        { expiresIn: config.jwt.accessExpiresIn } // Время жизни access-токена
    );
    
    //Генерируем НОВЫЙ refresh-токен 
    const newRawRefreshToken = await generateRefreshToken(user.id);
    
    //Возвращаем пару токенов клиенту
    return { accessToken, refreshToken: newRawRefreshToken };
}

//выход пользователя
export async function revokeRefreshToken(rawToken) {
    // Хешируем сырой токен и удаляем его из БД
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    await deleteRefreshToken(tokenHash);
}