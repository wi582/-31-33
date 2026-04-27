// Импортируем библиотеку JSON Web Token для верификации токенов
import jwt from "jsonwebtoken";
// Импортируем конфигурацию приложения (нужен секретный ключ JWT)
import config from "../config.js";
// Импортируем класс операционных ошибок
import AppError from "../utils/appError.js";

// Middleware для аутентификации пользователя по JWT токену
export default function authenticate(req, res, next) {
    // Извлекаем accessToken из cookie (не из заголовка Authorization)
    const token = req.cookies.accessToken;
    
    // Если токен отсутствует — пользователь не авторизован
    if (!token) return next(new AppError("Вы не авторизованы", 401));
    
    try {
        // Верифицируем токен с помощью секретного ключа
        // Если токен валиден и не истёк — возвращает расшифрованные данные (payload)
        const decoded = jwt.verify(token, config.jwt.secret);
        
        // Сохраняем расшифрованные данные в объект запроса
        // Теперь в последующих middleware и контроллерах доступен req.user
        // (например, req.user.id, req.user.role)
        req.user = decoded;
        
        // Переходим к следующему middleware / контроллеру
        next();
    } catch (error) {
        // Если токен недействительный, повреждён или истёк
        return next(new AppError("Недействительный или истекший токен", 401));
    }
}