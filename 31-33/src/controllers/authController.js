// Импорт зависимостей
import * as authService from "../services/authService.js"; // Функции аутентификации
import jwt from "jsonwebtoken";           // Работа с JWT токенами
import config from "../config.js";        // Конфигурация приложения
import AppError from "../utils/appError.js"; // Операционные ошибки
// регистрация
export async function register(req, res, next) {
    try {
        // Извлекаем email и пароль из тела запроса
        const { email, password } = req.body;
        // Вызываем сервис регистрации, получаем ID нового пользователя
        const userId = await authService.register(email, password);
        // Отправляем ответ со статусом 201 (Created)
        res.status(201).json({ 
            message: "Пользователь успешно зарегистрирован", 
            userId 
        });
    } catch (error) {
        // Любую ошибку передаём в централизованный обработчик
        next(error);
    }
}

// вход
export async function login(req, res, next) {
    try {
        // Извлекаем email и пароль из тела запроса
        const { email, password } = req.body;
        // Проверяем учетные данные, получаем данные пользователя
        const user = await authService.login(email, password);
        
        // Генерация ACCESS-токена (короткоживущий)
        const accessToken = jwt.sign(
            { id: user.id, role: user.role },   // Полезная нагрузка (payload)
            config.jwt.secret,                  // Секретный ключ для подписи
            { expiresIn: config.jwt.accessExpiresIn }, // Время жизни
        );
        
        // Генерация REFRESH-токена 
        const refreshToken = await authService.generateRefreshToken(user.id);
        
        // Устанавливаем accessToken в HTTP-only cookie (защита от XSS)
        res.cookie("accessToken", accessToken, config.cookie);
        
        // Устанавливаем refreshToken в cookie с увеличенным сроком жизни
        res.cookie("refreshToken", refreshToken, {
            ...config.cookie,                 // Базовые настройки 
            maxAge: config.cookie.maxAgeRefresh, // Переопределяем maxAge (7 дней вместо значения по умолчанию)
        });
        
        // Отправляем успешный ответ
        res.status(200).json({ message: "Успешный вход в систему" });
    } catch (error) {
        next(error);
    }
}

//обновление токенов
export async function refresh(req, res, next) {
    try {
        // Получаем refresh-токен из cookie (не из тела запроса)
        const rawToken = req.cookies.refreshToken;
        
        // Если токена нет — ошибка 401 (Unauthorized)
        if (!rawToken) return next(new AppError("Токен обновления отсутствует", 401));
        
        // Вызываем сервис ротации: проверяет старый токен, выдаёт новую пару
        const { accessToken, refreshToken } = await authService.rotateRefreshToken(rawToken);
        
        // Обновляем cookie с новыми токенами
        res.cookie("accessToken", accessToken, config.cookie);
        res.cookie("refreshToken", refreshToken, {
            ...config.cookie,
            maxAge: config.cookie.maxAgeRefresh,
        });
        
        res.status(200).json({ message: "Токены обновлены" });
    } catch (error) {
        next(error);
    }
}

// выход
export async function logout(req, res, next) {
    try {
        // Получаем refresh-токен из cookie
        const rawToken = req.cookies.refreshToken;
        
        // Если токен существует — удаляем его из базы данных (отзыв)
        if (rawToken) await authService.revokeRefreshToken(rawToken);
        
        // Очищаем cookie на клиенте (удаляем оба токена)
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        
        res.status(200).json({ message: "Выход выполнен" });
    } catch (error) {
        next(error);
    }
}