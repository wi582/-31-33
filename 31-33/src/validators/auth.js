// Импортируем библиотеку Joi для валидации данных (схемы и правила)
import Joi from "joi";
// Импортируем класс операционных ошибок для возврата ошибок валидации
import AppError from "../utils/appError.js";

//схемы валидации
// Определяем правила проверки данных для регистрации
const registerSchema = Joi.object({
    email: Joi.string().email().required(),   // email: строка, формат email, обязательное поле
    password: Joi.string().min(8).required(), // пароль: строка, минимум 8 символов, обязательное поле
});

// Определяем правила проверки данных для входа (аналогично регистрации)
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

// Принимает схему Joi и возвращает middleware-функцию для Express
export function validate(schema) {
    return (req, res, next) => {
        // Валидируем тело запроса (req.body) по переданной схеме
        const { error } = schema.validate(req.body);
        
        // Если есть ошибка валидации
        if (error) {
            // Передаём ошибку в следующий middleware (errorHandler)
            // Берём первое сообщение об ошибке из деталей Joi
            return next(new AppError(error.details[0].message, 400));
        }
        
        // Если ошибок нет — идём дальше к контроллеру
        next();
    };
}

// Экспортируем схемы для использования в роутах
export { registerSchema, loginSchema };