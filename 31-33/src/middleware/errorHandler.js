// Middleware для централизованной обработки ошибок в Express
// err — объект ошибки, req — запрос, res — ответ, next — следующая middleware
const errorHandler = (err, req, res, next) => {
    // Проверяем, является ли ошибка операционной (ожидаемой)
    if (err.isOperational) {
        // Отправляем клиенту статус-код из ошибки и сообщение
        return res.status(err.statusCode).json({
            status: "error",      
            message: err.message  // конкретное сообщение об ошибке
        });
    }
    
    // Если ошибка НЕ операционная логируем полную ошибку в консоль для отладки 
    console.error("Необработанная ошибка:", err);
    
    // Отправляем общее сообщение клиенту 
    res.status(500).json({
        status: "error",
        message: "Что-то пошло не так. Пожалуйста, попробуйте позже."
    });
};

// Экспортируем middleware для использования в Express приложении
export default errorHandler;